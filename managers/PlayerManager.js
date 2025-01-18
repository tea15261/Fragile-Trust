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
        this.keyE = null; // Add this line
        
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

        this.hands = this.scene.add.sprite(this.player.x, this.player.y, 'handsIdle');
        this.hands.setOrigin(0.5, 1);
        this.hands.visible = false;

        this.createAnimations();
        this.player.anims.play('idle');

        // Initialize inventory UI
        this.initInventory();

        // Create blur shader (pseudo-blur by overlay)
       
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
        // Inventory dimensions and layout
        const inventoryCols = 5; // Number of columns in the inventory grid
        const inventoryRows = 3; // Number of rows in the inventory grid
        const cellSize = 40; // Size of each cell in the grid
        const spacing = 5; // Spacing between cells
        const hotbarYOffset = 20; // Offset for the hotbar below the grid
    
        // Calculate total inventory width and height
        const inventoryWidth = inventoryCols * (cellSize + spacing) - spacing;
        const inventoryHeight = inventoryRows * (cellSize + spacing) - spacing;
    
        // Calculate centered position for inventory
        const centerX = this.scene.cameras.main.width / 2 - inventoryWidth / 2;
        const centerY = this.scene.cameras.main.height / 2 - inventoryHeight / 2;
    
        // Create a container for the inventory UI
        this.inventoryContainer = this.scene.add.container(centerX, centerY);
    
        // Draw inventory background with a lighter color
        const inventoryBg = this.scene.add.rectangle(
            inventoryWidth / 2,
            inventoryHeight / 2,
            inventoryWidth + 20,
            inventoryHeight + 20,
            0x666666, // Lighter background color
            0.9
        );
        inventoryBg.setOrigin(0.5, 0.5);
    
        // Add the grid cells for inventory with the specified color
        for (let row = 0; row < inventoryRows; row++) {
            for (let col = 0; col < inventoryCols; col++) {
                const cellX = col * (cellSize + spacing);
                const cellY = row * (cellSize + spacing);
                const cell = this.scene.add.rectangle(
                    cellX,
                    cellY,
                    cellSize,
                    cellSize,
                    0x808080 // Cell color for inventory
                );
                cell.setOrigin(0, 0);
                cell.setStrokeStyle(2, 0xffffff); // Optional: Add border
                this.inventoryContainer.add(cell);
            }
        }
    
        // Create the single "hotbar" slot with the specified color
        const hotbarSlot = this.scene.add.rectangle(
            inventoryWidth / 2 - cellSize / 2,
            inventoryHeight + hotbarYOffset,
            cellSize,
            cellSize,
            0xC5C6D0 // Cell color for hotbar slot
        );
        hotbarSlot.setOrigin(0, 0);
        hotbarSlot.setStrokeStyle(2, 0xffff00); // Yellow border for distinction
    
        // Add background and elements to container
        this.inventoryContainer.add([inventoryBg, hotbarSlot]);
    
        // Hide inventory initially
        this.inventoryContainer.setVisible(false);
    }
    
    

    toggleInventory() {
        this.inventoryVisible = !this.inventoryVisible;
        this.inventoryContainer.setVisible(this.inventoryVisible);
    
        // Show or hide the blur filter based on inventory visibility
        //this.blurFilter.setVisible(this.inventoryVisible);
    
        if (this.inventoryVisible) {
            // Pause game updates
            this.scene.physics.pause();
            this.scene.anims.pauseAll();
        } else {
            // Resume game updates
            this.scene.physics.resume();
            this.scene.anims.resumeAll();
        }
    }
    

    update() {
        const speed = 160;

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