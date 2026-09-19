/**
 * The one size bound both ends of the link enforce.
 *
 * A2A puts no ceiling on message text, and something has to: an agent runtime
 * hands the caller's words to a durable workflow, and a workflow's parameters
 * have a platform size limit. The receiving side refuses text past the bound,
 * which is what makes the bound a value the *sending* side has to know too.
 *
 * Where that bit: a person answers a question the gatekeeper asked on an agent's
 * behalf, the gatekeeper marks the question answered and forwards the text, and
 * the agent refuses it. The question is spent and the answer is nowhere, so
 * there is nothing to retry — the only repair is to ask again. Checked before
 * the answer is accepted, the same text is a sentence asking for a shorter one.
 *
 * It lives here rather than in `./hitl.ts` because the bound is on any message
 * text crossing between a gatekeeper and an agent; a human's answer is one such
 * message.
 */

/**
 * Maximum **UTF-8 bytes** of the text a single message carries.
 *
 * How it is measured is as much of the agreement as the number: take every
 * `text` part in order, concatenate the values with **no separator**, trim
 * leading and trailing whitespace from the result, and encode that as UTF-8. The
 * bound is the byte length of the whole, never of any one part.
 *
 * Each clause fails differently. Count UTF-16 code units instead of bytes and
 * the two sides part only where the encoded size straddles the bound — on the
 * largest messages anyone sends and nowhere else, so the disagreement arrives
 * already rare and hard to reproduce. Skip the trim and a sender refuses a
 * whitespace-padded message the receiver would have taken. Join the parts with a
 * newline and every multi-part message measures long.
 *
 * Text only; file and data parts are bounded by whatever carries them. Changing
 * this number is a wire change and takes a minor.
 */
export const MAX_MESSAGE_TEXT_BYTES = 256 * 1024;
