import PlayerManager from '/managers/PlayerManager.js';
import PreloadManager from '/managers/PreloadManager.js';
import ShopManager from '/managers/ShopManager.js';

export default class TavernScene extends Phaser.Scene {
    constructor() {
        super({ key: 'tavern' });
    }

    preload() {
        PreloadManager.preloadAssets(this);
    }

    create() {

        // Place this in your main scene’s create() method.
        // When the pointer goes over any interactive object, switch to your custom open cursor.
        this.input.on('gameobjectover', (pointer, gameObject) => {
            document.body.style.cursor = 'url("assets/cursor/hand_open.png"), pointer';
        });

        // When the pointer leaves, revert to the default pointer.
        this.input.on('gameobjectout', (pointer, gameObject) => {
            document.body.style.cursor = 'pointer';
        });

        const tavernBackdrop = this.add.image(320, 200, 'tavern'); 
        tavernBackdrop.setScale(0.22); 
        
        const strangerPositions = [
            { x: 100, y: 300 },
            { x: 50, y: 200 },
            { x: 20, y: 350 },
            { x: 75, y: 100 },
            { x: 590, y: 50 },
            { x: 580, y: 150 },
            { x: 550, y: 250 },
            { x: 570, y: 350 }
        ];
        
        this.strangers = strangerPositions.map(pos => {
            const stranger = this.physics.add.sprite(pos.x, pos.y, 'stranger');
            stranger.setScale(0.5);
            return stranger;
        });
        
        this.playerManager = new PlayerManager(this); // initialize playerManager
        this.cursors = this.input.keyboard.createCursorKeys();
        const playerX = 320; 
        const playerY = this.cameras.main.height - 50; 
        this.playerManager.player.setPosition(playerX, playerY);
        this.input.setDefaultCursor('none');

        this.createObstacles();
        this.createSpecialWalls();

        this.sceneChangeBox = this.physics.add.staticGroup();
        this.sceneChangeBox.create(320, 365, null).setSize(30, 5).setOrigin(0, 0).setVisible(false); 
        this.physics.add.overlap(this.playerManager.player, this.sceneChangeBox, this.changeScene, null, this);

        this.showShop = this.physics.add.staticGroup();
        this.showShop.create(320, 100, null).setSize(50, 10).setOrigin(0, 0).setVisible(false);

        this.physics.add.overlap(this.playerManager.player, this.showShop, this.openShop, null, this);
    }

    update() {
        this.playerManager.update(); 

         // check if the player is overlapping with the special walls
         if (this.physics.overlap(this.playerManager.player, this.specialWalls)) {
            this.playerManager.hide();
        } else {
            this.playerManager.show();
        }
    }

    changeScene() {
        this.scene.start('forest', { from: 'tavern' }); 
    }

    openShop() {
        this.physics.pause();
        this.anims.pauseAll();
        new ShopManager(this, this.playerManager);
    }

    createObstacles() {
        const obstacleConfigs = [
            { x: 320, y: 80, width: 400, height: 10 },  // Bar wall
            { x: 150, y: 180, width: 10, height: 400 }, // Left wall
            { x: 500, y: 180, width: 10, height: 400 }, // Right wall
            { x: 320, y: 370, width: 400, height: 10 }, // Bottom wall
    
            { x: 50, y: 180, width: 400, height: 10 },  // Top left fence
            { x: 590, y: 180, width: 400, height: 10 }, // Top right fence
    
            { x: 200, y: 140, width: 40, height: 40 },  // Top left table
            { x: 440, y: 140, width: 40, height: 40 },  // Top right table
    
            { x: 50, y: 260, width: 400, height: 10 },  // Bottom left fence
            { x: 590, y: 260, width: 400, height: 10 }, // Bottom right fence
    
            { x: 200, y: 230, width: 40, height: 40 },  // Middle left table
            { x: 440, y: 230, width: 40, height: 40 },  // Middle right table
    
            { x: 200, y: 320, width: 40, height: 40 },  // Bottom left table
            { x: 440, y: 320, width: 40, height: 40 }   // Bottom right table
        ];
    
        this.obstacles = this.physics.add.staticGroup();
    
        obstacleConfigs.forEach(config => {
            const obstacle = this.obstacles.create(config.x, config.y, null);
            obstacle.setSize(config.width, config.height).setOrigin(0, 0).setVisible(false);
        });
    
        this.physics.add.collider(this.playerManager.player, this.obstacles);
    }    

    createSpecialWalls() {
        const specialWallConfigs = [
            { x: 240, y: 100, width: 20, height: 35 }, // Top left column
            { x: 400, y: 100, width: 20, height: 35 }, // Top right column
            { x: 240, y: 250, width: 20, height: 20 }, // Bottom left column
            { x: 400, y: 250, width: 20, height: 20 }  // Bottom right column
        ];
    
        this.specialWalls = this.physics.add.staticGroup();
    
        specialWallConfigs.forEach(config => {
            const wall = this.specialWalls.create(config.x, config.y, null);
            wall.setSize(config.width, config.height).setOrigin(0, 0).setVisible(false);
        });
    
        this.physics.add.overlap(this.playerManager.player, this.specialWalls);
    }    
}