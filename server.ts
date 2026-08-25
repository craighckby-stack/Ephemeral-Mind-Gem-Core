import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

// Client resolver supporting optional custom API key header overrides
function getAIClient(req: express.Request): GoogleGenAI {
  const overrideKey = req.headers['x-gemini-key-override'] as string;
  if (overrideKey && overrideKey.trim()) {
    console.log('[EMG KERNEL] Using client-provided custom API key override.');
    return new GoogleGenAI({ apiKey: overrideKey.trim() });
  }
  return ai;
}

// Robust fallback model engine supporting thinking modes
async function generateContentWithFallback(
  client: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: any;
  }
) {
  const { contents, systemInstruction, responseMimeType, responseSchema } = params;

  const attempts = [
    {
      model: 'gemini-3.1-pro-preview',
      config: {
        thinkingConfig: { thinkingLevel: 'HIGH' as any },
        systemInstruction,
        responseMimeType,
        responseSchema,
      }
    },
    {
      model: 'gemini-2.5-pro',
      config: {
        thinkingConfig: { thinkingBudget: -1 as any },
        systemInstruction,
        responseMimeType,
        responseSchema,
      }
    },
    {
      model: 'gemini-2.5-flash',
      config: {
        thinkingConfig: { thinkingBudget: -1 as any },
        systemInstruction,
        responseMimeType,
        responseSchema,
      }
    },
    {
      model: 'gemini-1.5-flash',
      config: {
        systemInstruction,
        responseMimeType,
        responseSchema,
      }
    }
  ];

  let lastError: any = null;
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    try {
      console.log(`[EMG KERNEL] Attempting generation with model: ${attempt.model} (Attempt ${i + 1}/${attempts.length})`);
      const response = await client.models.generateContent({
        model: attempt.model,
        contents,
        config: attempt.config as any
      });
      console.log(`[EMG KERNEL] Generation success using ${attempt.model}`);
      return response;
    } catch (err: any) {
      console.warn(`[EMG KERNEL] Attempt with ${attempt.model} failed: ${err.message || err}`);
      lastError = err;
    }
  }

  throw lastError || new Error('All fallback models exhausted.');
}

// API Endpoints
app.post('/api/generate-perspective', async (req, res) => {
  try {
    const { topic, persona, relevantMemory, systemStatusContext } = req.body;
    if (!topic || !persona) {
      return res.status(400).json({ error: 'Missing topic or persona' });
    }

    const prompt = `${systemStatusContext || ''}\n\nTASK: Generate a comprehensive, well-structured analysis from a ${persona} perspective on: ${topic}. Relevant past knowledge:\n<memory>${relevantMemory || 'None'}</memory>\n\nOutput should be a detailed, multi-paragraph analysis. Do not use headings or conversational intros.`;

    const client = getAIClient(req);
    const response = await generateContentWithFallback(client, {
      contents: prompt,
      systemInstruction: `Act as a ${persona} AI kernel. Ensure the analysis is formatted as raw text, no markdown headers.`
    });

    const text = response.text || '';
    res.json({ text });
  } catch (error: any) {
    console.error('Error generating perspective:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/synthesize', async (req, res) => {
  try {
    const { topic, perspectivesText, relevantMemory, systemStatusContext } = req.body;
    if (!topic || !perspectivesText) {
      return res.status(400).json({ error: 'Missing topic or perspectives text' });
    }

    const prompt = `${systemStatusContext || ''}\n\nTASK: Synthesize multiple perspectives and memory into a cohesive, structured JSON object. The topic is: ${topic}. Perspectives:\n<perspectives>${perspectivesText}</perspectives>\nMemory:\n<memory>${relevantMemory || 'None'}</memory>\n\nYour output MUST be a valid JSON object matching the provided schema. 'synthesis_analysis' should be a detailed multi-paragraph essay. 'hypothetical_assumptions' must contain 2-3 assumptions made during analysis.`;

    const client = getAIClient(req);
    const response = await generateContentWithFallback(client, {
      contents: prompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          synthesis_analysis: { type: 'string' },
          hypothetical_assumptions: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['synthesis_analysis', 'hypothetical_assumptions']
      },
      systemInstruction: 'Act as an AI synthesizer outputting only JSON. Maintain a strictly analytical and cold tone in the synthesis analysis.'
    });

    const text = response.text || '';
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // fallback parsing in case the response includes wrapper
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(clean);
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in synthesis:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/generate-graph', async (req, res) => {
  try {
    const { topic, synthesis } = req.body;
    if (!topic || !synthesis) {
      return res.status(400).json({ error: 'Missing topic or synthesis' });
    }

    const prompt = `
TASK: Extract key concepts from the synthesis about the topic and generate a Mermaid JS graph.
The topic is: ${topic}
The synthesis is: ${synthesis}

Your output MUST be a single Mermaid JS graph block, starting with \`\`\`mermaid and ending with \`\`\`.
- Use 'graph TD' (top-down).
- Define nodes like this: nodeId["Node Text Here"].
- Define edges with labels like this: nodeId1 -->|"Edge Label Here"| nodeId2.

CRITICAL RULE: The text inside node labels \`["..."]\` and edge labels \`-->|"..."|\` MUST NOT contain any quotation mark characters (' or "). REMOVE ALL QUOTATION MARKS from the text you place inside labels.
`;

    const client = getAIClient(req);
    const response = await generateContentWithFallback(client, {
      contents: prompt,
      systemInstruction: 'Act as an AI graph generator. Output only the Mermaid code block. Do not add any text before or after the code block.'
    });

    const text = response.text || '';
    res.json({ text });
  } catch (error: any) {
    console.error('Error generating graph:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Missing or invalid chat history' });
    }

    const client = getAIClient(req);
    const response = await generateContentWithFallback(client, {
      contents: history.map(item => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: item.parts.map((p: any) => ({ text: p.text }))
      })),
      systemInstruction: 'You are a helpful, concise, analytical assistant. Respond using the tone of a DOS-era system message or diagnostic output.'
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
