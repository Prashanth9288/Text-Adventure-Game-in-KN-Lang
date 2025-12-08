export class Player {
  constructor(name, startRoomId = 'start') {
    this.name = name;
    this.inventory = [];
    this.currentRoom = startRoomId;
    this.isAlive = true;
    this.puzzlesSolved = 0;
    this.lastSavedAt = null;
  }

 
  pickUp(item) {
    this.inventory.push(item);
    
    const responses = [
      `You snagged the ${item}. Yoink!`,
      `The ${item} is now yours. Treat it well.`,
      `Into the pocket goes the ${item}.`,
      `You acquired ${item}. Do do do dooo!`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  
  move(direction, currentRoomObj) {
    if (!currentRoomObj) return "You are floating in the void. Cannot move.";

    const exit = currentRoomObj.exits[direction.toLowerCase()];

    if (!exit) {
      return "You bump into a wall. Ouch.";
    }

    if (typeof exit === 'object' && exit.locked) {
     
      return exit.failureMessage || "Locked. No entry for you.";
    }

    const nextRoomId = typeof exit === 'object' ? exit.roomId : exit;
    this.currentRoom = nextRoomId;
    return null; 
  }

  showInventory() {
    if (this.inventory.length === 0) {
      return "Your pockets are sadly empty. Just lint.";
    }
    return `You are carrying: ${this.inventory.join(', ')}`;
  }

  updateFromSave(saveData) {
    this.inventory = saveData.inventory || [];
    this.currentRoom = saveData.currentRoom;
    this.puzzlesSolved = saveData.puzzlesSolved || 0;
    this.name = saveData.name;
  }
}
