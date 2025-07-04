import { createHash } from "crypto";

/**
 * Generate a SHA-256 hash from a given string.
 * Output is a lowercase hex string.
 */
export function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
