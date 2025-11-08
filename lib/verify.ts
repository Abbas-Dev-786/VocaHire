import crypto from "crypto";

export function verifyElevenLabsSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET!;
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signatureHeader;
}
