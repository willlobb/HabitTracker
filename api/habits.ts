import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Habit } from '../shared/types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // TODO: Fetch from database
        res.json([]);
        break;

      case 'POST':
        const habit: Habit = req.body;
        // TODO: Save to database
        res.status(201).json(habit);
        break;

      case 'PUT':
        const { id } = req.query;
        const updates = req.body;
        // TODO: Update in database
        res.json({ id, ...updates });
        break;

      case 'DELETE':
        const deleteId = req.query.id;
        // TODO: Delete from database
        res.status(204).send();
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

