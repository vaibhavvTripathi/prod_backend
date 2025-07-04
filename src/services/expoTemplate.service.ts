import fs from 'fs';
import path from 'path';

export const getExpoTemplate = async (): Promise<any> => {
  const filePath = path.join(__dirname, '../templates/expo_template.json');
  const data = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}; 