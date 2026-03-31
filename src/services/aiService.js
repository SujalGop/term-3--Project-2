const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function askGemini(prompt) {
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await response.json();
  if (!response.ok || !data.candidates) throw new Error(data.error?.message || 'Unknown API error');
  return data.candidates[0].content.parts[0].text;
}

// Strip markdown code fences and parse the JSON array from the response
function parseJSON(raw = '') {
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    console.error('[aiService] JSON parse failed:', raw);
    return [];
  }
}

export async function generateSummary(text, options = {}) {
  const { subject = '', level = 'detailed' } = options;
  const prompt =
    `You are an expert academic tutor${subject ? ` specialising in ${subject}` : ''}. ` +
    `Summarise the following study material at a ${level} level using markdown with headings and bullet points.\n\n${text}`;
  return askGemini(prompt);
}

export async function generateFlashcards(topic, options = {}) {
  const { count = 10, subject = '' } = options;
  const prompt =
    `You are a flashcard generator${subject ? ` for ${subject}` : ''}. ` +
    `Return ONLY a valid JSON array of ${count} objects, each with "front" and "back" string keys. ` +
    `No markdown fences, no extra text — pure JSON only.\n\nTopic: "${topic}"`;
  return parseJSON(await askGemini(prompt));
}

export async function generateQuiz(topic, options = {}) {
  const { count = 5, subject = '', difficulty = 'medium' } = options;
  const prompt =
    `You are a quiz creator${subject ? ` for ${subject}` : ''}. ` +
    `Return ONLY a valid JSON array of ${count} question objects with keys: ` +
    `"question", "options" (array of 4 strings), "answer" (must match one option exactly), "explanation". ` +
    `Difficulty: ${difficulty}. No markdown fences, pure JSON only.\n\nTopic: "${topic}"`;
  return parseJSON(await askGemini(prompt));
}

export async function generateStudyPlan(subject, options = {}) {
  const { weeks = 4, hoursPerDay = 2 } = options;
  const prompt =
    `You are a personal academic coach. Create a practical ${weeks}-week study plan ` +
    `for "${subject}" with ${hoursPerDay} hours/day. Respond in structured markdown.`;
  return askGemini(prompt);
}