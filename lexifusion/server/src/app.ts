import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { themesRouter } from './routes/themes';
import { fusionsRouter } from './routes/fusions';
import { usersRouter } from './routes/users';
import { wordsRouter } from './routes/words';

const app = express();

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// ─── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/themes', themesRouter);
app.use('/api/fusions', fusionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/words', wordsRouter);

// ─── 404 handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Error handler ──────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

export { app };
