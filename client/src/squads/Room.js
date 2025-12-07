export class Room {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.items = data.items || [];
    this.exits = data.exits || {};
    this.puzzle = data.puzzle || null; // { type, requirement, satisfied... }
  }

  // Doodle: showDetails()
  showDetails() {
    let details = `== ${this.name} ==\n${this.description}`;
    
    // Show items
    if (this.items.length > 0) {
      details += `\n\nYou see: ${this.items.join(', ')}`;
    }

    // Show visible exits
    const directions = Object.keys(this.exits);
    if (directions.length > 0) {
      details += `\nExits: ${directions.join(', ')}`;
    }

    return details;
  }

  // Doodle: interact()
  // Handles puzzles, hints, etc.
  // Args: command (full string), player (Player instance)
  interact(command, player) {
    // Check for puzzle
    if (!this.puzzle) return "There is nothing special to interact with here.";
    if (this.puzzle.solved) return "You've already solved the mystery here.";

    const cmdLower = command.toLowerCase();

    // Logic for 'item' type puzzle (Locked Door usually handled in move, but maybe 'use key' works here too)
    // The PRD mentions: "Riddle Box (logic)... or use a specific combination of items"
    
    if (this.puzzle.type === 'riddle') {
      // Check if command is an answer attempts
      // "say <answer>" or just typed answer? PRD says "typed answers".
      // Let's assume the user might allow "answer echo" or just "echo". 
      // We'll check if the command *contains* the answer or is the answer.
      
      const answer = this.puzzle.requirement.toLowerCase();
      // Simple check: does the command contain the answer?
      // Or strict check.
      if (cmdLower.includes(answer)) {
        this.puzzle.solved = true;
        player.puzzlesSolved += 1;
        
        // Reward
        if (this.puzzle.reward) {
          player.inventory.push(this.puzzle.reward);
          return `Correct! The box clicks open. You found a ${this.puzzle.reward}!`;
        }
        return "Correct! You solved the riddle.";
      } else {
        this.puzzle.attempts = (this.puzzle.attempts || 0) + 1;
        if (this.puzzle.attempts >= 3) {
            return `Wrong. Hint: ${this.puzzle.hint}`;
        }
        return "Nothing happens. That doesn't seem to be the answer.";
      }
    }

    return "You poke around but find nothing new.";
  }
}
