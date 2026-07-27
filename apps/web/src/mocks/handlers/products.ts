import { http, HttpResponse } from 'msw';
import { db } from '../db';

export const productsHandlers = [
  http.get('/api/products', () => HttpResponse.json(db.products)),
];
