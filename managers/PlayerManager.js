import { SkillManager, SkillTreeUI } from '/managers/SkillManager.js';
import LootManager from '/managers/LootManager.js';
export default class PlayerManager {
    constructor(scene, inBattle = false) {
        this.scene = scene;
        this.inBattle = inBattle;
        this.inputDisabled = false;  // new flag: when true, no movement or inventory toggles
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

        // Create an instance of LootManager to handle item descriptions (and future loot functions).
        this.lootManager = new LootManager(this.scene);

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

        // Default persistent stats
        const defaultStats = { 
            coins: 1000, 
            attack: 5, 
            speed: 160, 
            luck: 200, 
            agility: 80 
        };

        // Load saved stats, if any
        let savedStats = localStorage.getItem('playerPersistentStats')
            ? JSON.parse(localStorage.getItem('playerPersistentStats'))
            : {};


        // Merge defaults with the saved stats (saved values override defaults, except for luck if too low)
        this.stats = { ...defaultStats, ...savedStats };

        // Save updated stats back to localStorage to prevent future issues.
        localStorage.setItem('playerPersistentStats', JSON.stringify(this.stats));

        this.stats = {
            health: 10,       // Temporary – will be refilled after battle
            defense: 50,        // Temporary – will be refilled after battle
            mana: 80,           // Temporary – will be refilled after battle
            attack: this.stats.attack,
            speed: this.stats.speed,
            luck: this.stats.luck,
            agility: this.stats.agility,
            coins: this.stats.coins
        };

        this.inventory = localStorage.getItem('inventory')
            ? JSON.parse(localStorage.getItem('inventory'))
            : [];

        this.inventoryData = localStorage.getItem('inventoryData')
            ? JSON.parse(localStorage.getItem('inventoryData'))
            : new Array(15).fill(null); // e.g., 15 available slots

        // Add a flag to check if the shop is open
        this.shopOpen = false;

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

        // Restore stats from localStorage if available
        let savedStats = localStorage.getItem('playerPersistentStats')
            ? JSON.parse(localStorage.getItem('playerPersistentStats'))
            : {};
        this.stats = { ...this.stats, ...savedStats };

        // Update radar chart and stat texts to reflect loaded stats
        if (!this.inBattle) {
            if (this.radarChart) this.radarChart.destroy();
            this.drawRadarChart(250, 85, 55, this.stats);
            this.displayStatValues(350, 35, this.stats);
            this.animateRadarChartUpdate();
            this.animateStatTextsUpdate();
        }
    }

