import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as controller from './puntos.controller';

const router = Router();

router.get('/tipos', controller.tipos);
router.get('/puntos', controller.listar);
router.get('/puntos/:id', controller.obtener);
router.post('/puntos', requireAuth, controller.crear);
router.put('/puntos/:id', requireAuth, controller.actualizar);
router.delete('/puntos/:id', requireAuth, controller.eliminar);

export default router;
