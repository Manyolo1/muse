import dotenv from 'dotenv';
dotenv.config();

export async function categoriseThought(thought, themeNames) {
  const prompt = `
User thought: "${thought}"

Available themes: ${themeNames.join(", ")}

Please respond with ONLY the theme name that best fits the user’s thought, or "None" if no suitable theme exists.
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  return text || 'None';
}
