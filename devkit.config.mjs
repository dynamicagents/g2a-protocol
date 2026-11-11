/**
 * What the devkit checkers read here, a section per checker.
 *
 * The checkers themselves are `.devkit/`, vendored from dev-agents'
 * `packages/devkit`; that package's README is the home of what each one fails
 * on and of every key below. This file is only what is this package's.
 *
 * There is no `references` section, so the reference checker is not wired here:
 * `verify:exports` and the copy's own `devkit:verify` are what this package
 * runs.
 */
export default {
  exports: {
    /**
     * The check this package exists for. `@dynamicagents/core` is the agent
     * runtime and a gatekeeper must not import it, so the two sides of the A2A
     * wire contract can only share code through something that commits its
     * consumers to nothing. "Zero dependencies" is therefore not a preference:
     * it is the property that makes the package safe for both to depend on, and
     * a promise in a README is not a mechanism. One `import { X } from "jose"`
     * and the reason to have split this out is gone, silently, in a patch
     * release.
     */
    zeroDependencies: true
  }
};
