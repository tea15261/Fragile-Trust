import PlayerManager from '/managers/PlayerManager.js';
import PreloadManager from '/managers/PreloadManager.js';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'battle' });
    }
    preload() {
        // load battle scene assets
        PreloadManager.preloadAssets(this);
    }
    
    create() {
        this.add.image(320, 200, 'battle-scene').setScale(1.07,0.6721);
        this.playerManager = new PlayerManager(this); // initialize playermanager
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.setDefaultCursor('none');

        const playerX = this.cameras.main.width - 50; 
        const playerY = 230; 
        this.playerManager.player.setPosition(playerX, playerY);

        this.sceneChangeBox = this.physics.add.staticGroup();
        this.sceneChangeBox.create(640, 200, null).setSize(10, 300).setOrigin(0, 0).setVisible(false);
        this.physics.add.overlap(this.playerManager.player, this.sceneChangeBox, this.changeScene, null, this);

    }
    update() {
        this.playerManager.update(); 
    }

    changeScene() {
        this.scene.start('forest'); 
    }
}