    saveStatsToLocalStorage() {
        localStorage.setItem('playerPersistentStats', JSON.stringify(this.stats));
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

    resetAll() {
        // Clear local storage
        localStorage.clear();
      
        // Reset model data to default values
        this.inventory = [];
        this.inventoryData = new Array(15).fill(null);

        this.ownedSkills = [];
        
        // Optionally reset other persistent stats (coins, skills, etc.)
        const defaultStats = {
          coins: 1000,
          attack: 75,
          speed: 160,
          luck: 200,
          agility: 80
        };
        this.stats.coins = defaultStats.coins;
        localStorage.setItem('playerPersistentStats', JSON.stringify(defaultStats));
      
        // Update the visual display so the reset persists across scenes.
        if (this.updateInventoryDisplay) {
          this.updateInventoryDisplay();
        }
        console.log("All persistent data has been reset.");
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
        this.inventoryContainer.add(inventoryBg);
    
        // Create grid cells and store slot info.
        this.inventorySlots = [];
        for (let row = 0; row < inventoryRows; row++) {
            for (let col = 0; col < inventoryCols; col++) {
                const cellX = col * (cellSize + spacing);
                const cellY = row * (cellSize + spacing);
                const cell = this.scene.add.rectangle(cellX, cellY, cellSize, cellSize, 0x808080);
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
                // Store slot data. (You can use an arbitrary offset so items appear centered within the cell.)
                this.inventorySlots.push({
                    x: cellX,
                    y: cellY,
                    width: cellSize,
                    height: cellSize,
                    index: row * inventoryCols + col
                });
            }
        }
    
        // (The rest of your inventory code for hotbar, coin pouch, etc. remains here.)
        // …
        // Create a container to hold inventory item images.
        this.inventoryItemsGroup = this.scene.add.container(0, 0);
        this.inventoryContainer.add(this.inventoryItemsGroup);
        // Initially update the visual display.
        this.updateInventoryDisplay();
    
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
    
        this.inventoryContainer.add([hotbarSlot]);
    
        // Add coin pouch icon
        const coinPouchX = inventoryWidth / 2 + cellSize / 2 + spacing + 2;
        const coinPouchY = inventoryHeight + hotbarYOffset + 8;
        const defaultScale = 1.9;
        const coinPouch = this.scene.add.image(coinPouchX, coinPouchY, 'coinPouch');

        coinPouch.setDisplaySize(cellSize, cellSize);
        coinPouch.setScale(defaultScale);
        coinPouch.setOrigin(0, 0);
        coinPouch.setInteractive();
    
        /// Add coin text and assign to this.coinText for global update.
        const coinText = this.scene.add.text(
            coinPouchX + cellSize + 10,
            coinPouchY + cellSize / 2,
            `Coins: ${this.stats.coins}`,
            { fontSize: '16px', fill: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold' }
        ).setOrigin(0, 0.5);
        coinText.setVisible(false);
        // Save coinText to the player manager so ShopManager can update it.
        this.coinText = coinText;
    
        coinPouch.on('pointerover', () => {
            // Increase scale relative to the default (e.g., 10% larger than default)
            coinPouch.setScale(defaultScale * 1.1);
            coinText.setVisible(true);
        });
    
        coinPouch.on('pointerout', () => {
            // Revert back to the default scale instead of 1
            coinPouch.setScale(defaultScale);
            coinText.setVisible(false);
        });
    
        this.inventoryContainer.add([coinPouch, coinText]);
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

    removeInventoryItem(itemKey, amount) {
        console.log("removeInventoryItem() called. itemKey:", itemKey, "amount to remove:", amount);
        let remaining = amount;
    
        // Update the main inventory array:
        for (let i = 0; i < this.inventory.length && remaining > 0; i++) {
            let invItem = this.inventory[i];
            // if item stored as an object:
            if (typeof invItem === "object" && invItem.key === itemKey) {
                if (invItem.count > remaining) {
                    console.log("Subtracting", remaining, "from inventory object at index", i, "old count:", invItem.count);
                    invItem.count -= remaining;
                    remaining = 0;
                } else {
                    console.log("Removing entire inventory object at index", i, "with count:", invItem.count);
                    remaining -= invItem.count;
                    this.inventory.splice(i, 1);
                    i--; // adjust index after removal
                }
            }
            // if item stored as a string:
            else if (typeof invItem === "string" && invItem === itemKey) {
                console.log("Removing string inventory item at index", i);
                this.inventory.splice(i, 1);
                remaining--;
                i--;
            }
        }
        console.log("Final inventory:", JSON.stringify(this.inventory));
        
        // Reset remaining for inventoryData update.
        remaining = amount;
        // Update the visual inventoryData array:
        for (let i = 0; i < this.inventoryData.length && remaining > 0; i++) {
            let dataItem = this.inventoryData[i];
            if (!dataItem) continue;
            if (dataItem.key === itemKey) {
                if (dataItem.count > remaining) {
                    console.log("Subtracting", remaining, "from visual entry at index", i, "old count:", dataItem.count);
                    dataItem.count -= remaining;
                    remaining = 0;
                } else {
                    console.log("Removing visual entry at index", i, "with count:", dataItem.count);
                    remaining -= dataItem.count;
                    this.inventoryData.splice(i, 1);
                    i--; // adjust index after removal
                }
            }
        }
        console.log("Final inventoryData:", JSON.stringify(this.inventoryData));
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
        localStorage.setItem('inventoryData', JSON.stringify(this.inventoryData));
    }

    createTooltip(itemKey, x, y) {
        // Destroy any existing tooltip
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }

        // Get the loot object for the item
        const lootObj = this.lootManager.getLootItem(itemKey);
        const itemName = lootObj && lootObj.name ? lootObj.name : itemKey;
        const description = lootObj && lootObj.description ? lootObj.description : "No description available.";

        // Create the tooltip background
        const padding = 10;
        const tooltipBg = this.scene.add.graphics();
        tooltipBg.fillStyle(0x000000, 0.8);
        tooltipBg.fillRoundedRect(0, 0, 200, 60, 8);

        // Create the item name text (now using itemName)
        const nameText = this.scene.add.text(10, 5, itemName, {
            fontSize: "14px",
            fill: "#FFD700",
            fontStyle: "bold"
        });

        // Create the description text
        const descriptionText = this.scene.add.text(10, 25, description, {
            fontSize: "12px",
            fill: "#FFFFFF",
            wordWrap: { width: 180 }
        });

        // Create a container for the tooltip
        this.tooltip = this.scene.add.container(x, y, [tooltipBg, nameText, descriptionText]);

        // Adjust the background size to fit the text
        const bgWidth = Math.max(nameText.width, descriptionText.width) + padding * 2;
        const bgHeight = nameText.height + descriptionText.height + padding * 2;
        tooltipBg.clear();
        tooltipBg.fillStyle(0x000000, 0.8);
        tooltipBg.fillRoundedRect(0, 0, bgWidth, bgHeight, 8);

        // Adjust the position of the text
        nameText.setPosition(padding, padding);
        descriptionText.setPosition(padding, nameText.height + padding);

        this.tooltip.setDepth(9);
    }
    
    destroyTooltip() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    }

    updateInventoryDisplay() {
    // Clear previous item images
    this.inventoryItemsGroup.removeAll(true);

    // For each slot defined in inventorySlots, if there is an item, add its image.
    this.inventorySlots.forEach(slot => {
        const itemData = this.inventoryData[slot.index];
        if (itemData) {
            // Place the item image centered in the slot
            const itemImage = this.scene.add.image(
                slot.x + 20, // center X in the cell (assuming cellSize ~40)
                slot.y + 20, // center Y
                itemData.key
            )
                .setDisplaySize(40, 40)
                .setOrigin(0.5);

            itemImage.setInteractive();

            // Add hover events to show/hide tooltip
            itemImage.on("pointerover", (pointer) => {
                this.createTooltip(itemData.key, pointer.x + 10, pointer.y + 10);
            });
            itemImage.on("pointerout", () => {
                this.destroyTooltip();
            });

            // New pointerdown event for using consumables
            itemImage.on("pointerdown", () => {
                // Only allow using consumables (potions)
                const itemData = this.inventoryData[slot.index];
                if (!itemData) return;
                const itemObj = this.lootManager.getLootItem(itemData.key);
                if (!itemObj || itemObj.type !== "consumable") return;

                let used = false;
                // Health Potion
                if (itemObj.healthRestore) {
                    this.animateStatChange('health', this.stats.health, this.stats.health + itemObj.healthRestore);
                    this.stats.health += itemObj.healthRestore;
                    used = true;
                }
                // Mana Potion
                if (itemObj.manaRestore) {
                    this.animateStatChange('mana', this.stats.mana, this.stats.mana + itemObj.manaRestore);
                    this.stats.mana += itemObj.manaRestore;
                    used = true;
                }
                // Defense Potion
                if (itemObj.defenseRestore) {
                    this.animateStatChange('defense', this.stats.defense, this.stats.defense + itemObj.defenseRestore);
                    this.stats.defense += itemObj.defenseRestore;
                    used = true;
                }
                // Luck Potion
                if (itemObj.luckBoost) {
                    this.animateStatChange('luck', this.stats.luck, this.stats.luck + itemObj.luckBoost);
                    this.stats.luck += itemObj.luckBoost;
                    used = true;
                }
                // Agility Potion
                if (itemObj.dodgeBoost) {
                    this.animateStatChange('agility', this.stats.agility, this.stats.agility + itemObj.dodgeBoost);
                    this.stats.agility += itemObj.dodgeBoost;
                    used = true;
                }

                if (used) {
                    // Remove one potion from inventory
                    this.removeInventoryItem(itemObj.key, 1);
                    // Save stats to localStorage
                    this.saveStatsToLocalStorage();
                    // Update inventory UI
                    this.updateInventoryDisplay();
                }
            });

            this.inventoryItemsGroup.add(itemImage);

            // If count > 1, add a count label at the top-right of the slot with a black outline.
            if (itemData.count > 1) {
                const countText = this.scene.add.text(
                    slot.x + 35,
                    slot.y + 5,
                    `${itemData.count}`,
                    {
                        fontSize: "16px",
                        fill: "#ffffff",
                        stroke: "#000000",        // Black outline
                        strokeThickness: 2         // Thickness of outline
                    }
                ).setOrigin(1, 0);
                this.inventoryItemsGroup.add(countText);
            }
        }
        });

        // --- Animate and update radar chart and stat texts ---
        if (this.radarChart) {
            this.animateRadarChartUpdate();
        }
        if (this.statTexts) {
            this.animateStatTextsUpdate();
        }
    }

    // Animate a single stat value (for statTexts)
    animateStatChange(statKey, fromValue, toValue) {
        if (!this.statTexts) return;
        const axes = ["health", "defense", "attack", "speed", "luck", "agility", "mana"];
        const index = axes.indexOf(statKey);
        if (index === -1 || !this.statTexts[index]) return;

        const textObj = this.statTexts[index];
        this.scene.tweens.addCounter({
            from: fromValue,
            to: toValue,
            duration: 400,
            onUpdate: tween => {
                const val = Math.round(tween.getValue());
                textObj.setText(`${statKey.charAt(0).toUpperCase() + statKey.slice(1)}: ${val}`);
            }
        });
    }

    // Animate radar chart update
    animateRadarChartUpdate() {
        if (!this.radarChart) return;
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
        // Get current stats
        const startStats = {};
        axes.forEach((stat, i) => {
            const textObj = this.statTexts[i];
            const match = textObj.text.match(/: (\d+)/);
            startStats[stat] = match ? parseInt(match[1]) : 0;
        });
        const endStats = { ...this.stats };

        this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 400,
            onUpdate: tween => {
                const t = tween.getValue();
                const interpStats = {};
                axes.forEach(stat => {
                    interpStats[stat] = Math.round(
                        startStats[stat] + (endStats[stat] - startStats[stat]) * t
                    );
                });
                // Redraw radar chart
                this.radarChart.clear();
                // Semi-transparent background
                this.radarChart.fillStyle(0x000000, 0.5);
                this.radarChart.fillCircle(250, 85, 65); // radius + 10
                this.radarChart.lineStyle(1, 0xffffff, 0.5);
                const gridLevels = 5;
                const radius = 55;
                const x = 250, y = 85;
                for (let level = 1; level <= gridLevels; level++) {
                    const levelRadius = (radius * level) / gridLevels;
                    const points = [];
                    for (let i = 0; i < numAxes; i++) {
                        const angle = Phaser.Math.DegToRad((360 / numAxes) * i - 90);
                        const dx = x + levelRadius * Math.cos(angle);
                        const dy = y + levelRadius * Math.sin(angle);
                        points.push(new Phaser.Math.Vector2(dx, dy));
                    }
                    this.radarChart.strokePoints(points, true);
                }
                // Draw axis lines
                for (let i = 0; i < numAxes; i++) {
                    const angle = Phaser.Math.DegToRad((360 / numAxes) * i - 90);
                    const dx = x + radius * Math.cos(angle);
                    const dy = y + radius * Math.sin(angle);
                    this.radarChart.lineBetween(x, y, dx, dy);
                }
                // Data points
                const dataPoints = [];
                for (let i = 0; i < numAxes; i++) {
                    const stat = axes[i];
                    const value = interpStats[stat] !== undefined ? interpStats[stat] : 0;
                    const maxValue = maxValues[stat];
                    const proportion = Phaser.Math.Clamp(value / maxValue, 0, 1);
                    const dataRadius = proportion * radius;
                    const angle = Phaser.Math.DegToRad((360 / numAxes) * i - 90);
                    const dx = x + dataRadius * Math.cos(angle);
                    const dy = y + dataRadius * Math.sin(angle);
                    dataPoints.push(new Phaser.Math.Vector2(dx, dy));
                }
                this.radarChart.fillStyle(0xff0000, 0.3);
                this.radarChart.fillPoints(dataPoints, true);
                this.radarChart.lineStyle(2, 0xff0000, 1);
                this.radarChart.strokePoints(dataPoints, true);
            }
        });
    }

    // Animate all stat texts (for non-consumable changes)
    animateStatTextsUpdate() {
        if (!this.statTexts) return;
        const axes = ["health", "defense", "attack", "speed", "luck", "agility", "mana"];
        axes.forEach((stat, i) => {
            if (!this.statTexts[i]) return;
            this.statTexts[i].setText(`${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${this.stats[stat] !== undefined ? this.stats[stat] : 0}`);
        });
    }

    addInventoryItem(itemKey) {
        // Check for stacking—if the item exists in a slot, increase its count.
        for (let i = 0; i < this.inventoryData.length; i++) {
            let slot = this.inventoryData[i];
            if (slot && slot.key === itemKey) {
                slot.count++;
                this.updateInventoryDisplay();
                localStorage.setItem('inventoryData', JSON.stringify(this.inventoryData));
                return;
            }
        }
        // Otherwise, find the next empty slot.
        let emptyIndex = this.inventoryData.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            this.inventoryData[emptyIndex] = { key: itemKey, count: 1 };
            this.updateInventoryDisplay();
            localStorage.setItem('inventoryData', JSON.stringify(this.inventoryData));
        } else {
            console.log("Inventory full!");
        }
    }

    toggleInventory() {
        // Prevent inventory access if the shop is open
        if (this.shopOpen) return;

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
        if (this.isDead) return;
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            console.log("Player Stats:", this.stats);
            console.log("Player Inventory:", this.inventory);
            console.log("Owned Skills:", this.ownedSkills);
        }

        // In PlayerManager.js update()
        if (Phaser.Input.Keyboard.JustDown(this.resetKey)) {
            this.resetAll();
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

        // Update coin text
        if (this.coinText) {
            this.coinText.setText(`Coins: ${this.stats.coins}`);
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

    playDeathAnimation() {
    if (!this.player) return;
    this.isDead = true;
    
    // Stop all current animations and play death animation
    this.player.anims.stop();
    this.player.anims.play('playerDeath', true);

    // Hide the hands immediately
    if (this.hands) {
        this.hands.visible = false;
        this.hands.anims.stop();
    }

    // Optionally fade out or tint the player sprite for effect
    this.scene.tweens.add({
        targets: this.player,
        alpha: 0.5,
        duration: 800,
        yoyo: false
    });

    // Optionally: disable input or show a "Game Over" popup here
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

        // --- Hide any open tooltip when closing inventory or skill tree ---
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
        if (this.skillTreeUI && this.skillTreeUI.tooltip) {
            this.skillTreeUI.tooltip.destroy();
            this.skillTreeUI.tooltip = null;
        }
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

        this.scene.anims.create({
            key: 'playerDeath',
            frames: this.scene.anims.generateFrameNumbers('playerDeath', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
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
