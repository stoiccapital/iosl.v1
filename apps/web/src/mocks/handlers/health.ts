import { http, HttpResponse } from 'msw';
import type { HealthStatus } from '@factory/shared';

const bootedAt = Date.now();

export const healthHandlers = [
  http.get('/api/health', () => {
    const uptimeSeconds = Math.floor((Date.now() - bootedAt) / 1000);
    const body: HealthStatus = {
      status: 'ok',
      version: '0.1.0-mock',
      uptimeSeconds,
      checkedAt: new Date().toISOString(),
    };
    return HttpResponse.json(body);
  }),
];
