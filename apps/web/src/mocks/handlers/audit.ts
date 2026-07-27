import { http, HttpResponse } from 'msw';
import { db } from '../db';

export const auditHandlers = [
  http.get('/api/audit', () => {
    const sorted = [...db.auditEntries].sort((a, b) =>
      a.at < b.at ? 1 : a.at > b.at ? -1 : 0,
    );
    return HttpResponse.json(sorted);
  }),
];
