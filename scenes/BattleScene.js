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
    }
    
    create() {
        this.add.image(320, 200, 'battle-scene').setScale(1.07, 0.6721);
        
        // Create the custom cursor first.
        this.customCursor = this.add.sprite(0, 0, 'customCursor').setScale(0.6);
        this.customCursor.setVisible(false);
        
        this.playerManager = new PlayerManager(this, true); // true indicates the player is in battle
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.setDefaultCursor('none');

        // initialize MonsterManager.
        this.monsterManager = new MonsterManager(this, this.playerManager);
        this.monsterManager.generateNewMonster();

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.monsterManager.monster.setPosition(centerX - 50, centerY);

        const playerX = this.cameras.main.width - 50; 
        const playerY = 230; 
        this.playerManager.player.setPosition(playerX, centerY + 20);
        
        // Now create the BattleManager and pass the customCursor.
        this.battleManager = new BattleManager(this, this.playerManager, this.monsterManager, this.customCursor);

        this.sceneChangeBox = this.physics.add.staticGroup();
        this.sceneChangeBox.create(640, 200, null)
            .setSize(10, 300)
            .setOrigin(0, 0)
            .setVisible(false);
        this.physics.add.overlap(this.playerManager.player, this.sceneChangeBox, this.changeScene, null, this);

        this.createObstacles();

        // battle start collision box.
        this.battleStart = this.physics.add.staticGroup();
        this.battleStart.create(350, 200, null)
            .setSize(10, 300)
            .setOrigin(0, 0)
            .setVisible(false);

        // when the player overlaps, display the battle UI.
        this.physics.add.overlap(this.playerManager.player, this.battleStart, () => {
            if (this.battleManager) {
                this.battleManager.displayBattleUI();
            }
        }, null, this);

        this.battleUIShown = false;
    }

    update() {
        this.playerManager.update(); 
    }

    changeScene() {
        if (this.customCursor) {
            this.customCursor.destroy();
            this.customCursor = null;
        }
        this.scene.start('forest', { from: 'battle' });
    }
    
    createObstacles() {
        const obstacleConfigs = [
            { x: 320, y: 80, width: 800, height: 10 },  // top wall
            { x: 320, y: 182, width: 800, height: 10 },  // mid top wall
            { x: 320, y: 222, width: 800, height: 10 },  // mid bottom wall
            { x: 115, y: 180, width: 10, height: 400 },   // left wall
            { x: 340, y: 180, width: 10, height: 400 },   // mob boundary wall
            { x: 320, y: 330, width: 800, height: 10 },   // bottom wall
        ];
        console.log(this.monsterManager.stats());
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


