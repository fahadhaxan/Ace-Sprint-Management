import { AiParsedIntake, AiDuplicateResult } from '../types';

export async function parseIntakeWithAi(rawText: string, portalLabel?: string, typeLabel?: string): Promise<AiParsedIntake> {
  const res = await fetch('/api/ai/intake-parser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rawText, portalLabel, typeLabel }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to process text with AI (Status ${res.status})`);
  }

  return res.json();
}

export async function detectDuplicatesWithAi(
  draftItem: { id?: string; title: string; description?: string; about?: string; type?: string },
  existingItems: any[]
): Promise<AiDuplicateResult> {
  const res = await fetch('/api/ai/duplicate-detector', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ draftItem, existingItems }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Duplicate detection failed (Status ${res.status})`);
  }

  return res.json();
}
