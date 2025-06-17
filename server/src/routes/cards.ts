import express, { Request, Response } from 'express';
import MemoryDatabase from '../memory-database';
import { CardInput } from '../types';

const router = express.Router();
const db = MemoryDatabase.getInstance();

// Get all cards
router.get('/', async (req: Request, res: Response) => {
  try {
    const cards = await db.getAllCards();
    res.json(cards);
  } catch (error) {
    console.error('Error getting cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get a single card by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const card = await db.getCardById(req.params.id);
    if (card) {
      res.json(card);
    } else {
      res.status(404).json({ error: 'Card not found' });
    }
  } catch (error) {
    console.error('Error getting card:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Create a new card
router.post('/', async (req: Request, res: Response) => {
  try {
    const cardInput: CardInput = req.body;
    
    // Validate required fields
    const requiredFields = ['player', 'team', 'year', 'brand', 'category', 'cardNumber', 'condition', 'purchasePrice', 'purchaseDate', 'currentValue'];
    for (const field of requiredFields) {
      if (!cardInput[field as keyof CardInput]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Ensure images is an array
    if (!Array.isArray(cardInput.images)) {
      cardInput.images = [];
    }

    // Ensure notes is a string
    if (!cardInput.notes) {
      cardInput.notes = '';
    }

    const card = await db.createCard(cardInput);
    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update a card
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const cardInput: CardInput = req.body;
    
    // Validate required fields
    const requiredFields = ['player', 'team', 'year', 'brand', 'category', 'cardNumber', 'condition', 'purchasePrice', 'purchaseDate', 'currentValue'];
    for (const field of requiredFields) {
      if (!cardInput[field as keyof CardInput]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Ensure images is an array
    if (!Array.isArray(cardInput.images)) {
      cardInput.images = [];
    }

    // Ensure notes is a string
    if (!cardInput.notes) {
      cardInput.notes = '';
    }

    const card = await db.updateCard(req.params.id, cardInput);
    if (card) {
      res.json(card);
    } else {
      res.status(404).json({ error: 'Card not found' });
    }
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete a card
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await db.deleteCard(req.params.id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Card not found' });
    }
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

export default router;