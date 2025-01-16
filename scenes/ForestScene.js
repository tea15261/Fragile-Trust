import PlayerManager from '/managers/PlayerManager.js';

export class ForestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'forest' });
    }

    preload() {
        // Load your assets here
        this.load.spritesheet('playerIdle', 'assets/player/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('forest', 'assets/environment/forest backdrop.png'); // Load the forest backdrop
        this.load.spritesheet('playerRun', 'assets/player/run/Run-Sheet.png', { frameWidth: 32, frameHeight: 32 }); // Load run-sheet sprite sheet
        this.load.spritesheet('handsIdle', 'assets/player/idle/Knight Idle holding nothing.png', { frameWidth: 32, frameHeight: 32 }); // Load hands sprite sheet
        this.load.spritesheet('handsRun', 'assets/player/run/Knight Run holding nothing.png', { frameWidth: 64, frameHeight: 64 }); // Load running hands sprite sheet
    }

    create() {
        // Add the forest backdrop and scale it down
        const forestBackdrop = this.add.image(320, 200, 'forest'); // Add the backdrop
        forestBackdrop.setScale(0.4); // Scale down to fit the screen (adjust as needed)
        
        this.playerManager = new PlayerManager(this); // Initialize PlayerManager
        this.cursors = this.input.keyboard.createCursorKeys(); // Create cursor keys for movement
        
        this.createObstacles();
        this.createSpecialWalls();

        // Create a static group for the scene change box
        this.sceneChangeBox = this.physics.add.staticGroup();

        // Add the scene change box (position and size)
        this.sceneChangeBox.create(500, 10, null).setSize(300, 10).setOrigin(0, 0).setVisible(false); 

        // Enable overlap detection with the player
        this.physics.add.overlap(this.playerManager.player, this.sceneChangeBox, this.changeScene, null, this);
    }

    update() {
        this.playerManager.update(); // Update player manager

        // Check if the player is overlapping with the special walls
        if (this.physics.overlap(this.playerManager.player, this.specialWalls)) {
            // Make the player and hands invisible
            this.playerManager.player.setVisible(false);
            this.playerManager.hands.setVisible(false);
        } else {
            // Make the player and hands visible again
            this.playerManager.player.setVisible(true);
            this.playerManager.hands.setVisible(true);
        }
    } 

    handleSpecialWallEnter(player) {
        // Make the player and hands invisible
        player.setVisible(false);
        this.playerManager.hands.setVisible(false);
    } 

    changeScene(player) {
        this.scene.start('tavern'); // Transition to TavernScene
    }
    
    createObstacles() {
        this.obstacles = this.physics.add.staticGroup();
        this.obstacles.create(0, 200, null).setSize(400, 150).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(0, 300, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(10, 290, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(20, 280, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(30, 270, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(40, 260, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(50, 250, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(60, 240, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall

        this.obstacles.create(0, 0, null).setSize(560, 300).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(300, 0, null).setSize(260, 60).setOrigin(0, 0).setVisible(false); // Top wall
        this.obstacles.create(600, 270, null).setSize(425, 100).setOrigin(0, 0).setVisible(false); // Right wall
        this.obstacles.create(700, 370, null).setSize(425, 100).setOrigin(0, 0).setVisible(false); // Right wall
        this.obstacles.create(700, 170, null).setSize(325, 150).setOrigin(0, 0).setVisible(false); // Right wall
        this.physics.add.collider(this.playerManager.player, this.obstacles);
    }

    createSpecialWalls() {
        this.specialWalls = this.physics.add.staticGroup();

        // Add special walls (you can adjust the position and size)
        this.specialWalls.create(165, 300, null).setSize(50, 60).setOrigin(0, 0).setVisible(false); // Example special wall
        this.specialWalls.create(395, 300, null).setSize(50, 120).setOrigin(0, 0).setVisible(false);
        this.specialWalls.create(445, 400, null).setSize(50, 25).setOrigin(0, 0).setVisible(false);
        this.specialWalls.create(520, 200, null).setSize(150, 160).setOrigin(0, 0).setVisible(false);
        this.specialWalls.create(540, 170, null).setSize(150, 120).setOrigin(0, 0).setVisible(false);
        this.specialWalls.create(600, 170, null).setSize(120, 230).setOrigin(0, 0).setVisible(false);
        
        // Enable collision between the player and the special walls
        this.physics.add.overlap(this.playerManager.player, this.specialWalls, (player, wall) => {
            this.handleSpecialWallEnter(player); // Correctly bind the context
        }, null, this);
    }
}
