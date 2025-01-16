import PlayerManager from '/managers/PlayerManager.js';

export class TavernScene extends Phaser.Scene {
    constructor() {
        super({ key: 'tavern' });
    }

    preload() {
        // Load your assets here
        this.load.image('tavern', 'assets/environment/tavern.jpg'); // Load the tavern backdrop
        this.load.spritesheet('playerIdle', 'assets/player/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('playerRun', 'assets/player/run/Run-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('handsIdle', 'assets/player/idle/Knight Idle holding nothing.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('handsRun', 'assets/player/run/Knight Run holding nothing.png', { frameWidth: 64, frameHeight: 64 });
    }

    create(data) {
        // Add the tavern backdrop
        const tavernBackdrop = this.add.image(320, 200, 'tavern'); // Add the backdrop
        tavernBackdrop.setScale(0.22); // Scale down to fit the screen (adjust as needed)

        // Initialize PlayerManager and create the player in this scene
        this.playerManager = new PlayerManager(this); // Initialize PlayerManager
        this.cursors = this.input.keyboard.createCursorKeys(); // Create cursor keys for movement

        // Set the player's position to the bottom center of the tavern
        const playerX = 320; // Adjust this as needed for the center
        const playerY = this.cameras.main.height - 50; // Position 50 pixels from the bottom (adjust as needed)
        this.playerManager.player.setPosition(playerX, playerY);

        // Create the scene change box
        this.sceneChangeBox = this.physics.add.staticGroup();
        this.sceneChangeBox.create(320, 365, null).setSize(30, 5).setOrigin(0, 0).setVisible(false); // Collision box
        this.physics.add.overlap(this.playerManager.player, this.sceneChangeBox, this.changeScene, null, this);

    }

    update() {
        this.playerManager.update(); // Update player manager
        // Additional update logic for the tavern scene
    }

    changeScene() {
        this.scene.start('forest'); // Transition to forest
    }
}
