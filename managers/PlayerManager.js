import { SkillManager, SkillTreeUI } from '/managers/SkillManager.js';
export default class PlayerManager {
    constructor(scene, inBattle = false) {
        this.scene = scene;
        this.inBattle = inBattle;
        this.player = null;
        this.hands = null;
        this.shadow = null;
        this.inventoryVisible = false;
        this.inventoryContainer = null;
        this.keyToggleReady = true;
        this.keyE = null;
        this.customCursor = null;
        this.radarChart = null;
        this.radarLabels = [];
        this.statTexts = [];
        this.inventoryButton = null;

        this.skillManager = new SkillManager();
        const savedSkills = localStorage.getItem('ownedSkills');
        this.ownedSkills = savedSkills ? JSON.parse(savedSkills) : [];

        this.spaceBar = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.resetKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.escKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESCAPE);
        this.keyE = this.scene.input.keyboard.addKey('E');

        // Add WASD keys
        this.wKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Player Stats
        this.stats = {
            health: 100, // Health
            defense: 50, // Defense
            attack: 75, // Attack Power
            speed: 160, // Move Speed
            luck: 40, // Critical Hit
            agility: 80, // Dodge Chance
            mana: 80 // Magic Power
        };
        this.init();
    }

    init() {
        this.shadow = this.scene.add.ellipse(400, 100, 30, 10, 0x000000, 0.5);
        this.shadow.setOrigin(0.5, 1.5);
        this.keyE = this.scene.input.keyboard.addKey('E');

        this.player = this.scene.physics.add.sprite(450, 100, 'playerIdle');
        this.player.flipX = true;
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 1);
        this.player.setSize(32, 32);
        this.player.setOffset(0, 0);

        this.customCursor = this.scene.add.sprite(0, 0, 'customCursor')
            .setOrigin(0.5, 0.5)
            .setScale(0.6);
        this.customCursor.setDepth(10);

        this.hands = this.scene.add.sprite(this.player.x, this.player.y, 'handsIdle');
        this.hands.setOrigin(0.5, 1);
        this.hands.visible = false;

        this.createAnimations();
        this.player.anims.play('idle');

        this.initInventory();

        if (!this.inBattle) {
            this.drawRadarChart(250, 85, 55, this.stats);
            this.displayStatValues(350, 35, this.stats);
        }
    }

    showSkillTree() {
        if (!this.skillTreeUI) {
            this.skillTreeUI = new SkillTreeUI(this.scene, this.skillManager, {
                inventoryContainer: this.inventoryContainer,
                inventoryButton: this.inventoryButton,
                radarChart: this.radarChart,
                radarLabels: this.radarLabels,
                statTexts: this.statTexts,
                playerManager: this 
            });
        }
        this.skillTreeUI.showSkillTree();
    }
    
    hideSkillTree() {
        if (this.skillTreeUI) {
            this.skillTreeUI.hideSkillTree();
        }
    }

    addOwnedSkill(skillKey) {
        if (!this.ownedSkills.includes(skillKey)) {
            this.ownedSkills.push(skillKey);
            localStorage.setItem('ownedSkills', JSON.stringify(this.ownedSkills));
            console.log("Owned Skills:", this.ownedSkills);
        }
    }

    resetOwnedSkills() {
        localStorage.removeItem('ownedSkills');
        this.ownedSkills = [];
        console.log("Owned Skills have been reset:", this.ownedSkills);
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
    
        const inventoryYPosition = this.inBattle ? centerY - 100 : centerY + 50;
        this.inventoryContainer = this.scene.add.container(centerX, inventoryYPosition);
    
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
    
                cell.setInteractive();
    
                cell.on('pointerover', () => {
                    cell.setFillStyle(0xb3b3b3); 
                    cell.setStrokeStyle(2, 0xff0000); 
                });
                cell.on('pointerout', () => {
                    cell.setFillStyle(0x808080); 
                    cell.setStrokeStyle(2, 0xffffff); 
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
    
        hotbarSlot.setInteractive();
    
        hotbarSlot.on('pointerover', () => {
            hotbarSlot.setFillStyle(0xb3b3b3); 
            hotbarSlot.setStrokeStyle(2, 0xff0000); 
        });
    
        hotbarSlot.on('pointerout', () => {
            hotbarSlot.setFillStyle(0xC5C6D0); 
            hotbarSlot.setStrokeStyle(2, 0xffff00); 
        });
    
        this.inventoryContainer.add([inventoryBg, hotbarSlot]);
        this.inventoryContainer.setVisible(false);

        const inventoryRightEdge = centerX + inventoryWidth;
        const buttonX = inventoryRightEdge + 20;
        const buttonY = this.scene.cameras.main.height / 2;

        if(!this.inBattle) {
            this.inventoryButton = this.scene.add.graphics({ x: buttonX, y: buttonY });
        const trapezoidPoints = [
            { x: 0,  y: -150 },   // left top (touching inventory)
            { x: 0,  y: 150 },    // left bottom
            { x: 20, y: 130 },    // right bottom (shorter)
            { x: 20, y: -130 }    // right top (shorter)
        ];

        this.inventoryButton.fillStyle(0x808080, 1);
        this.inventoryButton.beginPath();
        this.inventoryButton.moveTo(trapezoidPoints[0].x, trapezoidPoints[0].y);
        for (let i = 1; i < trapezoidPoints.length; i++) {
            this.inventoryButton.lineTo(trapezoidPoints[i].x, trapezoidPoints[i].y);
        }
        this.inventoryButton.closePath();
        this.inventoryButton.fillPath();
    
        const trianglePoints = [
            { x: 18, y: 0 },   
            { x: 8,  y: -10 },
            { x: 8,  y: 10 }
        ];
    
        this.inventoryButton.fillStyle(0x606060, 1);
        this.inventoryButton.beginPath();
        this.inventoryButton.moveTo(trianglePoints[0].x, trianglePoints[0].y);
        for (let i = 1; i < trianglePoints.length; i++) {
            this.inventoryButton.lineTo(trianglePoints[i].x, trianglePoints[i].y);
        }
        this.inventoryButton.closePath();
        this.inventoryButton.fillPath();
    
        const hitArea = new Phaser.Geom.Polygon(trapezoidPoints);
        this.inventoryButton.setInteractive(hitArea, Phaser.Geom.Polygon.Contains);
    
        this.inventoryButton.on('pointerover', () => {
            this.inventoryButton.clear();
            this.inventoryButton.fillStyle(0x909090, 1);
            this.inventoryButton.beginPath();
            this.inventoryButton.moveTo(trapezoidPoints[0].x, trapezoidPoints[0].y);
            for (let i = 1; i < trapezoidPoints.length; i++) {
                this.inventoryButton.lineTo(trapezoidPoints[i].x, trapezoidPoints[i].y);
            }
            this.inventoryButton.closePath();
            this.inventoryButton.fillPath();
            this.inventoryButton.fillStyle(0x606060, 1);
            this.inventoryButton.beginPath();
            this.inventoryButton.moveTo(trianglePoints[0].x, trianglePoints[0].y);
            for (let i = 1; i < trianglePoints.length; i++) {
                this.inventoryButton.lineTo(trianglePoints[i].x, trianglePoints[i].y);
            }
            this.inventoryButton.closePath();
            this.inventoryButton.fillPath();
        });
        this.inventoryButton.on('pointerout', () => {
            this.inventoryButton.clear();
            this.inventoryButton.fillStyle(0x808080, 1);
            this.inventoryButton.beginPath();
            this.inventoryButton.moveTo(trapezoidPoints[0].x, trapezoidPoints[0].y);
            for (let i = 1; i < trapezoidPoints.length; i++) {
                this.inventoryButton.lineTo(trapezoidPoints[i].x, trapezoidPoints[i].y);
            }
            this.inventoryButton.closePath();
            this.inventoryButton.fillPath();
            this.inventoryButton.fillStyle(0x606060, 1);
            this.inventoryButton.beginPath();
            this.inventoryButton.moveTo(trianglePoints[0].x, trianglePoints[0].y);
            for (let i = 1; i < trianglePoints.length; i++) {
                this.inventoryButton.lineTo(trianglePoints[i].x, trianglePoints[i].y);
            }
            this.inventoryButton.closePath();
            this.inventoryButton.fillPath();
        });
    
        this.inventoryButton.on('pointerdown', () => {
            this.showSkillTree();
        });
    
        this.inventoryButton.visible = false;
        }
        
    }

    toggleInventory() {
        this.inventoryVisible = !this.inventoryVisible;
        this.inventoryContainer.setVisible(this.inventoryVisible);
        this.inventoryContainer.setDepth(5);
        
        if (this.radarChart) {
            this.radarChart.visible = this.inventoryVisible;
        }
        if (this.radarLabels) {
            this.radarLabels.forEach(label => label.setVisible(this.inventoryVisible));
        }
        if (this.statTexts) {
            this.statTexts.forEach(text => text.setVisible(this.inventoryVisible));
        }

        if (this.inventoryButton) {
            this.inventoryButton.visible = this.inventoryVisible;
        }
    
        if (this.inventoryVisible) {
            this.scene.physics.pause();
            this.scene.anims.pauseAll();
        } else {
            this.scene.physics.resume();
            this.scene.anims.resumeAll();
        }
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            console.log("Player Stats:", this.stats);
            console.log("Owned Skills:", this.ownedSkills);
        }

        if (Phaser.Input.Keyboard.JustDown(this.resetKey)) {
            this.resetOwnedSkills();
        }

        if (this.skillTreeUI && this.skillTreeUI.skillTreeContainer && this.skillTreeUI.skillTreeContainer.visible) {
            this.skillTreeUI.update();
        }

        const speed = this.stats.speed;

        this.customCursor.x = this.scene.input.x;
        this.customCursor.y = this.scene.input.y;

        this.player.setVelocityX(0);
        this.player.setVelocityY(0);

        if ((this.keyE.isDown || this.escKey.isDown) && this.keyToggleReady) {
            if (this.inventoryVisible || (this.skillTreeContainer && this.skillTreeContainer.visible)) {
                this.hideUI();
            } else {
                this.toggleInventory();
            }
            this.keyToggleReady = false;
        } else if (this.keyE.isUp && this.escKey.isUp) {
            this.keyToggleReady = true;
        }

        if (this.inventoryVisible) {
            this.customCursor.setTexture('openCursor');
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            
            this.player.anims.play('idle', true);
            this.hands.visible = true;
            this.hands.anims.play('handsIdle', true);
            this.hands.x = this.player.x;
            this.hands.y = this.player.y;
            
            this.shadow.x = this.player.x;
            this.shadow.y = this.player.y + 8;
            
            return;
        } else {
            this.customCursor.setTexture('customCursor');
        }

        const velocity = { x: 0, y: 0 };

        // Movement logic.
        if (this.scene.cursors.left.isDown || this.aKey.isDown) {
            velocity.x = -speed;
            this.player.flipX = true;
            this.hands.x = this.player.x - 4;
        } else if (this.scene.cursors.right.isDown || this.dKey.isDown) {
            velocity.x = speed;
            this.player.flipX = false;
            this.hands.x = this.player.x + 4;
        }

        if (this.scene.cursors.up.isDown || this.wKey.isDown) {
            velocity.y = -speed;
            this.hands.y = this.player.y - 2;
        } else if (this.scene.cursors.down.isDown || this.sKey.isDown) {
            velocity.y = speed;
            this.hands.y = this.player.y + 4;
        }

        // Diagonal movement normalization.
        if (velocity.x !== 0 && velocity.y !== 0) {
            const normalizationFactor = Math.sqrt(2) / 2;
            velocity.x *= normalizationFactor;
            velocity.y *= normalizationFactor;
        }

        this.player.setVelocity(velocity.x, velocity.y);

        if (!this.scene.cursors.up.isDown && !this.scene.cursors.down.isDown && !this.wKey.isDown && !this.sKey.isDown) {
            this.hands.y = this.player.y + 2;
        }

        this.shadow.x = this.player.x;
        this.shadow.y = this.player.y + 8;

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

    hideUI() {
        if(!this.inBattle) {
            this.inventoryButton.visible = false;
        
            // Hide the radar chart and stat texts.
            if (this.radarChart) {
                this.radarChart.visible = false;
            }
            if (this.radarLabels) {
                this.radarLabels.forEach(label => label.setVisible(false));
            }
            if (this.statTexts) {
                this.statTexts.forEach(text => text.setVisible(false));
            }
            
            // Hide skill tree UI if it exists.
            if (this.skillTreeContainer) {
                this.skillTreeContainer.visible = false;
            }
        }
        this.inventoryContainer.setVisible(false);
        this.inventoryVisible = false;
        this.scene.physics.resume();
        this.scene.anims.resumeAll();
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

    drawRadarChart(x, y, radius, stats) {
        const axes = ["health", "defense", "attack", "speed", "luck", "agility", "mana"];
        const numAxes = axes.length;
    
        const maxValues = {
            health: 500,
            defense: 250,
            attack: 250,
            speed: 420,
            luck: 160,
            agility: 250,
            mana: 250
        };
    
        const graphics = this.scene.add.graphics();
        graphics.visible = false;
    
        // Semi-transparent background
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillCircle(x, y, radius + 10);
    
        graphics.lineStyle(1, 0xffffff, 0.5);
        const gridLevels = 5;
        for (let level = 1; level <= gridLevels; level++) {
            const levelRadius = (radius * level) / gridLevels;
            const points = [];
            for (let i = 0; i < numAxes; i++) {
                const angle = Phaser.Math.DegToRad((360 / numAxes) * i - 90);
                const dx = x + levelRadius * Math.cos(angle);
                const dy = y + levelRadius * Math.sin(angle);
                points.push(new Phaser.Math.Vector2(dx, dy));
            }
            graphics.strokePoints(points, true);
        }
    
        // Draw axis lines
        for (let i = 0; i < numAxes; i++) {
            const angle = Phaser.Math.DegToRad((360 / numAxes) * i - 90);
            const dx = x + radius * Math.cos(angle);
            const dy = y + radius * Math.sin(angle);
            graphics.lineBetween(x, y, dx, dy);
        }
    
        const dataPoints = [];
        for (let i = 0; i < numAxes; i++) {
            const stat = axes[i];
            const value = stats[stat] !== undefined ? stats[stat] : 0;
            const maxValue = maxValues[stat];
            const proportion = Phaser.Math.Clamp(value / maxValue, 0, 1);
            const dataRadius = proportion * radius;
            const angle = Phaser.Math.DegToRad((360 / numAxes) * i - 90);
            const dx = x + dataRadius * Math.cos(angle);
            const dy = y + dataRadius * Math.sin(angle);
            dataPoints.push(new Phaser.Math.Vector2(dx, dy));
        }
    
        // Radar shape
        graphics.fillStyle(0xff0000, 0.3); // Reduced alpha for better visibility
        graphics.fillPoints(dataPoints, true); // Properly closing shape
        graphics.lineStyle(2, 0xff0000, 1);
        graphics.strokePoints(dataPoints, true);
    
        // Labels for each axis
        this.radarLabels = [];
        for (let i = 0; i < numAxes; i++) {
            const stat = axes[i];
            const angle = Phaser.Math.DegToRad((360 / numAxes) * i - 90);
            const labelX = x + (radius + 20) * Math.cos(angle);
            const labelY = y + (radius + 20) * Math.sin(angle);
            let label = this.scene.add.text(
                labelX,
                labelY,
                stat.charAt(0).toUpperCase() + stat.slice(1),
                { 
                    fontSize: '12px', 
                    fill: '#ffffff', 
                    fontFamily: 'Arial', 
                    shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true } 
                }
            ).setOrigin(0.5);
            label.visible = false;
            this.radarLabels.push(label);
        }
    
        this.radarChart = graphics;
    }
    
    displayStatValues(x, y, stats) {
        const axes = ["health", "defense", "attack", "speed", "luck", "agility", "mana"];
        const spacing = 20; // Increased spacing for better readability
    
        this.statTexts = axes.map((stat, index) => {
            const statValue = stats[stat] !== undefined ? stats[stat] : 0;
            const text = this.scene.add.text(
                x,
                y + index * spacing,
                `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${statValue}`,
                { 
                    fontSize: '16px', 
                    fill: '#ffffff', 
                    fontFamily: 'Arial', 
                    shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true } 
                }
            ).setOrigin(0, 0.5);
            text.visible = false; 
            return text;
        });
    }
    
    
}
