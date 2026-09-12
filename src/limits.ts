/**
 * The one size bound both ends of the link enforce.
 *
 * A2A puts no ceiling on how much text a message may carry, and something has
 * to: an agent runtime hands the caller's words to a durable workflow, and a
 * workflow's parameters have a platform size limit. So the receiving side
 * refuses text past a bound — which makes the bound a value the *sending* side
 * has to know too. A gatekeeper that will send anything the far end will refuse
 * is a gatekeeper that discovers the limit by hitting it.
 *
 * It is worth being exact about where that lands. The expensive case is not the
 * refusal, it is when the refusal arrives. A person answers a question the
 * gatekeeper asked on an agent's behalf; the gatekeeper marks the question
 * answered and forwards the text; the agent refuses it. The question is now
 * spent and the answer is nowhere, so there is nothing left to retry — the only
 * repair is to ask again. Checked before the answer is accepted, the same text
 * is a sentence asking for a shorter one.
 *
 * This is not in `./hitl.ts`, though that is where it first bit. The bound is on
 * any message text crossing between a gatekeeper and an agent, and the receiving
 * side applies it to all of them; a human's answer is one such message.
 */

/**
 * Maximum **UTF-8 bytes** of the text a single message carries.
 *
 * How it is measured is as much of the agreement as the number, so in full: take
 * every `text` part in order, concatenate the values with **no separator**, trim
 * leading and trailing whitespace from the result, and encode that as UTF-8. The
 * bound is the byte length of the whole, never of any one part.
 *
 * Every clause of that is load-bearing, and each fails differently. Count UTF-16
 * code units instead of bytes and the two sides agree on almost everything —
 * they part only where the encoded size straddles the bound, which is to say on
 * the largest messages anyone sends and nowhere else, so the disagreement
 * arrives already rare and already hard to reproduce. Skip the trim and a sender
 * refuses a whitespace-padded message the receiver would have taken. Join the
 * parts with a newline and every multi-part message measures long.
 *
 * Text only. File and data parts are bounded by whatever carries them.
 *
 * ## Why adding this was a patch
 *
 * The rule in AGENTS.md is that a change here is a wire change and takes a minor,
 * because the two sides cannot interoperate across a value they spell
 * differently. Adding a value changes nothing either side already spells, so
 * there is no version of this release in which a consumer that ignores it stops
 * working. That is why it could ship as 0.4.1 and reach both consumers without
 * either editing a range.
 *
 * **Changing this number is a minor**, and the asymmetry is the point: from here
 * on it is a wire value like any other. Raise it on the sending side alone and
 * the paragraph above happens; lower it there alone and messages the far end
 * would have taken are refused for no reason.
 */
export const MAX_MESSAGE_TEXT_BYTES = 256 * 1024;
