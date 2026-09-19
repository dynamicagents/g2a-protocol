/**
 * The push-notification callback hop — agent back to the issuer.
 *
 * The A2A async contract has two legs. The issuer dispatches `SendMessage` with
 * a `taskPushNotificationConfig` (a webhook `url` and a validation `token`), the
 * agent accepts immediately with a `submitted` Task, and later POSTs the
 * terminal Task to that webhook. This module holds the one value both ends of
 * that second leg must spell identically.
 */

/**
 * Header carrying the per-task validation `token` from the
 * `taskPushNotificationConfig`, echoed verbatim on the callback so the issuer
 * can correlate it to the pending task it created.
 *
 * This is the SDK's own default, not a Dynamic Agents choice, so by ownership it
 * fails the rule against redeclaring what the protocol fixes. The exception is
 * mechanical: **the SDK does not export it** — it exists only as an inline
 * fallback — so neither consumer could import it and both declared it, each with
 * a comment saying it had to match the other. If the SDK ever exports it, delete
 * this in favour of that.
 *
 * Spelled lowercase against the SDK's `X-A2A-Notification-Token`, which changes
 * no bytes: HTTP field names are case-insensitive (RFC 9110 §5.1), `Headers`
 * normalizes on set and get, and HTTP/2 requires lowercase on the wire anyway.
 *
 * The SDK marks the token-header mechanism `@deprecated` in favour of
 * `pushConfig.authentication`. Holding the spelling in one place is what makes
 * migrating off it one coordinated change rather than two.
 */
export const NOTIFICATION_TOKEN_HEADER = "x-a2a-notification-token";
