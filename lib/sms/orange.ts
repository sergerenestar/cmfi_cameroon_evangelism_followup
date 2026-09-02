import type { SmsProvider, SmsSendResult } from "./types";

/**
 * Orange Cameroon SMS adapter.
 *
 * Orange's enterprise SMS API (Orange SMS API / Contact Everyone,
 * depending on which product your account is provisioned under)
 * typically authenticates with OAuth2 client-credentials: you POST
 * your client ID/secret to a token endpoint, get a bearer token, then
 * call the send endpoint with that token.
 *
 * ── TO ACTIVATE THIS ADAPTER ──
 * 1. Get API access + a sender ID approved from your Orange Cameroon
 *    business account rep — this is a contract, not a self-serve signup.
 * 2. Fill in the three env vars below (see .env.example).
 * 3. Replace TOKEN_URL and SEND_URL with the exact endpoints from
 *    Orange's API documentation for your account (these vary by
 *    product/region and are not publicly stable, so they are left
 *    as environment variables rather than hardcoded).
 * 4. Confirm the request/response shape below against their docs —
 *    the general OAuth2 + JSON POST pattern is standard, but exact
 *    field names differ by product.
 */
export class OrangeCameroonSmsProvider implements SmsProvider {
  readonly name = "orange_cm" as const;

  private async getAccessToken(): Promise<string> {
    const clientId = process.env.ORANGE_SMS_CLIENT_ID;
    const clientSecret = process.env.ORANGE_SMS_CLIENT_SECRET;
    const tokenUrl = process.env.ORANGE_SMS_TOKEN_URL;

    if (!clientId || !clientSecret || !tokenUrl) {
      throw new Error(
        "Orange SMS adapter is not configured. Set ORANGE_SMS_CLIENT_ID, " +
          "ORANGE_SMS_CLIENT_SECRET, and ORANGE_SMS_TOKEN_URL."
      );
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      throw new Error(`Orange token request failed: ${res.status}`);
    }

    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  }

  async send(to: string, message: string): Promise<SmsSendResult> {
    const senderId = process.env.ORANGE_SMS_SENDER_ID;
    const sendUrl = process.env.ORANGE_SMS_SEND_URL;

    if (!senderId || !sendUrl) {
      return {
        success: false,
        error:
          "Orange SMS adapter is not configured (missing ORANGE_SMS_SENDER_ID or ORANGE_SMS_SEND_URL).",
      };
    }

    try {
      const token = await this.getAccessToken();

      const res = await fetch(sendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // NOTE: exact field names depend on your Orange SMS product —
          // confirm against the documentation for your provisioned API.
          outboundSMSMessageRequest: {
            address: [`tel:${to}`],
            senderAddress: `tel:${senderId}`,
            outboundSMSTextMessage: { message },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { success: false, error: `Orange SMS send failed: ${res.status} ${body}` };
      }

      const data = await res.json().catch(() => ({}));
      return { success: true, providerMessageId: data?.resourceReference?.resourceURL };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }
}
