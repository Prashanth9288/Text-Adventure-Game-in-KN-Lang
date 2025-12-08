require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Room = require('./models/roomModel');
const Player = require('./models/playerModel');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


const { seedRooms } = require('./seed');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kn_adventure')
  .then(async () => {
    console.log('MongoDB connected');
    try {
      const roomCount = await Room.countDocuments();
      if (roomCount === 0) {
        console.log('Database empty. Auto-seeding rooms...');
        await seedRooms();
      }
    } catch (err) {
      console.error('Auto-seed check failed:', err);
    }


    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});


app.post('/api/save', async (req, res) => {
  try {
    const { name, inventory, currentRoom, puzzlesSolved, isAlive } = req.body;
    
    if (!name || !currentRoom) {
      return res.status(400).json({ error: 'Missing required player data' });
    }

    const updatedPlayer = await Player.findOneAndUpdate(
      { name: name },
      { 
        inventory, 
        currentRoom, 
        puzzlesSolved, 
        isAlive,
        lastSavedAt: Date.now() 
      },
      { new: true, upsert: true, runValidators: true }
    );

    console.log(`Saved player: ${name}`);
    res.json(updatedPlayer);
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

app.post('/api/load', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const player = await Player.findOne({ name });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load game' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {    
    const leaders = await Player.find({})
      .sort({ puzzlesSolved: -1, lastSavedAt: -1 })
      .limit(10)
      .select('name puzzlesSolved lastSavedAt');
    
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
  
    await Room.deleteMany({});
    
    res.json({ message: 'Please run `npm run seed` in terminal to re-seed database safely.' });
  } catch (err) {
    res.status(500).json({ error: 'Seed failed' });
  }
});


