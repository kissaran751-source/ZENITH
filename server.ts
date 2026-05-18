import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Route for Gemini (Conversational Sugar Chat)
  app.post('/api/sugar-chat', async (req, res) => {
    try {
      const { history } = req.body;
      if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: 'Missing or invalid conversation history' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing on server' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `You are a friendly, highly intelligent nutrition assistant tracking daily sugar intake. 
The user will tell you what they consumed or upload images of nutritional labels or food. 
Your goal is to accurately calculate the total added/consumed sugar in grams.

1. If the user provides a food/drink but no quantity or portion size (e.g., 'I drank a coke'), YOU MUST ask them for the quantity (e.g., 'How many ml or cans did you have?').
2. Once you have both the item and quantity, or enough info from an image, estimate the total sugar in grams.
3. Briefly explain if the item is healthy, its sugar percentage, and any other helpful advice.

You MUST return a JSON object with this exact schema:
{
  "reply": "Your conversational response, asking for quantity or providing the final analysis.",
  "isComplete": boolean, // set to true ONLY if you have enough info to estimate the sugar in grams. False if you still need clarification.
  "estimatedGrams": number // the estimated sugar in grams. 0 if none or not complete.
}`;

      // Gemini 2.5 flash allows responseMimeType
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      let jsonStr = response.text || "{}";
      const parsed = JSON.parse(jsonStr);
      
      res.json({ result: parsed });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Gemini (Legacy - can keep for now)
  app.post('/api/analyze-sugar', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Missing text' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing on server' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a nutrition assistant. A user has reported eating/drinking the following: "${text}".
Please estimate the total sugar content in grams based on standard serving sizes and product data.
Important: Return ONLY a valid JSON object without markdown formatting. Do not include \`\`\`json.
The JSON object must match this schema:
{
  "estimatedGrams": 0,
  "explanation": "Brief explanation of how you derived this amount. (E.g. 'A typical can of cold drink has 39g of sugar.')"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let jsonStr = response.text || "{}";
      jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const parsed = JSON.parse(jsonStr);
      res.json({ result: parsed });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
