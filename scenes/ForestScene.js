import PlayerManager from '/managers/PlayerManager.js';

export class ForestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'forest' });
    }

    preload() {
        this.load.spritesheet('playerIdle', 'assets/player/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('forest', 'assets/environment/forest-backdrop.png'); 
        this.load.image('evil-forest', 'assets/environment/forest-backdrop-evil.png'); 
        this.load.spritesheet('playerRun', 'assets/player/run/Run-Sheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('handsIdle', 'assets/player/idle/Knight Idle holding nothing.png', { frameWidth: 32, frameHeight: 32 }); 
        this.load.spritesheet('handsRun', 'assets/player/run/Knight Run holding nothing.png', { frameWidth: 64, frameHeight: 64 }); 
        this.load.spritesheet('forest-cutter', 'assets/npc/forest-cutter.png', { frameWidth: 90, frameHeight: 75 }); 

    }

    create() {
        this.forestBackdrop = this.forestBackdrop = this.add.image(320, 200, 'forest').setScale(0.4);
        this.evilForestBackdrop = this.add.image(320, 200, 'evil-forest').setScale(0.4).setVisible(false);

        this.playerManager = new PlayerManager(this); // initialize playermanager
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

        // check if the player is overlapping with the special walls
        if (this.physics.overlap(this.playerManager.player, this.specialWalls)) {
            this.playerManager.hide();
        } else {
            this.playerManager.show();
        }

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.toggleForest();
        }
    }

    toggleForest() {
        const isForestVisible = this.forestBackdrop.visible;

        this.forestBackdrop.setVisible(!isForestVisible);
        this.evilForestBackdrop.setVisible(isForestVisible);
    }

    changeScene() {
        this.scene.start('tavern'); 
    }
    
    createObstacles() {
        const obstacleConfigs = [
            { x: 0, y: 200, width: 400, height: 150 }, 
            { x: 0, y: 300, width: 200, height: 75 },  
            { x: 0, y: 0, width: 560, height: 300 },   
            { x: 300, y: 0, width: 260, height: 60 }, 
            { x: 600, y: 270, width: 425, height: 100 }, 
            { x: 700, y: 370, width: 425, height: 100 }, 
            { x: 700, y: 170, width: 325, height: 150 } 
        ];
    
        let dynamicObstacles = [];
        let y = 290;
        for (let x = 10; x <= 60; x += 10) {
            dynamicObstacles.push({ x, y, width: 200, height: 75 });
            y -= 10;
        }

        const allObstacles = [...obstacleConfigs, ...dynamicObstacles];
        this.obstacles = this.physics.add.staticGroup();
    
        allObstacles.forEach(config => {
            const obstacle = this.obstacles.create(config.x, config.y, null);
            obstacle.setSize(config.width, config.height).setOrigin(0, 0).setVisible(false);
        });
    
        this.physics.add.collider(this.playerManager.player, this.obstacles);
    }
    

    createSpecialWalls() {
    const specialWallConfigs = [
        { x: 165, y: 300, width: 50, height: 60 },
        { x: 395, y: 300, width: 50, height: 120 },
        { x: 445, y: 400, width: 50, height: 25 },
        { x: 520, y: 200, width: 150, height: 160 },
        { x: 540, y: 170, width: 150, height: 120 },
        { x: 600, y: 170, width: 120, height: 230 }
    ];

    this.specialWalls = this.physics.add.staticGroup();

    specialWallConfigs.forEach(config => {
        const wall = this.specialWalls.create(config.x, config.y, null);
        wall.setSize(config.width, config.height).setOrigin(0, 0).setVisible(false);
    });

    this.physics.add.overlap(this.playerManager.player, this.specialWalls);
}

    createForestCutterAnimation() {
        this.anims.create({
            key: 'forest-cutter-chop',
            frames: [
                { key: 'forest-cutter', frame: 0, duration: 100 }, 
                { key: 'forest-cutter', frame: 1, duration: 80 }, 
                { key: 'forest-cutter', frame: 2, duration: 70 }, 
                { key: 'forest-cutter', frame: 3, duration: 1000 },
                { key: 'forest-cutter', frame: 4, duration: 100 }, 
                { key: 'forest-cutter', frame: 5, duration: 30 }, 
                { key: 'forest-cutter', frame: 6, duration: 30 }, 
                { key: 'forest-cutter', frame: 7, duration: 830 }, 
                { key: 'forest-cutter', frame: 8, duration: 120 }  
            ],
            repeat: -1 
        });
    }
    
}
