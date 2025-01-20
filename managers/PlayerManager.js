export default class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.hands = null;
        this.shadow = null;
        this.playerState = 'holdingNothing';
        this.inventoryVisible = false;
        this.inventoryContainer = null;
        this.blurFilter = null;
        this.keyToggleReady = true;
        this.keyE = null;
        this.customCursor = null;

        // Player stats
        this.health = 100;
        this.defense = 50;
        this.attack = 75;

        // Stat bars
        this.healthBar = null;
        this.defenseBar = null;
        this.attackBar = null;

        this.init();
    }

    init() {
        this.shadow = this.scene.add.ellipse(400, 100, 30, 10, 0x000000, 0.5);
        this.shadow.setOrigin(0.5, 1.5);
        this.keyE = this.scene.input.keyboard.addKey('E');

        // Create player and hands sprites
        this.player = this.scene.physics.add.sprite(450, 100, 'playerIdle');
        this.player.flipX = true;
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 1);
        this.player.setSize(32, 32);
        this.player.setOffset(0, 0);

        this.customCursor = this.scene.add.sprite(0, 0, 'customCursor').setOrigin(0.5, 0.5).setScale(0.6);
        this.customCursor.setDepth(10);

        this.hands = this.scene.add.sprite(this.player.x, this.player.y, 'handsIdle');
        this.hands.setOrigin(0.5, 1);
        this.hands.visible = false;

        this.createAnimations();
        this.player.anims.play('idle');

        this.initInventory();
        this.initStats();
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNumbers('playerIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'run',
            frames: this.scene.anims.generateFrameNumbers('playerRun', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'handsIdle',
            frames: this.scene.anims.generateFrameNumbers('handsIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'handsRun',
            frames: this.scene.anims.generateFrameNumbers('handsRun', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
    }

    initInventory() {
        const inventoryCols = 5;
        const inventoryRows = 3;
        const cellSize = 40;
        const spacing = 5;
        const hotbarYOffset = 20;
    
        const inventoryWidth = inventoryCols * (cellSize + spacing) - spacing;
        const inventoryHeight = inventoryRows * (cellSize + spacing) - spacing;
    
        const centerX = this.scene.cameras.main.width / 2 - inventoryWidth / 2;
        const centerY = this.scene.cameras.main.height / 2 - inventoryHeight / 2;
    
        this.inventoryContainer = this.scene.add.container(centerX, centerY);
    
        const inventoryBg = this.scene.add.rectangle(
            inventoryWidth / 2,
            inventoryHeight / 2,
            inventoryWidth + 20,
            inventoryHeight + 20,
            0x666666,
            0.9
        );
        inventoryBg.setOrigin(0.5, 0.5);
        inventoryBg.setStrokeStyle(2, 0x787276);
    
        for (let row = 0; row < inventoryRows; row++) {
            for (let col = 0; col < inventoryCols; col++) {
                const cellX = col * (cellSize + spacing);
                const cellY = row * (cellSize + spacing);
                const cell = this.scene.add.rectangle(
                    cellX,
                    cellY,
                    cellSize,
                    cellSize,
                    0x808080
                );
                cell.setOrigin(0, 0);
                cell.setStrokeStyle(2, 0xffffff);
    
                // Enable interaction for hover effect
                cell.setInteractive();
    
                // Hover effect logic
                cell.on('pointerover', () => {
                    cell.setFillStyle(0xb3b3b3); // Lighten the background
                    cell.setStrokeStyle(2, 0xff0000); // Add a red outline
                });
                cell.on('pointerout', () => {
                    cell.setFillStyle(0x808080); // Reset background color
                    cell.setStrokeStyle(2, 0xffffff); // Reset outline
                });
    
                this.inventoryContainer.add(cell);
            }
        }
    
        const hotbarSlot = this.scene.add.rectangle(
            inventoryWidth / 2 - cellSize / 2,
            inventoryHeight + hotbarYOffset,
            cellSize,
            cellSize,
            0xC5C6D0
        );
        hotbarSlot.setOrigin(0, 0);
        hotbarSlot.setStrokeStyle(2, 0xffff00);
    
        // Add fists to hotbar if holding nothing
        if (this.playerState === 'holdingNothing') {
            const fistsIcon = this.scene.add.sprite(
                inventoryWidth / 2,
                inventoryHeight + hotbarYOffset + cellSize / 2,
                'fists'
            );
            fistsIcon.setOrigin(0.5, 0.5);
            fistsIcon.setScale(0.8);
            
            // Debug logging
            console.log('Fists sprite created:', fistsIcon);
            
            // Make sure the sprite exists and is added to the container
            if (fistsIcon) {
                this.inventoryContainer.add(fistsIcon);
                // Store reference to fists icon
                this.fistsIcon = fistsIcon;
            } else {
                console.error('Failed to create fists sprite');
            }
        }
    
        hotbarSlot.setInteractive();
    
        hotbarSlot.on('pointerover', () => {
            hotbarSlot.setFillStyle(0xb3b3b3); // Lighten the background
            hotbarSlot.setStrokeStyle(2, 0xff0000); // Add a red outline
        });
    
        hotbarSlot.on('pointerout', () => {
            hotbarSlot.setFillStyle(0xC5C6D0); // Reset background color
            hotbarSlot.setStrokeStyle(2, 0xffff00); // Reset outline
        });
    
        this.inventoryContainer.add([inventoryBg, hotbarSlot]);
        this.inventoryContainer.setVisible(false);
    }
    
    
    

    initStats() {
        const barSpacing = 20;
    
        const statsX = 140; 
        const statsY = 140;
    
        this.healthBar = this.createStatBar(statsX, statsY, 100, 10, 0xff0000, 'Health');
        this.defenseBar = this.createStatBar(statsX, statsY + barSpacing, 100, 10, 0xa0522d, 'Defense');
        this.attackBar = this.createStatBar(statsX, statsY + 2 * barSpacing, 100, 10, 0xffff00, 'Attack');
    
        this.healthBar.text.setStroke('#000', 1.5);
        this.defenseBar.text.setStroke('#000', 1.5);
        this.attackBar.text.setStroke('#000', 1.5);

        this.setStatBarsVisibility(false);
    }
    
    
    setStatBarsVisibility(visible) {
        this.healthBar.bar.setVisible(visible);
        this.healthBar.border.setVisible(visible);
        this.healthBar.text.setVisible(visible);
    
        this.defenseBar.bar.setVisible(visible);
        this.defenseBar.border.setVisible(visible);
        this.defenseBar.text.setVisible(visible);
    
        this.attackBar.bar.setVisible(visible);
        this.attackBar.border.setVisible(visible);
        this.attackBar.text.setVisible(visible);
    }

    createStatBar(x, y, width, height, color, label) {
        const bar = this.scene.add.rectangle(x, y, width, height, color).setOrigin(0.5, 0.5);
        const border = this.scene.add.rectangle(x, y, width + 2, height + 2).setStrokeStyle(2, 0xffffff).setOrigin(0.5, 0.5);
        const text = this.scene.add.text(x - width / 2 - 10, y - height / 2, label, { fontSize: '12px', color: '#ffffff' })
            .setOrigin(0, 0.5)
            .setStroke('#000000', 1.5);
    
        return { bar, border, text };
    }
    

    updateStatBars() {
        this.healthBar.bar.width = this.health;
        this.defenseBar.bar.width = this.defense;
        this.attackBar.bar.width = this.attack;
    }

    toggleInventory() {
        this.inventoryVisible = !this.inventoryVisible;
        this.inventoryContainer.setVisible(this.inventoryVisible);
        const statVisibility = this.inventoryVisible;
        this.healthBar.bar.setVisible(statVisibility);
        this.healthBar.border.setVisible(statVisibility);
        this.healthBar.text.setVisible(statVisibility);

        this.defenseBar.bar.setVisible(statVisibility);
        this.defenseBar.border.setVisible(statVisibility);
        this.defenseBar.text.setVisible(statVisibility);

        this.attackBar.bar.setVisible(statVisibility);
        this.attackBar.border.setVisible(statVisibility);
        this.attackBar.text.setVisible(statVisibility);

        if (this.inventoryVisible) {
            this.scene.physics.pause();
            this.scene.anims.pauseAll();
        } else {
            this.scene.physics.resume();
            this.scene.anims.resumeAll();
        }
    }
    

    update() {
        const speed = 160;

        this.updateStatBars();
        this.customCursor.x = this.scene.input.x;
        this.customCursor.y = this.scene.input.y;

        this.player.setVelocityX(0);
        this.player.setVelocityY(0);

        // Handle inventory toggle separately from movement
        if (this.keyE.isDown && this.keyToggleReady) {
            this.toggleInventory();
            this.keyToggleReady = false;
        } else if (this.keyE.isUp) {
            this.keyToggleReady = true;
        }

        // If inventory is visible, skip movement updates but still update positions
        if (this.inventoryVisible) {
            this.customCursor.setTexture('openCursor');
            // Reset velocity
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            
            // Update animations to idle
            this.player.anims.play('idle', true);
            this.hands.visible = true;
            this.hands.anims.play('handsIdle', true);
            this.hands.x = this.player.x;
            this.hands.y = this.player.y;
            
            // Update shadow
            this.shadow.x = this.player.x;
            this.shadow.y = this.player.y + 8;
            
            return;
        } else {
            this.customCursor.setTexture('customCursor');
        }

        const velocity = { x: 0, y: 0 };

        // Movement logic
        if (this.scene.cursors.left.isDown) {
            velocity.x = -speed;
            this.player.flipX = true;
            this.hands.x = this.player.x - 4;
        } else if (this.scene.cursors.right.isDown) {
            velocity.x = speed;
            this.player.flipX = false;
            this.hands.x = this.player.x + 4;
        }

        if (this.scene.cursors.up.isDown) {
            velocity.y = -speed;
            this.hands.y = this.player.y - 2;
        } else if (this.scene.cursors.down.isDown) {
            velocity.y = speed;
            this.hands.y = this.player.y + 4;
        }

        // Normalize diagonal movement
        if (velocity.x !== 0 && velocity.y !== 0) {
            const normalizationFactor = Math.sqrt(2) / 2;
            velocity.x *= normalizationFactor;
            velocity.y *= normalizationFactor;
        }

        // Apply velocity
        this.player.setVelocity(velocity.x, velocity.y);

        // Reset hands position if no vertical movement
        if (!this.scene.cursors.up.isDown && !this.scene.cursors.down.isDown) {
            this.hands.y = this.player.y + 2;
        }

        // Update shadow position
        this.shadow.x = this.player.x;
        this.shadow.y = this.player.y + 8;

        // Update animations based on movement
        if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
            this.player.anims.play('run', true);
            this.hands.visible = true;
            this.hands.anims.play('handsRun', true);
        } else {
            this.player.anims.play('idle', true);
            this.hands.visible = true;
            this.hands.anims.play('handsIdle', true);
            this.hands.x = this.player.x;
            this.hands.y = this.player.y;
        }

        // Toggle inventory with "E" key
        if (this.keyE.isDown && this.keyToggleReady) {
            this.toggleInventory();
            this.keyToggleReady = false;
        } else if (this.keyE.isUp) {
            this.keyToggleReady = true;
        }
    }
    

    hide() {
        this.player.setVisible(false);
        this.hands.setVisible(false);
        this.shadow.setVisible(false); 
    }

    show() {
        this.player.setVisible(true);
        this.hands.setVisible(true);
        this.shadow.setVisible(true); 
    }
}