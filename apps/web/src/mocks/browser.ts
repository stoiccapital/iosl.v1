import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { seedDb } from './seed';

seedDb();

export const worker = setupWorker(...handlers);
