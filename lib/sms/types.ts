/**
 * Common contract every carrier adapter implements.
 *
 * Orange Cameroon and MTN Cameroon each expose their own enterprise
 * SMS gateway with different auth schemes (typically OAuth2 client
 * credentials or an API-key + HMAC signature) and different request
 * shapes. Nothing outside lib/sms/ should know which carrier is
 * being used — callers just call `sendSms()` from lib/sms/index.ts.
 */
export interface SmsSendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface SmsProvider {
  /** Human-readable name, used in logs and the contact_log table. */
  readonly name: "orange_cm" | "mtn_cm";

  /**
   * Send a single SMS.
   * @param to Phone number in international format, e.g. +237699518339
   * @param message Plain text body
   */
  send(to: string, message: string): Promise<SmsSendResult>;
}
