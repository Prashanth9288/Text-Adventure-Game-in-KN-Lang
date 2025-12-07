import { Player } from './Player';
import { Room } from './Room';

export class GameManager {
  constructor(setTerminalOutput, setPlayerState, getRoomData) {
    this.player = null;
    this.rooms = {}; // Map of id -> Room instance
    this.setTerminalOutput = setTerminalOutput; // Callback to UI
    this.setPlayerState = setPlayerState; // Callback to update UI side-panel
    this.getRoomData = getRoomData; // Async or sync fetcher
    
    // Sarcastic responses
    this.sarcasticResponses = [
      "I don't speak gibberish.",
      "Nice try, but no.",
      "What exactly are you trying to achieve?",
      "Computer says no.",
      "Try 'help' if you're confused.",
      "I command you to make sense!",
      "Error: User competence not found."
    ];
    this.responseIndex = 0;
  }

  // Doodle: startGame()
  async startGame(playerName = "Adventurer", roomsData) {
    // Initialize Rooms
    roomsData.forEach(rData => {
      this.rooms[rData.id] = new Room(rData);
    });

    // Initialize Player
    this.player = new Player(playerName, 'start');
    
    // Initial Output
    this.log(`Welcome, ${playerName}. Your adventure begins in KN-Lang Land.`);
    this.log("Type 'help' for commands.");
    this.log("------------------------------------------------");
    
    const startRoom = this.rooms[this.player.currentRoom];
    if (startRoom) {
      this.log(startRoom.showDetails());
    }
    this.updateUI();
  }

  log(text) {
    this.setTerminalOutput(prev => [...prev, { type: 'system', content: text }]);
  }

  updateUI() {
    this.setPlayerState({
      name: this.player.name,
      inventory: [...this.player.inventory],
      currentRoom: this.player.currentRoom,
      puzzlesSolved: this.player.puzzlesSolved
    });
  }

  getSarcasticResponse() {
    const msg = this.sarcasticResponses[this.responseIndex];
    this.responseIndex = (this.responseIndex + 1) % this.sarcasticResponses.length;
    return msg;
  }

