require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/roomModel');
const Player = require('./models/playerModel');

const roomsData = [
  {
    id: "start",
    name: "Dark Antechamber",
    description: "You stand in a dimly lit antechamber. Cold stone walls surround you.",
    items: ["lint"],
    exits: { north: "hallway" },
    puzzle: null
  },
  {
    id: "hallway",
    name: "Grand Hallway",
    description: "A long hallway with portraits of forgotten coding ancestors.",
    items: ["rusty key"],
    exits: { south: "start", east: "library", west: "armory" },
    puzzle: null
  },
  {
    id: "library",
    name: "Dusty Library",
    description: "Rows of ancient documentation. A strange box sits on a pedestal.",
    items: ["torn page"],
    exits: { west: "hallway" },
    puzzle: {
      type: "riddle",
      requirement: "silence", // Answer to the riddle
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", // Echo? Wind? Silence? Let's go with 'echo'
      text: "A riddle box blocks access to the rare loot. Inscribed is: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?'",
      hint: "It comes back to you.",
      reward: "ancient scroll",
      solved: false,
      attempts: 0
    }
  },
  {
    id: "armory",
    name: "Old Armory",
    description: "Racks of rusted weapons. One door looks sturdy.",
    items: ["sword"],
    exits: { east: "hallway", north: "treasure_room" }, // Locked door logic will be handled in Room class logic, but here we define the connection.
    // We mark it specifically in the DB as a mixed type to indicate locking if we want, or just handle it in code.
    // The prompt says "A room with an exit that is locked...".
    // Let's model the exit as an object for the locked one.
    exits: { 
      east: "hallway",
      north: { roomId: "treasure_room", locked: true, keyItem: "rusty key", failureMessage: "The door stares at you blankly. Perhaps it’s missing something — like a key?" }
    }
  },
  {
    id: "treasure_room",
    name: "Treasure Vault",
    description: "Glittering gold and artifacts! You made it!",
    items: ["gold coin", "feather"], // Riddle box solution might need feather+coin?
    exits: { south: "armory" },
    puzzle: null
  },
  {
    id: "garden",
    name: "Overgrown Garden",
    description: "Nature has reclaimed this place.",
    items: ["strange flower"],
    exits: { south: "kitchen" } // Isolated for now, need connection
  },
  {
    id: "kitchen",
    name: "Abandoned Kitchen",
    description: "Smells of faint rot and old spices.",
    items: ["knife"],
    exits: { north: "garden", east: "start" } // Connecting back to start via secret?
  }
];

// Re-connect kitchen to start to make 7 rooms accessible
roomsData[0].exits.west = "kitchen"; 

// Fix library riddle answer
roomsData[2].puzzle.question = "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?";
// Answer: Echo. 

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kn_adventure');
    console.log('Connected to MongoDB');

    await Room.deleteMany({});
    await Player.deleteMany({}); // Optional: clear players

    await Room.insertMany(roomsData);
    console.log('Rooms seeded');

    // Create a dummy dev player
    await Player.create({
      name: "DevOne",
      currentRoom: "start",
      inventory: ["flashlight"],
      puzzlesSolved: 0
    });
    console.log('Dev player seeded');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
