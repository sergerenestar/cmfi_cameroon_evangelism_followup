import type { SmsProvider, SmsSendResult } from "./types";

/**
 * MTN Cameroon SMS adapter.
 *
 * MTN's enterprise messaging API (commonly provisioned through MTN's
 * developer/API portal) typically authenticates with a static API key
 * plus a subscription/client ID sent as request headers, rather than
 * Orange's OAuth2 token flow — this is exactly why each carrier gets
 * its own adapter file instead of sharing one implementation.
 *
 * ── TO ACTIVATE THIS ADAPTER ──
 * 1. Get API access + an approved sender ID from your MTN Cameroon
 *    business account rep.
 * 2. Fill in the env vars below (see .env.example).
 * 3. Replace SEND_URL with the exact endpoint from MTN's API docs for
 *    your account — left as an env var since it varies by product.
 * 4. Confirm the request/response shape against their docs; the
 *    header-based API-key pattern below is standard, but field names
 *    differ by product/region.
 */
export class MtnCameroonSmsProvider implements SmsProvider {
  readonly name = "mtn_cm" as const;

  async send(to: string, message: string): Promise<SmsSendResult> {
    const apiKey = process.env.MTN_SMS_API_KEY;
    const subscriptionKey = process.env.MTN_SMS_SUBSCRIPTION_KEY;
    const senderId = process.env.MTN_SMS_SENDER_ID;
    const sendUrl = process.env.MTN_SMS_SEND_URL;

    if (!apiKey || !subscriptionKey || !senderId || !sendUrl) {
      return {
        success: false,
        error:
          "MTN SMS adapter is not configured (missing MTN_SMS_API_KEY, " +
          "MTN_SMS_SUBSCRIPTION_KEY, MTN_SMS_SENDER_ID, or MTN_SMS_SEND_URL).",
      };
    }

    try {
      const res = await fetch(sendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // NOTE: exact field names depend on your MTN messaging
          // product — confirm against your account's API documentation.
          senderId,
          recipient: to,
          message,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { success: false, error: `MTN SMS send failed: ${res.status} ${body}` };
      }

      const data = await res.json().catch(() => ({}));
      return { success: true, providerMessageId: data?.messageId };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }
}