  // Doodle: handleCommand(command)
  async handleCommand(command) {
    if (!command.trim()) return;

    // Log the user's input
    this.setTerminalOutput(prev => [...prev, { type: 'user', content: `> ${command}` }]);

    const parts = command.trim().split(/\s+/);
    const verb = parts[0].toLowerCase();
    const args = parts.slice(1).join(' '); // Rejoin the rest

    let response = "";

    try {
      const currentRoomObj = this.rooms[this.player.currentRoom];

      switch(verb) {
        case 'look':
        case 'l':
          response = currentRoomObj.showDetails();
          break;

        case 'inventory':
        case 'i':
        case 'inv':
          response = this.player.showInventory();
          break;

        case 'go':
        case 'move':
        case 'walk':
          if (!args) {
            response = "Go where? (North, South, East, West)";
          } else {
            const result = this.player.move(args, currentRoomObj);
            if (result === null) {
              // moved successfully
              response = `You head ${args}...`;
              this.log(response); // Print transition
              // Now look at new room
              const newRoom = this.rooms[this.player.currentRoom];
              response = newRoom.showDetails();
            } else {
              response = result;
            }
          }
          break;

        case 'pick':
        case 'take':
        case 'grab':
          if (!args) {
            response = "Pick what?";
          } else {
            // Check if item in room
            const itemIndex = currentRoomObj.items.indexOf(args.toLowerCase()); // Simple loose match?
            // Actually let's do exact or endsWith match for user ease
            const foundItem = currentRoomObj.items.find(i => i.toLowerCase() === args.toLowerCase());

            if (foundItem) {
              // Remove directly from room data (in memory)
              currentRoomObj.items = currentRoomObj.items.filter(i => i !== foundItem);
              response = this.player.pickUp(foundItem);
            } else {
              response = "You can't see that here.";
            }
          }
          break;

        case 'use':
          // Syntax: use <item> [on <target>] ??
          // PRD: "use <item>" logic...
          // Also "Locked Door (item-use): ... player use rusty key"
          // We need to check if the item is in inventory.
          if (!args) {
             response = "Use what?";
          } else {
             // Heuristic splitting might be needed "use rusty key" vs "use key on door"
             // Let's assume simplest: 'use rusty key'.
             // We check room interaction logic.
             // OR check exits for locked doors.
             
             // 1. Check if user has item
             const hasItem = this.player.inventory.some(i => args.toLowerCase().includes(i.toLowerCase()));
             // Note: imprecise match "rusty key" in "use rusty key on door"
             // Let's refine parsing if needed. 
             
             // For the Locked Door specifically:
             // The room 'armory' has exit 'north' which is locked.
             // If user says "use rusty key", and they are in armory, we assume they mean on the door.
             
             // Let's iterate exits to see if any are locked and match the key?
             let handled = false;
             
             // Check Locked Exits
             Object.keys(currentRoomObj.exits).forEach(dir => {
               const exit = currentRoomObj.exits[dir];
               if (typeof exit === 'object' && exit.locked) {
                 if (args.toLowerCase().includes(exit.keyItem)) {
                    // Unlock!
                    if (this.player.inventory.includes(exit.keyItem)) {
                        exit.locked = false;
                        handled = true;
                        response = `You use the ${exit.keyItem}. The lock clicks open!`;
                    } else {
                        // User typed use key but doesn't have it? 
                        // Or general behavior
                    }
                 }
               }
             });

             if (!handled) {
                // Try generic Room interact (for Riddles or other puzzles)
                // Riddle box: "use feather with coin" might be a text input solution
                response = currentRoomObj.interact(command, this.player);
             }
          }
          break;

        case 'help':
          response = "Commands: go [dir], pick [item], use [item], inventory, look, save, load, quit.";
          break;
        
        case 'save':
          response = await this.saveGame();
          break;

        case 'load':
          // Syntax: load <ign>? But usually load takes an argument or just reloads last state?
          // PRD: POST /api/load — body: { name: "<playerName>" }
          // If the player is already loaded, maybe just "save". 
          // If command is "load <name>", valid.
          const nameToLoad = args || this.player.name;
          response = await this.loadGame(nameToLoad);
          break;

        case 'quit':
          response = "Quitting... (Just close the tab to exit real life)";
          // Reset game?
          window.location.reload(); 
          break;

        default:
            // Could be a riddle answer? 
            if (currentRoomObj.puzzle && currentRoomObj.puzzle.type === 'riddle') {
                response = currentRoomObj.interact(command, this.player);
            } else {
                response = this.getSarcasticResponse();
            }
      }
    } catch (err) {
      console.error(err);
      response = "The game universe hiccuped. Try again.";
    }

    if (response) {
      this.log(response);
    }
    
    this.updateUI();
  }

  async saveGame() {
    try {
        const payload = {
            name: this.player.name,
            inventory: this.player.inventory,
            currentRoom: this.player.currentRoom,
            puzzlesSolved: this.player.puzzlesSolved,
            isAlive: this.player.isAlive
        };
        const res = await fetch('http://localhost:3000/api/save', { // TODO: use env in real app
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) return "Game saved successfully.";
        return "Failed to save game.";
    } catch (e) {
        return "Network error saving game.";
    }
  }

  async loadGame(name) {
      try {
        const res = await fetch('http://localhost:3000/api/load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (res.ok) {
            const data = await res.json();
            this.player.updateFromSave(data);
             // Also need to maybe reset rooms if items were taken? 
             // Complex state sync issues here (items taken in save but present in default room data).
             // For now, loading player updates inventory/loc, but world items might desync without full world save.
             // Given PRD doesn't ask for Room Persistence, we accept this quirk or we reload rooms.
             return `Loaded game for ${name}.`;
        }
        return "Save file not found.";
      } catch (e) {
          return "Network error loading game.";
      }
  }
}
