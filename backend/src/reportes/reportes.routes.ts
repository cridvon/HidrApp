import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as controller from './reportes.controller';

const router = Router();

router.get('/puntos/:id/reportes', controller.listar);
router.post('/puntos/:id/reportes', requireAuth, controller.crear);

export default router;
