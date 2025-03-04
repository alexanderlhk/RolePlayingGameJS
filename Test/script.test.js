const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Specify the root directory
const rootDirectory = path.resolve(__dirname, '..');

// Load the HTML file for the DOM BEFORE setting up the globals
const html = fs.readFileSync(path.join(rootDirectory, 'index.html'), 'utf-8');

// Create the JSDOM environment (this needs to happen FIRST)
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

// Make window and document globals (this needs to happen BEFORE loading your script)
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

// Load your script (only AFTER window and document are globals)
const script = fs.readFileSync(path.join(rootDirectory, 'script.js'), 'utf-8');

// Execute the script only once, outside of any describe or it blocks
dom.window.eval(script);

// Now you can use the variables and functions from script.js in your tests
const {
    xp,
    health,
    gold,
    currentWeapon,
    inventory,
    button1,
    button2,
    button3,
    text,
    xpText,
    healthText,
    goldText,
    monsterStats,
    monsterName,
    monsterHealthText,
    weapons,
    monsters,
    locations,
    goTown,
    goStore,
    goCave,
    buyHealth,
    buyWeapon,
    sellWeapon,
    fightSlime,
    fightBeast,
    fightDragon,
    goFight,
    attack,
    dodge,
    defeatMonster,
    lose,
    winGame,
    restart,
    easterEgg,
    pickTwo,
    pickEight,
    pick,
    update,
    getMonsterAttackValue,
    isMonsterHit
} = global;

