import { Request, Response } from 'express';
import { getExpoTemplate } from '../services/expoTemplate.service';

export const handleGetExpoTemplate = async (req: Request, res: Response) => {
  try {
    const template = await getExpoTemplate();
    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Expo template' });
  }
}; 