import cors from 'cors';
import express from 'express';
import authRoutes from './auth/auth.routes';
import { config } from './config';
import { errorHandler } from './middleware/errors';
import puntosRoutes from './puntos/puntos.routes';
import reportesRoutes from './reportes/reportes.routes';

export const app = express();

app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((o) => o.trim()),
  }),
);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', puntosRoutes);
app.use('/api', reportesRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});
app.use(errorHandler);