describe('Role Playing Game - Unit Tests', () => {
    beforeEach(() => {
        // Reset values before each test
        xp = 0;
        health = 100;
        gold = 50;
        currentWeapon = 0;
        inventory = ["stick"];
        text.innerText = "";
        monsterStats.style.display = 'none'
        goldText.innerText = gold;
        healthText.innerText = health;
        xpText.innerText = xp;
        
    });

    describe('Initialization', () => {
        it('should initialize the game with correct values', () => {
            goTown()
            expect(xp).toBe(0);
            expect(health).toBe(100);
            expect(gold).toBe(50);
            expect(currentWeapon).toBe(0);
            expect(inventory).toEqual(["stick"]);
            expect(goldText.innerText).toBe('50');
            expect(healthText.innerText).toBe('100');
            expect(xpText.innerText).toBe('0');
        });
    });

    describe('goTown', () => {
        it('should update the game to town square location', () => {
            goTown();
            expect(text.innerText).toBe("You are in the town square. You see a sign that says \"Store\".");
            expect(button1.innerText).toBe("Go to store");
            expect(button2.innerText).toBe("Go to cave");
            expect(button3.innerText).toBe("Fight dragon");
        });
    });

    describe('goStore', () => {
        it('should update the game to store location', () => {
            goStore();
            expect(text.innerText).toBe("You enter the store.");
            expect(button1.innerText).toBe("Buy 10 health (10 gold)");
            expect(button2.innerText).toBe("Buy weapon (30 gold)");
            expect(button3.innerText).toBe("Go to town square");
        });
    });

    describe('goCave', () => {
        it('should update the game to cave location', () => {
            goCave();
            expect(text.innerText).toBe("You enter the cave. You see some monsters.");
            expect(button1.innerText).toBe("Fight slime");
            expect(button2.innerText).toBe("Fight fanged beast");
            expect(button3.innerText).toBe("Go to town square");
        });
    });

    describe('buyHealth', () => {
        it('should buy health if enough gold', () => {
            buyHealth();
            expect(gold).toBe(40);
            expect(health).toBe(110);
            expect(goldText.innerText).toBe("40");
            expect(healthText.innerText).toBe("110");
        });

        it('should not buy health if not enough gold', () => {
            gold = 5;
            buyHealth();
            expect(gold).toBe(5);
            expect(health).toBe(100);
            expect(text.innerText).toBe("You do not have enough gold to buy health.");
        });
    });

    describe('buyWeapon', () => {
        it('should buy a weapon if enough gold and not at max', () => {
            buyWeapon();
            expect(gold).toBe(20);
            expect(currentWeapon).toBe(1);
            expect(inventory).toEqual(["stick", "dagger"]);
            expect(text.innerText).toContain("You now have a dagger");
        });

        it('should not buy a weapon if not enough gold', () => {
            gold = 10;
            buyWeapon();
            expect(gold).toBe(10);
            expect(currentWeapon).toBe(0);
            expect(text.innerText).toBe("You do not have enough gold to buy a weapon.");
        });

        it('should inform the user if they already have the most powerful weapon', () => {
            currentWeapon = 3;
            buyWeapon();
            expect(text.innerText).toBe("You already have the most powerful weapon!");
            expect(button2.innerText).toBe('Sell weapon for 15 gold');
            expect(button2.onclick).toBe(sellWeapon);
        });
    });

    describe('sellWeapon', () => {
        it('should sell a weapon and add gold', () => {
            inventory.push('dagger');
            sellWeapon();
            expect(gold).toBe(65);
            expect(inventory).toEqual(["stick"]);
            expect(text.innerText).toContain("You sold a dagger");
        });
        it('should prevent selling the only weapon', () => {
            sellWeapon();
            expect(gold).toBe(50);
            expect(inventory).toEqual(["stick"]);
            expect(text.innerText).toBe("Don't sell your only weapon!");
        });
    });

    describe('fight functions', () => {
        it('fightSlime should set fighting to 0 and call goFight', () => {
            fightSlime();
            expect(global.fighting).toBe(0);
            expect(text.innerText).toBe("You are fighting a monster.");
            expect(monsterStats.style.display).toBe('block');
        });

        it('fightBeast should set fighting to 1 and call goFight', () => {
            fightBeast();
            expect(global.fighting).toBe(1);
            expect(text.innerText).toBe("You are fighting a monster.");
            expect(monsterStats.style.display).toBe('block');
        });

        it('fightDragon should set fighting to 2 and call goFight', () => {
            fightDragon();
            expect(global.fighting).toBe(2);
            expect(text.innerText).toBe("You are fighting a monster.");
            expect(monsterStats.style.display).toBe('block');
        });
    })
    
    describe('attack', () => {
        beforeEach(() => {
            fightSlime();
        });
        it('should update text and health values', () => {
           
            const initialHealth = health;
            const initialMonsterHealth = monsters[0].health;
            attack();
            expect(text.innerText).toContain("The slime attacks.");
            expect(health).toBeLessThan(initialHealth);
            expect(monsters[0].health).toBeLessThan(initialMonsterHealth);
            expect(healthText.innerText).not.toBe(initialHealth);
            expect(monsterHealthText.innerText).not.toBe(initialMonsterHealth);
            
        });
        it('should handle monster death', () => {
            monsters[0].health = 0
            attack();
            expect(text.innerText).toBe('The monster screams "Arg!" as it dies. You gain experience points and find gold.');
        });
        it('should handle player death', () => {
            health = 0
            attack();
            expect(text.innerText).toBe('You die. ☠');
        });
    });

    describe('getMonsterAttackValue', () => {
        it('should return a value based on level and xp', () => {
            xp = 10;
            const level = 5;
            const attackValue = getMonsterAttackValue(level);
            expect(attackValue).toBeGreaterThanOrEqual(0);
            expect(attackValue).toBeLessThanOrEqual(level * 5);
        });
        it('should return a value of at least 0', () => {
            xp = 1000;
            const level = 1;
            const attackValue = getMonsterAttackValue(level);
            expect(attackValue).toBe(0);
        });
    });

    describe('isMonsterHit', () => {
        it('should return true or false based on random chance and player health', () => {
            const result = isMonsterHit();
            expect(typeof result).toBe('boolean');
        });
    });
    describe('Dodge', () => {
        it('should update text if dodge is called', () => {
            fightSlime();
            dodge();
            expect(text.innerText).toBe("You dodge the attack from the slime");
        });
    });
    describe('defeatMonster', () => {
        it('should update player gold and xp when a monster is defeated', () => {
            fightSlime()
            const currentGold = gold;
            const currentXp = xp;
            defeatMonster();
            expect(gold).toBeGreaterThan(currentGold);
            expect(xp).toBeGreaterThan(currentXp);
        });

    });

    describe('lose', () => {
        it('should update the game to lose location', () => {
            lose();
            expect(text.innerText).toBe("You die. ☠");
            expect(button1.innerText).toBe("REPLAY?");
        });
    });

    describe('winGame', () => {
        it('should update the game to win location', () => {
            winGame();
            expect(text.innerText).toBe("You defeat the dragon! YOU WIN THE GAME! 🎉");
            expect(button1.innerText).toBe("REPLAY?");
        });
    });

    describe('restart', () => {
        it('should reset game values and return to town square', () => {
            xp = 100;
            health = 50;
            gold = 100;
            currentWeapon = 3;
            inventory = ["sword", "dagger"];
            restart();
            expect(xp).toBe(0);
            expect(health).toBe(100);
            expect(gold).toBe(50);
            expect(currentWeapon).toBe(0);
            expect(inventory).toEqual(["stick"]);
            expect(text.innerText).toBe("You are in the town square. You see a sign that says \"Store\".");
        });
    });

    describe('easterEgg', () => {
        it('should update the game to the easter egg location', () => {
            easterEgg();
            expect(text.innerText).toBe("You find a secret game. Pick a number above. Ten numbers will be randomly chosen between 0 and 10. If the number you choose matches one of the random numbers, you win!");
            expect(button1.innerText).toBe("2");
            expect(button2.innerText).toBe("8");
            expect(button3.innerText).toBe("Go to town square?");
        });
    });

    describe('pick', () => {
        it('should handle winning the easter egg', () => {
          
            const originalMathRandom = Math.random;
            Math.random = () => 0; // Force the number to be 0 in all cases
          
            pick(0); // pick a number that will always be included
            expect(text.innerText).toContain("Right! You win 20 gold!");
            expect(gold).toBe(70);
          
            //restore math random
            Math.random = originalMathRandom
          });
          
          it('should handle losing the easter egg', () => {
            const originalMathRandom = Math.random;
            Math.random = () => 1; // Force the numbers to be 11 or 10 in all cases
          
            pick(0); // pick a number that will never be included
            expect(text.innerText).toContain("Wrong! You lose 10 health!");
            expect(health).toBe(90);
            
            //restore math random
            Math.random = originalMathRandom
          });
          it('should handle losing the easter egg and death', () => {
            const originalMathRandom = Math.random;
            Math.random = () => 1; // Force the numbers to be 11 or 10 in all cases
            health = 5;
            pick(0); // pick a number that will never be included
            expect(text.innerText).toContain("You die.");
            
            //restore math random
            Math.random = originalMathRandom
          });
    });
    describe('pickTwo', () => {
        it('should call pick with 2', () => {
            const pickSpy = jest.spyOn(global, 'pick');
            pickTwo();
            expect(pickSpy).toHaveBeenCalledWith(2);
            pickSpy.mockRestore();
        });
    });
    describe('pickEight', () => {
        it('should call pick with 8', () => {
            const pickSpy = jest.spyOn(global, 'pick');
            pickEight();
            expect(pickSpy).toHaveBeenCalledWith(8);
            pickSpy.mockRestore();
        });
    });
    
});
