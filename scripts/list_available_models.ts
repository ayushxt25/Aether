import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenAI(process.env.AI_API_KEY || '');
    const models = await genAI.models.list();
    console.log(JSON.stringify(models, null, 2));
}

listModels().catch(console.error);
