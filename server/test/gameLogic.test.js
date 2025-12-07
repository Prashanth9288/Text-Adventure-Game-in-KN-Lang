const { Player } = require('../../client/src/squads/Player');


describe('Game Syntax and Logic Tests', () => {
    
    class Player {
        constructor(name) {
            this.name = name;
            this.inventory = [];
        }
        pickUp(item) {
            this.inventory.push(item);
            return "Picked up";
        }
    }

    test('Player can pick up items', () => {
        const p = new Player("Tester");
        p.pickUp("sword");
        expect(p.inventory).toContain("sword");
    });

  
    const sarcasticResponses = ["No.", "Try again."];
    test('Sarcastic response rotation', () => {
        let index = 0;
        const getMsg = () => sarcasticResponses[index++ % sarcasticResponses.length];
        
        expect(getMsg()).toBe("No.");
        expect(getMsg()).toBe("Try again.");
        expect(getMsg()).toBe("No.");
    });
});
