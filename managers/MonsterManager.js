export default class MonsterManager {
    constructor(scene) {
        this.scene = scene;
        this.monster = null;
        this.shadow = null;
        this.healthBar = null;
        this.defenseBar = null;
        this.attackBar = null;
        
        // Define monster types with fixed stats and colors
        this.monsterTypes = [
            { 
                key: 'slime',
                stats: { health: 50, attack: 30, defense: 20 },
                color: 0x00ffff // Green
            },
            {
                key: 'skeleton',
                stats: { health: 75, attack: 45, defense: 30 },
                color: 0xffffff // White
            },
            {
                key: 'goblin',
                stats: { health: 100, attack: 60, defense: 40 },
                color: 0x00ff00 // Cyan
            },
            {
                key: 'mage',
                stats: { health: 125, attack: 75, defense: 50 },
                color: 0xff00ff // Magenta
            }
        ];

        this.init();
    }

    init() {
        this.generateNewMonster();
    }

    generateNewMonster() {
        // Randomly select a monster type
        const monsterType = Phaser.Math.RND.pick(this.monsterTypes);
        this.currentMonsterType = monsterType.key;
        
        // Set stats from the selected type
        this.health = monsterType.stats.health;
        this.attack = monsterType.stats.attack;
        this.defense = monsterType.stats.defense;

        this.createMonster(monsterType.color);
    }

    createMonster(color) {
        const posX = 200; // Left side position
        const posY = 100;

        // Remove existing monster if present
        if(this.monster) {
            this.monster.destroy();
            this.shadow.destroy();
        }

        this.shadow = this.scene.add.ellipse(posX, posY + 8, 30, 10, 0x000000, 0.5);
        this.shadow.setOrigin(-2.0, -7.5);

        // Create a colored square instead of a sprite
        this.monster = this.scene.add.rectangle(posX, posY, 50, 50, color);
        this.monster.setOrigin(0.5, 0.5);
    }

    stats() {
        return {
            health: this.health,
            attack: this.attack,
            defense: this.defense
        };
    }

    name() {
        return this.currentMonsterType;
    }

    hide() {
        this.monster.setVisible(false);
        this.shadow.setVisible(false);
    }

    show() {
        this.monster.setVisible(true);
        this.shadow.setVisible(true);
    }

    reset() {
        this.generateNewMonster();
        this.show();
    }
}