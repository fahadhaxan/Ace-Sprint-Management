import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Handle ESM and CommonJS compatibility for path resolution
const __filename = typeof import.meta !== 'undefined' && import.meta && import.meta.url ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename ? path.dirname(__filename) : '';

const PORT = 3000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Please configure it in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Available and responsive models with automatic fallback on 503 / high demand spikes
const RESILIENT_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
];

async function generateWithModelFallback(ai: GoogleGenAI, prompt: string, schema: any): Promise<any> {
  let lastError: any = null;
  for (const model of RESILIENT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err: any) {
      console.warn(`[AI] Model ${model} unavailable (${err?.status || err?.code || 'error'}), trying next resilient model...`);
      lastError = err;
      // If it's a 503/429/high-demand spike, continue immediately to the next candidate model
      continue;
    }
  }
  throw lastError || new Error('All AI candidate models are temporarily unavailable.');
}

async function startServer() {
  const app = express();
  
  // Security Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  
  const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { error: 'Too many requests, please try again later.' }
  });

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
  });

  // Feature 1: Compliance Request Intake & BRD Generator
  app.post('/api/ai/intake-parser', aiLimiter, async (req: Request, res: Response) => {
    try {
      const { rawText, portalLabel, typeLabel } = req.body;
      if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
        res.status(400).json({ error: 'rawText is required' });
        return;
      }

      const ai = getGeminiClient();
      const prompt = `You are a Senior Compliance Systems Architect and Business Analyst for ACE Money Transfer (cross-border remittances, AML, CFT, sanctions, KYC, GCR compliance rules, transaction monitoring).
Analyze the following regulatory circular, audit finding, policy memo, or change request and draft the request with the following fields only:

1. Summary: One liner summary of the change request.
2. Description: Detailed change description explaining what needs to be changed, statutory or operational context, and technical or functional requirements.
3. Use cases: A list of practical use cases explaining how this change will help in the future (e.g., efficiency, compliance, risk mitigation, customer onboarding, reporting).
4. Acceptance Criteria: A list of specific, testable acceptance criteria (written in verification checklist format) to validate the change.
5. Assumptions: A list of explicit assumptions made regarding system architecture, data feeds, dependencies, or operational procedures.
6. Impact Analysis: Impact analysis detailing affected portals/systems (Backoffice, ARMS, SAR ticketing, Fraud, Chargeback), downstream APIs, corridors, operations teams, and regulatory risk.

${portalLabel || typeLabel ? `User-Selected Target Metadata Context:
- Target Portal: ${portalLabel || 'Backoffice'}
- Request Category: ${typeLabel || 'Sprint request'}
Please align your drafting with this target context.` : ''}

Raw Regulatory/Compliance Text:
"""
${rawText}
"""`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: 'One liner summary of the request',
          },
          description: {
            type: Type.STRING,
            description: 'Change description',
          },
          useCases: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Few use cases how the change will help in future',
          },
          acceptanceCriteria: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Testable acceptance criteria list',
          },
          assumptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of key assumptions for this change',
          },
          impactAnalysis: {
            type: Type.STRING,
            description: 'Impact analysis detailing affected systems, portals, workflows, and risks',
          },
        },
        required: [
          'summary',
          'description',
          'useCases',
          'acceptanceCriteria',
          'assumptions',
          'impactAnalysis',
        ],
      };

      const parsedData = await generateWithModelFallback(ai, prompt, schema);
      res.json(parsedData);
    } catch (err: any) {
      console.error('Error in /api/ai/intake-parser:', err);
      res.status(500).json({
        error: err.message || 'Failed to process compliance intake text.',
      });
    }
  });

  // Feature 4: Semantic Duplicate & Conflict Detector
  app.post('/api/ai/duplicate-detector', aiLimiter, async (req: Request, res: Response) => {
    try {
      const { draftItem, existingItems } = req.body;
      if (!draftItem || !draftItem.title) {
        res.status(400).json({ error: 'draftItem with title is required' });
        return;
      }

      if (!existingItems || !Array.isArray(existingItems) || existingItems.length === 0) {
        res.json({
          hasDuplicatesOrConflicts: false,
          matches: [],
          summary: 'No existing items available to compare.',
        });
        return;
      }

      const ai = getGeminiClient();

      // Compact existing items to save tokens while keeping semantic context
      const candidates = existingItems
        .filter((item: any) => item.id !== draftItem.id)
        .slice(0, 50)
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          status: item.status,
          sprint: item.sprint || item.targetSprint,
          sourceType: item.sourceType || 'Request',
          description: (item.description || item.about || '').slice(0, 200),
        }));

      const prompt = `You are an expert compliance auditor and sprint coordinator for ACE Money Transfer systems.
Analyze this newly drafted ticket or request against existing system tickets, defects, and sprint backlog items.
Identify if there are any SEMANTIC DUPLICATES (same requirement phrased differently), SHARED ROOT CAUSES (different symptoms of the same core service or API failure), or CONFLICTING DELIVERIES (competing rule logic or sprint timing).

New Draft Item:
- Title: "${draftItem.title}"
- Description/Summary: "${draftItem.description || draftItem.about || 'N/A'}"
- Type: "${draftItem.type || 'Compliance'}"

Existing System Items (${candidates.length} items):
${JSON.stringify(candidates, null, 2)}

Instructions:
1. Examine intent, compliance scope, corridor impact, API dependencies, and logic.
2. If there are close matches (similarity >= 55%), return them in "matches" sorted by highest similarity score.
3. If no significant duplicates or conflicts exist, set "hasDuplicatesOrConflicts" to false and "matches" to [].
4. For each match, provide:
   - "id": existing item ID
   - "title": existing item title
   - "sourceType": "Request" | "Ticket" | "Bug"
   - "status": existing status
   - "sprint": existing sprint or target
   - "similarityScore": 0 to 100
   - "conflictType": "EXACT_DUPLICATE" | "SHARED_ROOT_CAUSE" | "REGULATORY_OVERLAP" | "SPRINT_CONFLICT"
   - "reason": Clear 1-2 sentence explanation of the semantic overlap or root cause relation.
   - "recommendation": Actionable suggestion (e.g. "Merge into REQ-014", "Link to BUG-102", "Coordinate delivery").
5. "summary": A brief 1-2 sentence executive summary of findings.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          hasDuplicatesOrConflicts: { type: Type.BOOLEAN },
          summary: { type: Type.STRING },
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                sourceType: { type: Type.STRING },
                status: { type: Type.STRING },
                sprint: { type: Type.STRING },
                similarityScore: { type: Type.NUMBER },
                conflictType: { type: Type.STRING },
                reason: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: [
                'id',
                'title',
                'sourceType',
                'similarityScore',
                'conflictType',
                'reason',
                'recommendation',
              ],
            },
          },
        },
        required: ['hasDuplicatesOrConflicts', 'summary', 'matches'],
      };

      const parsed = await generateWithModelFallback(ai, prompt, schema);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/ai/duplicate-detector:', err);
      res.status(500).json({
        error: err.message || 'Failed to analyze duplicates and conflicts.',
      });
    }
  });

  // Vite middleware for development vs static build in production
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
