const FEATHERLESS_API_KEY = 'rc_82ef6597804cb6b2ab383a3b60d9d088c29c0a45e06d567d512066fbc7e70dcc';
const FEATHERLESS_API_URL = 'https://api.featherless.ai/v1/chat/completions';
const FEATHERLESS_MODEL = 'meta-llama/Meta-Llama-3.1-8B-Instruct';

export async function askAI(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 300,
): Promise<string> {
  const res = await fetch(FEATHERLESS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FEATHERLESS_API_KEY}`,
    },
    body: JSON.stringify({
      model: FEATHERLESS_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}
