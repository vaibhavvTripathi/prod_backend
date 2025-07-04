import { Router } from 'express';
import { handleGetExpoTemplate } from '../controllers/expoTemplate.controller';

const router = Router();

router.get('/template', handleGetExpoTemplate);

export default router; 