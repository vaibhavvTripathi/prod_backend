import { Router } from 'express';
import { handleGetExpoTemplate } from '../controllers/expoTemplate.controller';

const router = Router();

router.post('/template', handleGetExpoTemplate);

export default router; 