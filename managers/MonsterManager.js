import PlayerManager from '/managers/PlayerManager.js';
export default class MonsterManager {
    constructor(scene, playerManager) {
        this.scene = scene;
        this.monster = null;
        this.shadow = null;
        this.healthBar = null;
        this.defenseBar = null;
        this.attackBar = null;
        this.playerManager = playerManager;

        this.monsterTypes = [
            { 
                key: 'Slime',
                stats: { health: 50, attack: 30, defense: 20 },
                color: 0x00ffff // Green
            },
            {
                key: 'Skeleton',
                stats: { health: 75, attack: 45, defense: 30 },
                color: 0xffffff // White
            },
            {
                key: 'Goblin',
                stats: { health: 100, attack: 60, defense: 40 },
                color: 0x00ff00 // Cyan
            },
            {
                key: 'Mage',
                stats: { health: 125, attack: 75, defense: 50 },
                color: 0xff00ff // Magenta
            }
        ];

        this.init();
    }

    init() {
        this.generateNewMonster();
        this.name();
    }

    generateNewMonster() {
        const monsterType = Phaser.Math.RND.pick(this.monsterTypes);
        this.currentMonsterType = monsterType.key;
        
        this.health = monsterType.stats.health;
        this.attack = monsterType.stats.attack;
        this.defense = monsterType.stats.defense;

        this.createMonster(monsterType.color);
    }

    createMonster(color) {
        const posX = 200; 
        const posY = 100;

        if(this.monster) {
            this.monster.destroy();
            this.shadow.destroy();
        }

        this.shadow = this.scene.add.ellipse(posX, posY + 8, 30, 10, 0x000000, 0.5);
        this.shadow.setOrigin(-2.0, -7.5);

        // create a colored square instead of a sprite
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