const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8000;
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// In-memory storage
const cards = new Map();
const users = new Map();
const collections = new Map();
const collectionMemberships = new Map(); // userId -> [collectionIds]

// Create default admin user and collection on startup
const initializeDefaults = async () => {
  // Create admin user
  const adminId = 'admin-user-id';
  const adminPassword = await bcrypt.hash('admin123', 10);
  const now = new Date().toISOString();
  
  users.set(adminId, {
    id: adminId,
    username: 'admin',
    email: 'admin@cardtracker.com',
    password: adminPassword,
    role: 'admin',
    profilePhoto: null,
    createdAt: now,
    updatedAt: now
  });

  // Create default collection
  const defaultCollectionId = 'default-collection';
  collections.set(defaultCollectionId, {
    id: defaultCollectionId,
    name: 'Default Collection',
    description: 'Default shared card collection',
    createdBy: adminId,
    isDefault: true,
    createdAt: now,
    updatedAt: now
  });

  // Add admin to default collection
  collectionMemberships.set(adminId, [defaultCollectionId]);
  
  console.log('Default admin user and collection created');
  console.log('Admin login: admin@cardtracker.com / admin123');
};

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    for (const user of users.values()) {
      if (user.email === email || user.username === username) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userId = uuidv4();
    const now = new Date().toISOString();
    
    const user = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      role: 'user',
      profilePhoto: null,
      createdAt: now,
      updatedAt: now
    };

    users.set(userId, user);

    // Add user to default collection
    const defaultCollectionId = 'default-collection';
    const userCollections = collectionMemberships.get(userId) || [];
    userCollections.push(defaultCollectionId);
    collectionMemberships.set(userId, userCollections);

    // Create JWT token
    const token = jwt.sign(
      { id: userId, username, email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`User registered: ${username} (${email})`);
    res.status(201).json({
      user: { id: userId, username, email, role: user.role, profilePhoto: user.profilePhoto },
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    let foundUser = null;
    for (const user of users.values()) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: foundUser.id, username: foundUser.username, email: foundUser.email, role: foundUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`User logged in: ${foundUser.username} (${foundUser.email})`);
    res.json({
      user: { id: foundUser.id, username: foundUser.username, email: foundUser.email, role: foundUser.role, profilePhoto: foundUser.profilePhoto },
      token
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.get(req.user.id);
  if (user) {
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        profilePhoto: user.profilePhoto 
      } 
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { email, currentPassword, newPassword, profilePhoto } = req.body;
    const userId = req.user.id;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updates = {};

    // Update email if provided
    if (email && email !== user.email) {
      // Check if email is already taken
      for (const existingUser of users.values()) {
        if (existingUser.email === email && existingUser.id !== userId) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }
      updates.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required to change password' });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    // Update profile photo if provided
    if (profilePhoto !== undefined) {
      updates.profilePhoto = profilePhoto;
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      users.set(userId, updatedUser);

      // Return updated user data (without password)
      const userResponse = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto
      };

      console.log(`Profile updated for user: ${updatedUser.username}`);
      res.json({ user: userResponse });
    } else {
      res.json({ message: 'No changes made' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Collection endpoints
// Get user's collections
app.get('/api/collections', authenticateToken, (req, res) => {
  try {
    const userCollectionIds = collectionMemberships.get(req.user.id) || [];
    const userCollections = userCollectionIds.map(id => collections.get(id)).filter(Boolean);
    res.json(userCollections);
  } catch (error) {
    console.error('Error getting collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Create new collection (admin only for now)
app.post('/api/collections', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collectionId = uuidv4();
    const now = new Date().toISOString();
    
    const collection = {
      id: collectionId,
      name,
      description: description || '',
      createdBy: req.user.id,
      isDefault: false,
      createdAt: now,
      updatedAt: now
    };

    collections.set(collectionId, collection);
    
    // Add creator to collection
    const userCollections = collectionMemberships.get(req.user.id) || [];
    userCollections.push(collectionId);
    collectionMemberships.set(req.user.id, userCollections);

    console.log(`Collection created: ${name} by ${req.user.username}`);
    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Add user to collection (admin only)
app.post('/api/collections/:id/members', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { userId } = req.body;
    const collectionId = req.params.id;
    
    if (!collections.has(collectionId)) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    if (!users.has(userId)) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userCollections = collectionMemberships.get(userId) || [];
    if (!userCollections.includes(collectionId)) {
      userCollections.push(collectionId);
      collectionMemberships.set(userId, userCollections);
    }

    res.json({ message: 'User added to collection' });
  } catch (error) {
    console.error('Error adding user to collection:', error);
    res.status(500).json({ error: 'Failed to add user to collection' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested from:', req.headers.origin || req.ip);
  res.json({ status: 'OK', message: 'Memory database server running' });
});

// Get all cards (from user's collections or all for admin)
app.get('/api/cards', authenticateToken, (req, res) => {
  try {
    const allCards = Array.from(cards.values());
    let userCards;
    
    if (req.user.role === 'admin') {
      // Admin sees all cards
      userCards = allCards;
    } else {
      // Regular users see cards from their collections
      const userCollectionIds = collectionMemberships.get(req.user.id) || [];
      userCards = allCards.filter(card => userCollectionIds.includes(card.collectionId));
    }
    
    const sortedCards = userCards.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sortedCards);
  } catch (error) {
    console.error('Error getting cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get single card (from user's collections or any for admin)
app.get('/api/cards/:id', authenticateToken, (req, res) => {
  try {
    const card = cards.get(req.params.id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Admin can see any card
    if (req.user.role === 'admin') {
      return res.json(card);
    }
    
    // Regular users can only see cards from their collections
    const userCollectionIds = collectionMemberships.get(req.user.id) || [];
    if (userCollectionIds.includes(card.collectionId)) {
      res.json(card);
    } else {
      res.status(404).json({ error: 'Card not found' });
    }
  } catch (error) {
    console.error('Error getting card:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Create card
app.post('/api/cards', authenticateToken, (req, res) => {
  console.log('POST /api/cards - Request received');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request headers:', req.headers);
  
  try {
    const cardInput = req.body;
    
    // Validate required fields
    const requiredFields = ['player', 'team', 'year', 'brand', 'category', 'cardNumber', 'condition', 'purchasePrice', 'purchaseDate', 'currentValue'];
    for (const field of requiredFields) {
      if (!cardInput[field]) {
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

    // Determine collection - use provided collectionId or default to first user collection
    let collectionId = cardInput.collectionId;
    if (!collectionId) {
      const userCollectionIds = collectionMemberships.get(req.user.id) || [];
      collectionId = userCollectionIds[0] || 'default-collection';
    }

    // Verify user has access to this collection
    const userCollectionIds = collectionMemberships.get(req.user.id) || [];
    if (!userCollectionIds.includes(collectionId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied to this collection' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    
    const card = {
      id,
      ...cardInput,
      collectionId,
      createdBy: req.user.id,
      createdAt: now,
      updatedAt: now
    };

    cards.set(id, card);
    console.log(`Created card in collection ${collectionId} by ${req.user.username}: ${card.player} - ${card.year}`);
    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update card
app.put('/api/cards/:id', authenticateToken, (req, res) => {
  try {
    const cardInput = req.body;
    const id = req.params.id;
    const existingCard = cards.get(id);
    
    if (!existingCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check access - admin can edit any card, users can only edit cards in their collections
    const userCollectionIds = collectionMemberships.get(req.user.id) || [];
    if (req.user.role !== 'admin' && !userCollectionIds.includes(existingCard.collectionId)) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Validate required fields
    const requiredFields = ['player', 'team', 'year', 'brand', 'category', 'cardNumber', 'condition', 'purchasePrice', 'purchaseDate', 'currentValue'];
    for (const field of requiredFields) {
      if (!cardInput[field]) {
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

    const updatedAt = new Date().toISOString();
    const updatedCard = {
      ...cardInput,
      id,
      collectionId: existingCard.collectionId, // Keep original collection
      createdBy: existingCard.createdBy, // Keep original creator
      createdAt: existingCard.createdAt,
      updatedAt
    };

    cards.set(id, updatedCard);
    console.log(`Updated card in collection ${existingCard.collectionId} by ${req.user.username}: ${updatedCard.player} - ${updatedCard.year}`);
    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete card
app.delete('/api/cards/:id', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const existingCard = cards.get(id);
    
    if (!existingCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check access - admin can delete any card, users can only delete cards in their collections
    const userCollectionIds = collectionMemberships.get(req.user.id) || [];
    if (req.user.role !== 'admin' && !userCollectionIds.includes(existingCard.collectionId)) {
      return res.status(404).json({ error: 'Card not found' });
    }

    cards.delete(id);
    console.log(`Deleted card from collection ${existingCard.collectionId} by ${req.user.username}: ${id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Admin endpoints
// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const allUsers = Array.from(users.values()).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));
    res.json(allUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all collections (admin only)
app.get('/api/admin/collections', authenticateToken, requireAdmin, (req, res) => {
  try {
    const allCollections = Array.from(collections.values());
    res.json(allCollections);
  } catch (error) {
    console.error('Error getting collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get collection members (admin only)
app.get('/api/admin/collections/:id/members', authenticateToken, requireAdmin, (req, res) => {
  try {
    const collectionId = req.params.id;
    const members = [];
    
    for (const [userId, userCollections] of collectionMemberships.entries()) {
      if (userCollections.includes(collectionId)) {
        const user = users.get(userId);
        if (user) {
          members.push({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          });
        }
      }
    }
    
    res.json(members);
  } catch (error) {
    console.error('Error getting collection members:', error);
    res.status(500).json({ error: 'Failed to fetch collection members' });
  }
});

// Get system stats (admin only)
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const stats = {
      totalUsers: users.size,
      totalCollections: collections.size,
      totalCards: cards.size,
      totalMemberships: Array.from(collectionMemberships.values()).reduce((sum, arr) => sum + arr.length, 0)
    };
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

console.log('Starting memory database server...');
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Memory database server running on port ${PORT}`);
  console.log(`Database stats: ${cards.size} cards in memory`);
  
  // Initialize default admin and collection
  await initializeDefaults();
});