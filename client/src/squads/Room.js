export class Room {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.items = data.items || [];
    this.exits = data.exits || {};
    this.puzzle = data.puzzle || null; 
  }

  showDetails() {
    let details = `== ${this.name} ==\n${this.description}`;
    
  
    if (this.items.length > 0) {
      details += `\n\nYou see: ${this.items.join(', ')}`;
    }

    const directions = Object.keys(this.exits);
    if (directions.length > 0) {
      details += `\nExits: ${directions.join(', ')}`;
    }

    return details;
  }

  
  interact(command, player) {
    
    if (!this.puzzle) return "There is nothing special to interact with here.";
    if (this.puzzle.solved) return "You've already solved the mystery here.";

    const cmdLower = command.toLowerCase();

    
    
    if (this.puzzle.type === 'riddle') {
  
      const answer = this.puzzle.requirement.toLowerCase();
      
      if (cmdLower.includes(answer)) {
        this.puzzle.solved = true;
        player.puzzlesSolved += 1;
        
       
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
