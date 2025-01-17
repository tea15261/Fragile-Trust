import PlayerManager from '/managers/PlayerManager.js';

export class ForestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'forest' });
    }

    preload() {
        this.load.spritesheet('playerIdle', 'assets/player/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('forest', 'assets/environment/forest-backdrop.png'); 
        this.load.spritesheet('playerRun', 'assets/player/run/Run-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('handsIdle', 'assets/player/idle/Knight Idle holding nothing.png', { frameWidth: 32, frameHeight: 32 }); 
        this.load.spritesheet('handsRun', 'assets/player/run/Knight Run holding nothing.png', { frameWidth: 64, frameHeight: 64 }); 
        this.load.spritesheet('forest-cutter', 'assets/npc/ezgif.com-gif-to-sprite-converter.png', { frameWidth: 90, frameHeight: 75 }); 

    }

    create() {
        const forestBackdrop = this.add.image(320, 200, 'forest'); 
        forestBackdrop.setScale(0.4);
        
        this.playerManager = new PlayerManager(this); // Initialize PlayerManager
        this.cursors = this.input.keyboard.createCursorKeys();

        this.createObstacles();
        this.createSpecialWalls();

        this.sceneChangeBox = this.physics.add.staticGroup();
        this.sceneChangeBox.create(500, 10, null).setSize(300, 10).setOrigin(0, 0).setVisible(false); 
        this.physics.add.overlap(this.playerManager.player, this.sceneChangeBox, this.changeScene, null, this);
    
        const forestCutter = this.add.sprite(540, 325, 'forest-cutter');
        forestCutter.setScale(0.5);
        this.createForestCutterAnimation();
        forestCutter.play('forest-cutter-chop')
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
        this.scene.start('tavern'); 
    }
    
    createObstacles() {
        this.obstacles = this.physics.add.staticGroup();
        this.obstacles.create(0, 200, null).setSize(400, 150).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(0, 300, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
        
        let y = 290;
        for (let x = 10; x <= 60; x+=10) {
            this.obstacles.create(x, y, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
            y -= 10;
          }
        
        this.obstacles.create(0, 0, null).setSize(560, 300).setOrigin(0, 0).setVisible(false); // Left wall
        this.obstacles.create(300, 0, null).setSize(260, 60).setOrigin(0, 0).setVisible(false); // Top wall
        this.obstacles.create(600, 270, null).setSize(425, 100).setOrigin(0, 0).setVisible(false); // Right wall
        this.obstacles.create(700, 370, null).setSize(425, 100).setOrigin(0, 0).setVisible(false); // Right wall
        this.obstacles.create(700, 170, null).setSize(325, 150).setOrigin(0, 0).setVisible(false); // Right wall
        this.physics.add.collider(this.playerManager.player, this.obstacles);
    }

    createSpecialWalls() {
        this.specialWalls = this.physics.add.staticGroup();
        this.specialWalls.create(165, 300, null).setSize(50, 60).setOrigin(0, 0).setVisible(false); 
        this.specialWalls.create(395, 300, null).setSize(50, 120).setOrigin(0, 0).setVisible(false);
        this.specialWalls.create(445, 400, null).setSize(50, 25).setOrigin(0, 0).setVisible(false);
        this.specialWalls.create(520, 200, null).setSize(150, 160).setOrigin(0, 0).setVisible(false);
        this.specialWalls.create(540, 170, null).setSize(150, 120).setOrigin(0, 0).setVisible(false);
        this.specialWalls.create(600, 170, null).setSize(120, 230).setOrigin(0, 0).setVisible(false);
        
        this.physics.add.overlap(this.playerManager.player, this.specialWalls);
    }

    createForestCutterAnimation() {
        this.anims.create({
            key: 'forest-cutter-chop',
            frames: [
                { key: 'forest-cutter', frame: 0, duration: 100 }, 
                { key: 'forest-cutter', frame: 1, duration: 80 }, 
                { key: 'forest-cutter', frame: 2, duration: 70 }, 
                { key: 'forest-cutter', frame: 3, duration: 1000 }, // Frame 3 displayed for 100ms
                { key: 'forest-cutter', frame: 4, duration: 100 }, // Frame 4 displayed for 200ms
                { key: 'forest-cutter', frame: 5, duration: 30 }, // Frame 5 displayed for 150ms
                { key: 'forest-cutter', frame: 6, duration: 30 }, // Frame 6 displayed for 130ms
                { key: 'forest-cutter', frame: 7, duration: 830 }, // Frame 7 displayed for 170ms
                { key: 'forest-cutter', frame: 8, duration: 120 }  // Frame 8 displayed for 110ms
            ],
            repeat: -1 // Loop indefinitely
        });
    }
    
}
