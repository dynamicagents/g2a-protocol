import { describe, it, expect, expectTypeOf } from "vitest";
import {
  HITL_APPROVE_OPTION_ID,
  HITL_REJECT_OPTION_ID,
  HITL_REQUEST_KINDS,
  HITL_REQUEST_TYPE,
  HITL_RESPONSE_TYPE,
  HITL_TIMEOUT_TYPE,
  type HitlRequestData,
  type HitlRequestKind,
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
    expect(HITL_REQUEST_TYPE).toBe("io.da.hitl.request");
  });

  it("names the answer a gatekeeper sends back", () => {
    expect(HITL_RESPONSE_TYPE).toBe("io.da.hitl.response");
  });

  it("names the expiry sent in place of an answer", () => {
    expect(HITL_TIMEOUT_TYPE).toBe("io.da.hitl.timeout");
  });
});

describe("what can be asked", () => {
  it("asks for an approval or a choice", () => {
    expect(HITL_REQUEST_KINDS).toEqual(["approval", "choice"]);
    expectTypeOf<HitlRequestKind>().toEqualTypeOf<"approval" | "choice">();
  });

  it("reads an approval's answer by these option ids", () => {
    expect(HITL_APPROVE_OPTION_ID).toBe("approve");
    expect(HITL_REJECT_OPTION_ID).toBe("reject");
  });
});

describe("the part shapes", () => {
  // The smallest part of each kind a side sends. A field made required, or
  // renamed, fails here rather than in the other side's build.
  it("takes an approval that names no options", () => {
    expectTypeOf<{
      type: "io.da.hitl.request";
      requestId: string;
      requestKind: "approval";
      prompt: string;
    }>().toExtend<HitlRequestData>();
  });

  it("takes an answer picked from the options, and one typed out", () => {
    expectTypeOf<{
      type: "io.da.hitl.response";
      requestId: string;
      optionId: string;
      answeredBy: string;
    }>().toExtend<HitlResponseData>();
    expectTypeOf<{
      type: "io.da.hitl.response";
      requestId: string;
      text: string;
      answeredBy: string;
    }>().toExtend<HitlResponseData>();
  });

  it("takes an expiry that names only the question", () => {
    expectTypeOf<{
      type: "io.da.hitl.timeout";
      requestId: string;
    }>().toExtend<HitlTimeoutData>();
  });
});
