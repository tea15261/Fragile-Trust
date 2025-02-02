import PlayerManager from '/managers/PlayerManager.js';
import PreloadManager from '/managers/PreloadManager.js';
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

        const playerX = this.cameras.main.width - 50; 
        const playerY = 230; 
        this.playerManager.player.setPosition(playerX, playerY);

        this.customCursor = this.add.sprite(0, 0, 'customCursor');
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
        this.physics.add.overlap(this.playerManager.player, this.battleStart, this.displayBattleUI, null, this);

        // Initialize MonsterManager.
        this.monsterManager = new MonsterManager(this);
        this.monsterManager.generateNewMonster();
        // Position the monster a bit left from the center.
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.monsterManager.monster.setPosition(centerX - 50, centerY);

        // Prevent the battle UI from being created more than once.
        this.battleUIShown = false;

        // Initialize custom cursor
        this.initializeCustomCursor();
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

    initializeCustomCursor() {
        // Create custom cursor if not already existing
        if (!this.customCursor) {
            this.customCursor = this.add.sprite(0, 0, 'customCursor')
                .setVisible(false)
                .setDepth(9999);
            
            this.input.on('pointermove', (pointer) => {
                this.customCursor.setVisible(true)
                    .setPosition(pointer.x, pointer.y);
            });
        } else {
            // Reset texture to default state
            this.customCursor.setTexture('customCursor');
        }
    }

    // ---------------------------------------------------------
    // Battle UI (4-option boxes) that slide in from the bottom.
    displayBattleUI(player, battleBox) {
        if (this.battleUIShown) return;
        this.battleUIShown = true;
    
        // Ensure custom cursor is initialized
        this.initializeCustomCursor();
    
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const boxWidth = screenWidth / 2;
        const boxHeight = 75;
        const optionLabels = ["Attack", "Skills", "Focus", "Run"];
    
        const finalPositions = [
            { x: 0, y: screenHeight - 2 * boxHeight },
            { x: boxWidth, y: screenHeight - 2 * boxHeight },
            { x: 0, y: screenHeight - boxHeight },
            { x: boxWidth, y: screenHeight - boxHeight }
        ];
    
        this.uiBoxes = [];
    
        for (let i = 0; i < 4; i++) {
            // Create a container starting offscreen at the bottom.
            const container = this.add.container(finalPositions[i].x, screenHeight + boxHeight);
    
            // Create a graphics object for the box background and border.
            const graphics = this.add.graphics();
            graphics.fillStyle(0x000000, 0.8);
            graphics.fillRect(0, 0, boxWidth, boxHeight);
            graphics.lineStyle(2, 0xffffff, 1);
            graphics.strokeRect(0, 0, boxWidth, boxHeight);
    
            // Create the label text.
            const text = this.add.text(boxWidth / 2, boxHeight / 2, optionLabels[i], {
                font: "18px Arial",
                fill: "#ffffff"
            }).setOrigin(0.5);
    
            // Add graphics and text to the container.
            container.add([graphics, text]);
            container.graphics = graphics; // Save a reference for later updates
    
            // Make the container interactive.
            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, boxWidth, boxHeight), Phaser.Geom.Rectangle.Contains);
    
            // Pointer event handlers to create a pop-out effect and change the cursor texture.
            container.on("pointerover", () => {
                // Set cursor to openCursor on hover.
                this.customCursor.setTexture("openCursor");
    
                // Tween the scale to make it larger (pop out).
                this.tweens.add({
                    targets: container,
                    scale: 1.1,
                    duration: 150,
                    ease: "Power1"
                });
                // Bring it to the front by increasing its depth.
                container.setDepth(10);
    
                // Redraw the box border in a different color to emphasize hover.
                container.graphics.clear();
                container.graphics.fillStyle(0x000000, 0.8);
                container.graphics.fillRect(0, 0, boxWidth, boxHeight);
                container.graphics.lineStyle(2, 0xff0000, 1); // Red border
                container.graphics.strokeRect(0, 0, boxWidth, boxHeight);
            });
    
            container.on("pointerout", () => {
                // Revert cursor texture when leaving the box.
                this.customCursor.setTexture("customCursor");
    
                // Tween back to the original scale.
                this.tweens.add({
                    targets: container,
                    scale: 1,
                    duration: 150,
                    ease: "Power1"
                });
                // Reset depth.
                container.setDepth(0);
    
                // Redraw the box border in its default style.
                container.graphics.clear();
                container.graphics.fillStyle(0x000000, 0.8);
                container.graphics.fillRect(0, 0, boxWidth, boxHeight);
                container.graphics.lineStyle(2, 0xffffff, 1); // White border
                container.graphics.strokeRect(0, 0, boxWidth, boxHeight);
            });
    
            container.on("pointerdown", () => {
                // Set the cursor texture to closedCursor on click/press.
                this.customCursor.setTexture("closedCursor");
                console.log("Clicked:", optionLabels[i]);
                // You can add more button click actions here.
            });
    
            container.on("pointerup", () => {
                // Return to openCursor if still hovering.
                this.customCursor.setTexture("openCursor");
            });
    
            this.uiBoxes.push(container);
        }
    
        // Animate the boxes into view from the bottom.
        this.uiBoxes.forEach((container, index) => {
            this.tweens.add({
                targets: container,
                y: finalPositions[index].y,
                duration: 500,
                ease: "Power2",
                delay: index * 100
            });
        });
    }
}
