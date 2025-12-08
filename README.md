# KN-Lang Text Adventure

A full-stack text adventure game built with React, Node.js, and MongoDB.

## Architecture & Squad Mapping

This project follows a strict "Squad" architecture:

- **Squad Player**:
  - Client: `client/src/squads/Player.js` (Game logic, inventory, movement)
  - Server: `server/models/playerModel.js` (Persistence schema)
- **Room Squad**:
  - Client: `client/src/squads/Room.js` (Interactions, puzzles, details)
  - Server: `server/models/roomModel.js` (Persistence schema)
- **GameManager Squad**:
  - Client: `client/src/squads/GameManager.js` (Command loop, parsing)
  - Integration: `client/src/contexts/GameManagerContext.jsx` (React wiring)
  - Server: `server/index.js` (API endpoints for save/load/seed)

## Setup & Run

### 1. Prerequisites

- Node.js (v14+)
- MongoDB running locally on default port 27017

### 2. Server Setup

```bash
cd server
npm install
npm run seed  
npm run dev   
```

### 3. Client Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev   
```

## Gameplay & Walkthrough

Open the browser to the provided URL (e.g., http://localhost:5173).

**Puzzle 1: The Locked Door**

1. `look` -> You start in Dark Antechamber.
2. `go north` -> Hallway.
3. `look` -> You see a rusty key.
4. `pick rusty key`.
5. `go west` -> Armory. Exit North is the treasure room but locked.
6. `go north` -> "The door stares at you blankly..."
7. `use rusty key` -> Unlocks the door.
8. `go north` -> Treasure Vault!

**Puzzle 2: The Riddle Box**

1. From Hallway, `go east` -> Dusty Library.
2. `look` -> See riddle box.
3. `use riddle box` (or just `look`).
4. Riddle: "I speak without a mouth... What am I?"
5. Type `echo` -> Solved! You get an ancient scroll.

## Commands

- `go <north|south|east|west>`
- `pick <item>`
- `use <item>`
- `inventory`
- `look`
- `save`
- `load [playername]`
- `quit`

## Dev Notes

- Use `?debug=true` in URL to see room IDs and extra stats.
- Tests located in `server/test/`. Run `npm test` in server dir.
