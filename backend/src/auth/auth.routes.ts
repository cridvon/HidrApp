import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as controller from './auth.controller';

const router = Router();

router.post('/registro', controller.registro);
router.post('/login', controller.login);
router.get('/me', requireAuth, controller.me);

export default router;
