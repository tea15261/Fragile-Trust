import PlayerManager from '/managers/PlayerManager.js';
import PreloadManager from '/managers/PreloadManager.js';
import BattleManager from '/managers/BattleManager.js';
import MonsterManager from '/managers/MonsterManager.js';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'battle' });
    }

    preload() {
        PreloadManager.preloadAssets(this);
        // No UI sprite assets; we use graphics and text.
    }
    
    create() {
        this.add.image(320, 200, 'battle-scene').setScale(1.07, 0.6721);
        this.playerManager = new PlayerManager(this, true); // true indicates the player is in battle
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.setDefaultCursor('none');

        // Initialize MonsterManager.
        this.monsterManager = new MonsterManager(this);
        this.monsterManager.generateNewMonster();
        // Position the monster a bit left from the center.
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.monsterManager.monster.setPosition(centerX - 50, centerY);

        const playerX = this.cameras.main.width - 50; 
        const playerY = 230; 
        this.playerManager.player.setPosition(playerX, playerY);
        this.battleManager = new BattleManager(this, this.playerManager, this.monsterManager, this.customCursor);

        this.customCursor = this.add.sprite(0, 0, 'customCursor').setScale(0.6);
        this.customCursor.setVisible(false);

        // Scene change collision box.
        this.sceneChangeBox = this.physics.add.staticGroup();
        this.sceneChangeBox.create(640, 200, null)
            .setSize(10, 300)
            .setOrigin(0, 0)
            .setVisible(false);
        this.physics.add.overlap(this.playerManager.player, this.sceneChangeBox, this.changeScene, null, this);

        this.createObstacles();

        // Battle start collision box.
        this.battleStart = this.physics.add.staticGroup();
        this.battleStart.create(440, 200, null)
            .setSize(10, 300)
            .setOrigin(0, 0)
            .setVisible(false);

        // When the player overlaps, display the battle UI.
        this.physics.add.overlap(this.playerManager.player, this.battleStart, () => {
            if (this.battleManager) {
                this.battleManager.displayBattleUI();
            }
        }, null, this);

        // Prevent the battle UI from being created more than once.
        this.battleUIShown = false;
    }

    update() {
        this.playerManager.update(); 
    }

    changeScene() {
        // Destroy custom cursor when leaving
        if (this.customCursor) {
            this.customCursor.destroy();
            this.customCursor = null; // Ensure it's nullified
        }
        this.scene.start('forest', { from: 'battle' });
    }
    
    createObstacles() {
        const obstacleConfigs = [
            { x: 320, y: 80, width: 800, height: 10 },  // Top wall
            { x: 115, y: 180, width: 10, height: 400 },   // Left wall
            { x: 320, y: 330, width: 800, height: 10 },   // Bottom wall
        ];
        
        this.obstacles = this.physics.add.staticGroup();

        obstacleConfigs.forEach(config => {
            const obstacle = this.obstacles.create(config.x, config.y, null);
            obstacle.setSize(config.width, config.height)
                    .setOrigin(0, 0)
                    .setVisible(false);
        });
    
        this.physics.add.collider(this.playerManager.player, this.obstacles);
    }

    
}


