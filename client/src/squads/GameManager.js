import { Player } from './Player';
import { Room } from './Room';

export class GameManager {
  constructor(setTerminalOutput, setPlayerState, getRoomData) {
    this.player = null;
    this.rooms = {};
    this.setTerminalOutput = setTerminalOutput; 
    this.setPlayerState = setPlayerState; 
    this.getRoomData = getRoomData; 
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


  async startGame(playerName = "Adventurer", roomsData) {
    
    roomsData.forEach(rData => {
      this.rooms[rData.id] = new Room(rData);
    });

 
    this.player = new Player(playerName, 'start');
    
  
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


  async handleCommand(command) {
    if (!command.trim()) return;


    this.setTerminalOutput(prev => [...prev, { type: 'user', content: `> ${command}` }]);

    const parts = command.trim().split(/\s+/);
    const verb = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

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
             
              response = `You head ${args}...`;
              this.log(response); 
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
         
            const itemIndex = currentRoomObj.items.indexOf(args.toLowerCase()); 
            const foundItem = currentRoomObj.items.find(i => i.toLowerCase() === args.toLowerCase());

            if (foundItem) {
              
              currentRoomObj.items = currentRoomObj.items.filter(i => i !== foundItem);
              response = this.player.pickUp(foundItem);
            } else {
              response = "You can't see that here.";
            }
          }
          break;

        case 'use':
          
          if (!args) {
             response = "Use what?";
          } else {
             
             const hasItem = this.player.inventory.some(i => args.toLowerCase().includes(i.toLowerCase()));
             
             let handled = false;
             
           
             Object.keys(currentRoomObj.exits).forEach(dir => {
               const exit = currentRoomObj.exits[dir];
               if (typeof exit === 'object' && exit.locked) {
                 if (args.toLowerCase().includes(exit.keyItem)) {
                  
                    if (this.player.inventory.includes(exit.keyItem)) {
                        exit.locked = false;
                        handled = true;
                        response = `You use the ${exit.keyItem}. The lock clicks open!`;
                    } else {
                        
                    }
                 }
               }
             });

             if (!handled) {
              
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
         
          const nameToLoad = args || this.player.name;
          response = await this.loadGame(nameToLoad);
          break;

        case 'quit':
          response = "Quitting... (Just close the tab to exit real life)";
    
          window.location.reload(); 
          break;

        default:
           
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
        const res = await fetch('http://localhost:3000/api/save', { 
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
   
             return `Loaded game for ${name}.`;
        }
        return "Save file not found.";
      } catch (e) {
          return "Network error loading game.";
      }
  }
}
