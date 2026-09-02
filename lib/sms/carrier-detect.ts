/**
 * Maps a Cameroonian mobile number to the carrier that should deliver
 * its SMS. Cameroon's numbering plan has shifted prefixes between
 * carriers more than once, so treat this list as a starting point —
 * verify current prefix ranges with Orange/MTN before relying on it,
 * and update PREFIX_MAP below as needed. This is intentionally a
 * plain data structure (not hardcoded logic) so it's a one-line edit.
 */
export type Carrier = "orange_cm" | "mtn_cm" | "unknown";

// Prefix → carrier, checked longest-prefix-first against the number
// immediately after the +237 country code.
const PREFIX_MAP: Record<string, Carrier> = {
  "69": "orange_cm",
  "655": "orange_cm",
  "656": "orange_cm",
  "657": "orange_cm",
  "658": "orange_cm",
  "659": "orange_cm",
  "67": "mtn_cm",
  "650": "mtn_cm",
  "651": "mtn_cm",
  "652": "mtn_cm",
  "653": "mtn_cm",
  "654": "mtn_cm",
  "68": "mtn_cm",
};

export function detectCarrier(rawPhone: string): Carrier {
  const digits = rawPhone.replace(/[^\d]/g, "");
  // Strip a leading country code (237) if present, so we're left with
  // the 9-digit local number.
  const local = digits.startsWith("237") ? digits.slice(3) : digits;

  const candidates = Object.keys(PREFIX_MAP).sort((a, b) => b.length - a.length);
  for (const prefix of candidates) {
    if (local.startsWith(prefix)) return PREFIX_MAP[prefix];
  }
  return "unknown";
}
