import { describe, it, expect } from "vitest";
import { MAX_MESSAGE_TEXT_BYTES } from "./limits.js";

/**
 * A literal, not a reference, for the reason `claims.spec.ts` gives: asserting a
 * constant equals itself tests nothing, and typing the value a second time is
 * where its cost registers.
 *
 * The cost here is a person's answer. The two sides enforce this bound from
 * opposite ends — the gatekeeper before it accepts text, the agent runtime
 * before it starts a workflow on it — and a sender whose ceiling is higher than
 * the receiver's sends messages that are refused on arrival, after the question
 * they answered has already been marked answered.
 */

describe("the message text bound", () => {
  it("is the number both sides measure against", () => {
    // Spelled expanded rather than as `256 * 1024`, so this is an independent
    // statement of the value and not a copy of the expression that defines it.
    //
    // The other side of the pin is `MAX_INBOUND_TEXT_BYTES` in
    // `@dynamicagents/core`, `src/a2a/parts.ts`, which throws `InboundPartError`
    // past it. That core cannot be imported here to compare against is the whole
    // reason this constant moved into the contract.
    expect(MAX_MESSAGE_TEXT_BYTES).toBe(262144);
  });
});
