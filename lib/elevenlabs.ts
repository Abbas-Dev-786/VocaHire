const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_AGENT_BASE_URL =
  process.env.ELEVENLABS_AGENT_BASE_URL || "https://api.elevenlabs.io/v1";

interface CreateCallPayload {
  agent_id: string;
  // prompt: string;
  agent_phone_number_id: string;
  to_number: string;
  metadata?: Record<string, any>;
}

export async function createVoiceCall(payload: CreateCallPayload) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/twilio/outbound-call`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": `${ELEVENLABS_API_KEY}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs call create failed: ${res.status}`);
  return res.json(); // expect { call_id, status, ... }
}
