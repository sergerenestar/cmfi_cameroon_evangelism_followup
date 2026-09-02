import { detectCarrier } from "./carrier-detect";
import { OrangeCameroonSmsProvider } from "./orange";
import { MtnCameroonSmsProvider } from "./mtn";
import type { SmsProvider, SmsSendResult } from "./types";

const orange = new OrangeCameroonSmsProvider();
const mtn = new MtnCameroonSmsProvider();

/**
 * Sends an SMS, automatically routing to the Orange or MTN Cameroon
 * adapter based on the recipient's number. This is the only function
 * the rest of the app (e.g. an admin "send SMS" action) should call —
 * it never needs to know which carrier handled it.
 *
 * Override auto-detection by passing `forceProvider`, e.g. if a
 * counselor manually confirms the convert's carrier.
 */
export async function sendSms(
  to: string,
  message: string,
  forceProvider?: "orange_cm" | "mtn_cm"
): Promise<SmsSendResult & { provider: string }> {
  const carrier = forceProvider ?? detectCarrier(to);

  const providerByCarrier: Record<string, SmsProvider | undefined> = {
    orange_cm: orange,
    mtn_cm: mtn,
  };

  const provider = providerByCarrier[carrier];

  if (!provider) {
    return {
      success: false,
      provider: "none",
      error: `Could not determine carrier for ${to}. Pass forceProvider explicitly.`,
    };
  }

  const result = await provider.send(to, message);
  return { ...result, provider: provider.name };
}
