/**
 * Human in the loop: how an agent asks a person something through its
 * gatekeeper, and how the answer comes back.
 *
 * A2A carries the exchange itself. A question rides a status update of the
 * task, and its answer arrives as a new message on that same task. A task may
 * hold several questions open, each answered on its own and matched by
 * `requestId`, and may ask while it is still `working`: `input-required` says
 * only that the agent is idle, waiting on the questions it has open. What A2A
 * leaves open is how either side finds the question or the answer inside those
 * messages: a `data` part holds whatever the two parties agree it holds. These
 * names are that agreement. Each part travels beside a `text` part saying the
 * same thing in words, so a client that knows none of this still reads
 * something sensible.
 *
 * A message on an open task that carries neither an answer nor an expiry part
 * is the next message of the same conversation: it joins the task, as more
 * input to the work already running. An agent that takes no such message, or
 * whose task has closed, refuses it with an A2A error, and the gatekeeper starts
 * a new task with it instead.
 *
 * Each name is a URI on a host Dynamic Agents owns, the way the claims in
 * `./claims.ts` are. A `data` part's `type` shares one flat namespace with every
 * other party's, so a bare word — or a host somebody else controls — is a
 * collision that surfaces only once two parties disagree about what it holds.
 *
 * What is asked is a form: one request holds every question the agent needs
 * answered, each a kind from {@link HITL_QUESTION_KINDS}, answered together. The
 * agent says what it needs to know; how a question looks is the gatekeeper's to
 * decide, as well as its surface allows — buttons, a modal, a numbered list.
 * Nothing here says how to render, so no field does either.
 *
 * The shapes map onto MCP elicitation's form schema, for a gatekeeper that is
 * also an MCP client: a `choice` is a titled enum (an array of one when
 * `multiple`), a `text` a string, an `approval` a boolean beside a string, and
 * `answers` is `content`.
 *
 * The shapes are declared as types only. Whichever side reads a part validates
 * it, with the schema library that side already carries: a validator here would
 * be behaviour, and a dependency.
 */

/**
 * `data.type` of the part an agent puts on a status update of its task to ask,
 * `working` or `input-required`.
 */
export const HITL_REQUEST_TYPE = "https://dynamicagents.dev/hitl/request";

/** `data.type` of the part a gatekeeper sends onto the asking task with the answer. */
export const HITL_RESPONSE_TYPE = "https://dynamicagents.dev/hitl/response";

/**
 * `data.type` of the part a gatekeeper sends onto the asking task instead of an
 * answer, once nobody gave one before the question expired.
 */
export const HITL_TIMEOUT_TYPE = "https://dynamicagents.dev/hitl/timeout";

/**
 * What one question asks for: a pick among options (`choice`), words
 * (`text`), or a yes or no on something to look at first (`approval`).
 *
 * A tuple as well as a type, so a reader can build its validator's enum from the
 * same list the type is derived from, rather than spelling the values again.
 */
export const HITL_QUESTION_KINDS = ["choice", "text", "approval"] as const;

export type HitlQuestionKind = (typeof HITL_QUESTION_KINDS)[number];

/**
 * The option ids of an `approval`, which names no options of its own.
 *
 * The agent reads the answer by these ids, not by the labels a person saw, so a
 * gatekeeper that renders its own Approve and Reject has to send exactly these
 * back in `optionIds`.
 */
export const HITL_APPROVE_OPTION_ID = "approve";
export const HITL_REJECT_OPTION_ID = "reject";

/** One answer a person can pick. */
export interface HitlOption {
  /** What comes back in the answer's `optionIds` when this is picked. */
  id: string;
  /** What the person picks, in a few words. */
  label: string;
  /** What picking it means. */
  description?: string;
  /**
   * Markdown: a concrete sample of what picking it produces — a snippet, a
   * draft, a layout.
   */
  example?: string;
}

/**
 * Something a person looks at before answering — a plan to approve, say.
 */
export interface HitlArtifact {
  /**
   * The agent's name for it, which the agent acts on when the answer comes back.
   * A gatekeeper has no use for it.
   */
  id: string;
  /** Where a person reads it. */
  url: string;
}

interface HitlQuestionBase {
  /** Unique within its request; the answer is keyed by it. */
  id: string;
  /** The question, as the person reads it. */
  prompt: string;
  /** A word or two naming the question, for a gatekeeper short of room. */
  header?: string;
}

/**
 * A pick among `options`. Typed words are always accepted too, in place of a
 * pick or beside it: the agent cannot know every answer in advance, so a
 * gatekeeper offers "something else" on every choice.
 */
export interface HitlChoiceQuestion extends HitlQuestionBase {
  kind: "choice";
  options: HitlOption[];
  /** Whether more than one option may be picked. */
  multiple?: boolean;
}

/** An answer in the person's own words. */
export interface HitlTextQuestion extends HitlQuestionBase {
  kind: "text";
}

/**
 * Approve or reject `artifact`, answered by {@link HITL_APPROVE_OPTION_ID} or
 * {@link HITL_REJECT_OPTION_ID}, with typed words as a comment. Words alone are
 * a comment, never an approval.
 */
export interface HitlApprovalQuestion extends HitlQuestionBase {
  kind: "approval";
  artifact: HitlArtifact;
}

export type HitlQuestion =
  HitlChoiceQuestion | HitlTextQuestion | HitlApprovalQuestion;

/** The question, as the `data` of a {@link HITL_REQUEST_TYPE} part. */
export interface HitlRequestData {
  type: typeof HITL_REQUEST_TYPE;
  /**
   * Chosen by the agent, and unique to this request. The answer names it, and
   * a gatekeeper sent the same id twice has been sent the same request twice.
   */
  requestId: string;
  /** Why the agent is asking, shown above the questions. */
  prompt?: string;
  /** At least one; answered together, in one submission. */
  questions: HitlQuestion[];
}

/**
 * One question's answer: the option ids picked, typed words, or both.
 *
 * A union rather than two optional fields, and `optionIds` a tuple of at least
 * one, because an answer carrying neither gives the reader nothing to act on,
 * and the type is the cheapest place to refuse one.
 */
export type HitlAnswer =
  | { optionIds: [string, ...string[]]; text?: string }
  | { optionIds?: undefined; text: string };

/**
 * The answer, as the `data` of a {@link HITL_RESPONSE_TYPE} part: one
 * {@link HitlAnswer} per question, keyed by the question's id.
 *
 * The response's `text` part carries the same answers in words, so the bound in
 * `./limits.ts` measures what a person typed.
 */
export interface HitlResponseData {
  type: typeof HITL_RESPONSE_TYPE;
  requestId: string;
  /** Who answered, in the gatekeeper's own terms. */
  answeredBy: string;
  answers: Record<string, HitlAnswer>;
}

/** The expiry, as the `data` of a {@link HITL_TIMEOUT_TYPE} part. */
export interface HitlTimeoutData {
  type: typeof HITL_TIMEOUT_TYPE;
  requestId: string;
}
