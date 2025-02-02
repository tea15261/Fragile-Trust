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
        this.initStats();
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
        this.shadow.setOrigin(0.5, 1.5);

        // Create a colored square instead of a sprite
        this.monster = this.scene.add.rectangle(posX, posY, 50, 50, color);
        this.monster.setOrigin(0.5, 0.5);
    }

    initStats() {
        const barSpacing = 20;
        const statsX = this.scene.cameras.main.width - 140;
        const statsY = 140;

        this.healthBar = this.createStatBar(statsX, statsY, 100, 10, 0xff0000, 'Health');
        this.defenseBar = this.createStatBar(statsX, statsY + barSpacing, 100, 10, 0xa0522d, 'Defense');
        this.attackBar = this.createStatBar(statsX, statsY + 2 * barSpacing, 100, 10, 0xffff00, 'Attack');

        this.setStatBarsVisibility(false);
    }

    createStatBar(x, y, width, height, color, label) {
        const bar = this.scene.add.rectangle(x, y, width, height, color).setOrigin(0.5, 0.5);
        const border = this.scene.add.rectangle(x, y, width + 2, height + 2)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5, 0.5);
        const text = this.scene.add.text(x - width/2 - 10, y - height/2, label, { 
            fontSize: '12px', 
            color: '#ffffff' 
        }).setOrigin(0, 0.5).setStroke('#000000', 1.5);

        return { bar, border, text };
    }

    setStatBarsVisibility(visible) {
        [this.healthBar, this.defenseBar, this.attackBar].forEach(bar => {
            bar.bar.setVisible(visible);
            bar.border.setVisible(visible);
            bar.text.setVisible(visible);
        });
    }

    updateStatBars() {
        this.healthBar.bar.width = this.health;
        this.defenseBar.bar.width = this.defense;
        this.attackBar.bar.width = this.attack;
    }

    takeDamage(damage) {
        const effectiveDamage = Math.max(0, damage - this.defense);
        this.health = Math.max(0, this.health - effectiveDamage);
        this.updateStatBars();
        return effectiveDamage;
    }

    hide() {
        this.monster.setVisible(false);
        this.shadow.setVisible(false);
        this.setStatBarsVisibility(false);
    }

    show() {
        this.monster.setVisible(true);
        this.shadow.setVisible(true);
        this.setStatBarsVisibility(true);
    }

    reset() {
        this.generateNewMonster();
        this.updateStatBars();
        this.show();
    }
}