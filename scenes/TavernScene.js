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

        this.createObstacles();
        this.createSpecialWalls();

        this.sceneChangeBox = this.physics.add.staticGroup();
        this.sceneChangeBox.create(320, 365, null).setSize(30, 5).setOrigin(0, 0).setVisible(false); 
        this.physics.add.overlap(this.playerManager.player, this.sceneChangeBox, this.changeScene, null, this);

    }

    update() {
        this.playerManager.update(); 

         // Check if the player is overlapping with the special walls
         if (this.physics.overlap(this.playerManager.player, this.specialWalls)) {
            this.playerManager.hide();
        } else {
            this.playerManager.show();
        }
    }

    changeScene() {
        this.scene.start('forest'); 
    }

    createObstacles() {
        this.obstacles = this.physics.add.staticGroup();

        this.obstacles.create(320, 80, null).setSize(400, 10).setOrigin(0, 0).setVisible(false); // bar wall
        this.obstacles.create(150, 180, null).setSize(10, 400).setOrigin(0, 0).setVisible(false); // left wall
        this.obstacles.create(500, 180, null).setSize(10, 400).setOrigin(0, 0).setVisible(false); // left wall
        this.obstacles.create(320, 370, null).setSize(400, 10).setOrigin(0, 0).setVisible(false); // bottom wall

        this.obstacles.create(50, 180, null).setSize(400, 10).setOrigin(0, 0).setVisible(false); // top left fence
        this.obstacles.create(590, 180, null).setSize(400, 10).setOrigin(0, 0).setVisible(false); // top right fence

        this.obstacles.create(200, 140, null).setSize(40, 40).setOrigin(0, 0).setVisible(false); // top left table
        this.obstacles.create(440, 140, null).setSize(40, 40).setOrigin(0, 0).setVisible(false); // top right table

        this.obstacles.create(50, 260, null).setSize(400, 10).setOrigin(0, 0).setVisible(false); // bottom left fence
        this.obstacles.create(590, 260, null).setSize(400, 10).setOrigin(0, 0).setVisible(false); // bottom right fence

        this.obstacles.create(200, 230, null).setSize(40, 40).setOrigin(0, 0).setVisible(false); // middle left table
        this.obstacles.create(440, 230, null).setSize(40, 40).setOrigin(0, 0).setVisible(false); // middle right table

        this.obstacles.create(200, 320, null).setSize(40, 40).setOrigin(0, 0).setVisible(false); // bottom left table
        this.obstacles.create(440, 320, null).setSize(40, 40).setOrigin(0, 0).setVisible(false); // bottom right table

        this.physics.add.collider(this.playerManager.player, this.obstacles);
    }

    createSpecialWalls() {
        this.specialWalls = this.physics.add.staticGroup();

        this.specialWalls.create(240, 100, null).setSize(20, 35).setOrigin(0, 0).setVisible(false); // top left column
        this.specialWalls.create(400, 100, null).setSize(20, 35).setOrigin(0, 0).setVisible(false); // top right column

        this.specialWalls.create(240, 250, null).setSize(20, 20).setOrigin(0, 0).setVisible(false); // bottom left column
        this.specialWalls.create(400, 250, null).setSize(20, 20).setOrigin(0, 0).setVisible(false); // bottom right column
        
        this.physics.add.overlap(this.playerManager.player, this.specialWalls);
    }
    
}
