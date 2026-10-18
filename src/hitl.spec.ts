import { describe, it, expect, expectTypeOf } from "vitest";
import {
  HITL_APPROVE_OPTION_ID,
  HITL_QUESTION_KINDS,
  HITL_REJECT_OPTION_ID,
  HITL_REQUEST_TYPE,
  HITL_RESPONSE_TYPE,
  HITL_TIMEOUT_TYPE,
  type HitlAnswer,
  type HitlQuestion,
  type HitlQuestionKind,
  type HitlRequestData,
  type HitlResponseData,
  type HitlTimeoutData
} from "./hitl.js";

/**
 * Literals, not references, for the reason `claims.spec.ts` gives: a rename has
 * to be typed twice, and the second time is when its cost registers.
 *
 * The cost here is quiet. A renamed `data.type` is a question the gatekeeper
 * posts as plain text with nothing to click, and an answer the agent does not
 * recognize as one — both builds green, and nobody ever asked.
 */

describe("the part types", () => {
  it("names the question an agent asks", () => {
    expect(HITL_REQUEST_TYPE).toBe("https://dynamicagents.dev/hitl/request");
  });

  it("names the answer a gatekeeper sends back", () => {
    expect(HITL_RESPONSE_TYPE).toBe("https://dynamicagents.dev/hitl/response");
  });

  it("names the expiry sent in place of an answer", () => {
    expect(HITL_TIMEOUT_TYPE).toBe("https://dynamicagents.dev/hitl/timeout");
  });

  it("keeps every type under a host Dynamic Agents owns", () => {
    // The rule the spellings above are instances of. An unnamespaced type, or
    // one under a host somebody else controls, reads to the other side as no
    // type at all: a question posted as plain text with nothing to click.
    for (const type of [
      HITL_REQUEST_TYPE,
      HITL_RESPONSE_TYPE,
      HITL_TIMEOUT_TYPE
    ])
      expect(type.startsWith("https://dynamicagents.dev/")).toBe(true);
  });
});

describe("what can be asked", () => {
  it("asks for a choice, words, or an approval", () => {
    expect(HITL_QUESTION_KINDS).toEqual(["choice", "text", "approval"]);
    expectTypeOf<HitlQuestionKind>().toEqualTypeOf<
      "choice" | "text" | "approval"
    >();
  });

  it("reads an approval's answer by these option ids", () => {
    expect(HITL_APPROVE_OPTION_ID).toBe("approve");
    expect(HITL_REJECT_OPTION_ID).toBe("reject");
  });
});

describe("the part shapes", () => {
  // The smallest part of each kind a side sends. A field made required, or
  // renamed, fails here rather than in the other side's build.
  it("takes a request of several questions, one of each kind", () => {
    expectTypeOf<{
      type: "https://dynamicagents.dev/hitl/request";
      requestId: string;
      questions: [
        {
          kind: "choice";
          id: string;
          prompt: string;
          options: { id: string; label: string }[];
        },
        { kind: "text"; id: string; prompt: string },
        {
          kind: "approval";
          id: string;
          prompt: string;
          artifact: { id: string; url: string };
        }
      ];
    }>().toExtend<HitlRequestData>();
  });

  it("takes an option's description and example, and a choice of many", () => {
    expectTypeOf<{
      kind: "choice";
      id: string;
      prompt: string;
      header: string;
      multiple: true;
      options: {
        id: string;
        label: string;
        description: string;
        example: string;
      }[];
    }>().toExtend<HitlQuestion>();
  });

  it("refuses an approval with nothing to look at", () => {
    expectTypeOf<{
      kind: "approval";
      id: string;
      prompt: string;
    }>().not.toExtend<HitlQuestion>();
    expectTypeOf<{
      kind: "approval";
      id: string;
      prompt: string;
      artifact: { id: string };
    }>().not.toExtend<HitlQuestion>();
  });

  it("takes answers picked, typed, or both, keyed by question", () => {
    expectTypeOf<{ optionIds: [string] }>().toExtend<HitlAnswer>();
    expectTypeOf<{ optionIds: [string, string] }>().toExtend<HitlAnswer>();
    expectTypeOf<{ text: string }>().toExtend<HitlAnswer>();
    expectTypeOf<{
      optionIds: [string, ...string[]];
      text: string;
    }>().toExtend<HitlAnswer>();
    expectTypeOf<{
      type: "https://dynamicagents.dev/hitl/response";
      requestId: string;
      answeredBy: string;
      answers: Record<string, { optionIds: [string] } | { text: string }>;
    }>().toExtend<HitlResponseData>();
  });

  it("refuses an answer that carries neither an option nor text", () => {
    expectTypeOf<{ optionIds?: undefined }>().not.toExtend<HitlAnswer>();
    // No option picked is no option, however it is spelled: an empty list,
    // or a list the type cannot promise is not empty.
    expectTypeOf<{ optionIds: [] }>().not.toExtend<HitlAnswer>();
    expectTypeOf<{ optionIds: string[] }>().not.toExtend<HitlAnswer>();
    expectTypeOf<{
      type: "https://dynamicagents.dev/hitl/response";
      requestId: string;
      answeredBy: string;
    }>().not.toExtend<HitlResponseData>();
  });

  it("takes an expiry that names only the question", () => {
    expectTypeOf<{
      type: "https://dynamicagents.dev/hitl/timeout";
      requestId: string;
    }>().toExtend<HitlTimeoutData>();
  });
});
