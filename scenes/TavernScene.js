import PlayerManager from '/managers/PlayerManager.js';

export class TavernScene extends Phaser.Scene {
    constructor() {
        super({ key: 'tavern' });
    }

    preload() {
        this.load.image('tavern', 'assets/environment/tavern.jpg'); 
        this.load.spritesheet('playerIdle', 'assets/player/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('playerRun', 'assets/player/run/Run-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('handsIdle', 'assets/player/idle/Knight Idle holding nothing.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('handsRun', 'assets/player/run/Knight Run holding nothing.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        const tavernBackdrop = this.add.image(320, 200, 'tavern'); 
        tavernBackdrop.setScale(0.22); 

        this.playerManager = new PlayerManager(this); // Initialize PlayerManager
        this.cursors = this.input.keyboard.createCursorKeys();
        const playerX = 320; 
        const playerY = this.cameras.main.height - 50; 
        this.playerManager.player.setPosition(playerX, playerY);

        this.sceneChangeBox = this.physics.add.staticGroup();
        this.sceneChangeBox.create(320, 365, null).setSize(30, 5).setOrigin(0, 0).setVisible(false); 
        this.physics.add.overlap(this.playerManager.player, this.sceneChangeBox, this.changeScene, null, this);

    }

    update() {
        this.playerManager.update(); 
    }

    changeScene() {
        this.scene.start('forest'); 
    }
}
