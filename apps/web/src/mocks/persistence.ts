import { WebsiteSchema, WebsiteSubmissionSchema } from '@factory/shared';
import { z } from 'zod';
import { db } from './db';

const KEY = 'iosl.msw.websites.v1';

const PersistedShape = z.object({
  websites: z.array(WebsiteSchema),
  websiteSubmissions: z.array(WebsiteSubmissionSchema),
});

export function loadPersistedWebsites(): {
  websites: typeof db.websites;
  websiteSubmissions: typeof db.websiteSubmissions;
} | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = PersistedShape.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      // Schema drift — drop the stale blob.
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function persistWebsites(): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        websites: db.websites,
        websiteSubmissions: db.websiteSubmissions,
      }),
    );
  } catch {
    /* quota / disabled storage — nothing to do */
  }
}
