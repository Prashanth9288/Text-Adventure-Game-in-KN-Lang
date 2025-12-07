export class Player {
  constructor(name, startRoomId = 'start') {
    this.name = name;
    this.inventory = [];
    this.currentRoom = startRoomId;
    this.isAlive = true;
    this.puzzlesSolved = 0;
    this.lastSavedAt = null;
  }

  // Doodle: pickUp(item)
  pickUp(item) {
    this.inventory.push(item);
    // Return a fun confirmation message
    const responses = [
      `You snagged the ${item}. Yoink!`,
      `The ${item} is now yours. Treat it well.`,
      `Into the pocket goes the ${item}.`,
      `You acquired ${item}. Do do do dooo!`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Doodle: move(direction)
  // Note: Validation is often done in GameManager looking at Room, 
  // but strictly speaking the PRD says "move(direction) — attempt to move via current room's exits".
  // So this needs access to the room data. We will pass the room object or exits to it.
  move(direction, currentRoomObj) {
    if (!currentRoomObj) return "You are floating in the void. Cannot move.";

    const exit = currentRoomObj.exits[direction.toLowerCase()];

    if (!exit) {
      return "You bump into a wall. Ouch.";
    }

    // Check if locked
    // The server seed has structure: { roomId: "...", locked: true, ... } or just "id"
    if (typeof exit === 'object' && exit.locked) {
      // Locked logic.
      // Doodles say: "if blocked by a locked exit, give witty hint."
      return exit.failureMessage || "Locked. No entry for you.";
    }

    // Success
    const nextRoomId = typeof exit === 'object' ? exit.roomId : exit;
    this.currentRoom = nextRoomId;
    return null; // Null implies success, caller will handle description print
  }

  // Doodle: showInventory()
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
