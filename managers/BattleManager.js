import LootManager from '/managers/LootManager.js';

export default class BattleManager {
    constructor(scene, playerManager, monsterManager, customCursor) {
        this.scene = scene;
        this.playerManager = playerManager;
        this.monsterManager = monsterManager;
        this.customCursor = customCursor;
        this.lootManager = new LootManager(scene);
        this.uiBoxes = [];
        this.battleUIShown = false;
        this.playerStatsPanel = null;
        this.monsterStatsPanel = null;
        this.playerStatsText = null;
        this.monsterStatsText = null;
        this.battleEnded = false;
        this.inputLocked = false;
    }

    displayBattleUI() {
        if (this.battleUIShown) return;
        this.battleUIShown = true;

        if (!this.customCursor) {
            this.customCursor = this.scene.add.sprite(0, 0, 'customCursor')
                .setVisible(false)
                .setDepth(9999)
                .setScale(0.6);
            this.scene.input.on('pointermove', (pointer) => {
                this.customCursor
                    .setVisible(true)
                    .setPosition(pointer.x, pointer.y)
                    .setScale(0.6);
            });
        }

        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const boxWidth = screenWidth / 2;
        const boxHeight = 75;
        const optionLabels = ["Attack", "Skills", "Guard", "Run"];
        const finalPositions = [
            { x: 0, y: screenHeight - 2 * boxHeight },
            { x: boxWidth, y: screenHeight - 2 * boxHeight },
            { x: 0, y: screenHeight - boxHeight },
            { x: boxWidth, y: screenHeight - boxHeight }
        ];

        for (let i = 0; i < 4; i++) {
            const container = this.scene.add.container(finalPositions[i].x, screenHeight + boxHeight);

            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x222222, 0.9); // Darker background
            graphics.fillRoundedRect(0, 0, boxWidth, boxHeight, 15); // Rounded corners
            graphics.lineStyle(3, 0xffffff, 1);
            graphics.strokeRoundedRect(0, 0, boxWidth, boxHeight, 15); // White outline

            const text = this.scene.add.text(boxWidth / 2, boxHeight / 2, optionLabels[i], {
                font: "20px Arial",
                fill: "#FFD700", // Gold text
                fontStyle: "bold"
            }).setOrigin(0.5);

            container.add([graphics, text]);
            container.graphics = graphics;

            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, boxWidth, boxHeight), Phaser.Geom.Rectangle.Contains);

            container.on("pointerover", () => {
                if (!this.customCursor) return;
                this.customCursor.setTexture("openCursor").setScale(0.6);
                this.scene.tweens.add({
                    targets: container,
                    scale: 1.1,
                    duration: 150,
                    ease: "Power1"
                });
                container.setDepth(10);
                container.graphics.clear();
                container.graphics.fillStyle(0x444444, 1); // Lighter hover color
                container.graphics.fillRoundedRect(0, 0, boxWidth, boxHeight, 15);
                container.graphics.lineStyle(3, 0xff0000, 1);
                container.graphics.strokeRoundedRect(0, 0, boxWidth, boxHeight, 15);
            });

            container.on("pointerout", () => {
                this.customCursor.setTexture("customCursor").setScale(0.6);
                this.scene.tweens.add({
                    targets: container,
                    scale: 1,
                    duration: 150,
                    ease: "Power1"
                });
                container.setDepth(0);
                container.graphics.clear();
                container.graphics.fillStyle(0x222222, 0.9);
                container.graphics.fillRoundedRect(0, 0, boxWidth, boxHeight, 15);
                container.graphics.lineStyle(3, 0xffffff, 1);
                container.graphics.strokeRoundedRect(0, 0, boxWidth, boxHeight, 15);
            });

            container.on("pointerdown", () => {
                this.customCursor.setTexture("closedCursor").setScale(0.6);
                this.handlePlayerAction(optionLabels[i]);
            });

            container.on("pointerup", () => {
                this.customCursor.setTexture("openCursor").setScale(0.6);
            });

            this.uiBoxes.push(container);
        }

        this.uiBoxes.forEach((container, index) => {
            this.scene.tweens.add({
                targets: container,
                y: finalPositions[index].y,
                duration: 500,
                ease: "Power2",
                delay: index * 100
            });
        });

        this.displayCombatantStats();
    }

    displayCombatantStats() {
        if (!this.playerStatsPanel) {
            const panelWidth = 220, panelHeight = 160;
            const playerPanelX = this.scene.cameras.main.width - panelWidth - 20;
            const playerPanelYTarget = 20;
            this.playerStatsPanel = this.scene.add.container(playerPanelX, -panelHeight);

            const bg = this.scene.add.graphics();
            bg.fillStyle(0x111111, 0.8);
            bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 12);
            bg.lineStyle(3, 0xffffff);
            bg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 12);

            const playerNameText = this.scene.add.text(10, 10, "Player", {
                fontSize: "18px",
                fill: "#FFD700",
                fontStyle: "bold"
            });

            let statsStr = "";
            const stats = this.playerManager.stats;
            for (let key in stats) {
                // Skip the coin stat
                if (key === "coins") continue;
                let value = stats[key];
                // Ensure health doesn't show negative
                if (key === "health" && value < 0) value = 0;
                statsStr += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
            }
            this.playerStatsText = this.scene.add.text(10, 40, statsStr, {
                fontSize: "14px",
                fill: "#ffffff"
            });

            this.playerStatsPanel.add([bg, playerNameText, this.playerStatsText]);

            this.scene.tweens.add({
                targets: this.playerStatsPanel,
                y: playerPanelYTarget,
                duration: 500,
                ease: "Power2"
            });
        }

        if (!this.monsterStatsPanel) {
            const panelWidth = 220, panelHeight = 160;
            const monsterPanelX = 20;
            const monsterPanelYTarget = 20;
            this.monsterStatsPanel = this.scene.add.container(monsterPanelX, -panelHeight);

            const bg = this.scene.add.graphics();
            bg.fillStyle(0x111111, 0.8);
            bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 12);
            bg.lineStyle(3, 0xff0000);
            bg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 12);

            let name = this.monsterManager.monsterName;
            const monsterNameText = this.scene.add.text(10, 10, name, {
                fontSize: "18px",
                fill: "#FF0000",
                fontStyle: "bold"
            });

            const monsterStats = this.monsterManager.stats();
            let statsStr = "";
            for (let key in monsterStats) {
                let value = monsterStats[key];
                if (key === "health" && value < 0) value = 0;
                statsStr += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
            }
            this.monsterStatsText = this.scene.add.text(10, 40, statsStr, {
                fontSize: "14px",
                fill: "#ffffff"
            });

            this.monsterStatsPanel.add([bg, monsterNameText, this.monsterStatsText]);

            this.scene.tweens.add({
                targets: this.monsterStatsPanel,
                y: monsterPanelYTarget,
                duration: 500,
                ease: "Power2"
            });
        }
    }

    updateCombatantStats() {
        let statsStr = "";
        const playerStats = this.playerManager.stats;
        for (let key in playerStats) {
            // Skip displaying coins in player stat panel
            if (key === "coins") continue;
            let value = playerStats[key];
            if (key === "health" && value < 0) value = 0;
            statsStr += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
        }
        this.playerStatsText.setText(statsStr);

        let mStatsStr = "";
        const monsterStats = this.monsterManager.stats();
        for (let key in monsterStats) {
            let value = monsterStats[key];
            if (key === "health" && value < 0) value = 0;
            mStatsStr += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
        }
        this.monsterStatsText.setText(mStatsStr);
    }

    handlePlayerAction(action) {
        if (this.battleEnded) return;
        if (this.inputLocked) return;

        console.log("Player chose:", action);
        switch (action) {
            case "Attack":
                this.inputLocked = true;
                this.performPlayerAttack();
                break;
            case "Skills":
                if (this.playerManager.ownedSkills && this.playerManager.ownedSkills.length > 0) {
                    console.log("Owned Skills:", this.playerManager.ownedSkills);
                } else {
                    console.log("You don't own any skills yet.");
                }
                this.inputLocked = false;
                break;
            case "Guard":
                this.inputLocked = true;
                this.performPlayerGuard();
                break;
            case "Run":
                this.inputLocked = true;
                this.performPlayerRun();
                break;
            default:
                break;
        }
    }

    performPlayerAttack() {
        const playerAttack = this.playerManager.stats.attack;

        if (playerAttack > this.monsterManager.defense) {
            const remainingDamage = playerAttack - this.monsterManager.defense;
            this.monsterManager.defense = 0;
            this.monsterManager.health -= remainingDamage;
            this.monsterManager.health = Math.max(this.monsterManager.health, 0);
        } else {
            this.monsterManager.defense -= playerAttack;
        }

        console.log(`Player attacked! Monster stats:`, this.monsterManager.stats());
        this.updateCombatantStats();
        this.checkBattleOutcome();

        if (!this.battleEnded) {
            this.monsterTurn();
        }
    }

    performPlayerGuard() {
        this.playerManager.isGuarding = true;
        console.log("Player is guarding this turn.");
        this.monsterTurn();
    }

    performPlayerRun() {
        const escapeThreshold = Phaser.Math.Between(0, 100);
        if (this.playerManager.stats.luck >= escapeThreshold) {
            console.log("Player successfully ran away!");
            // Fade out and transition without awarding coins or loot.
            this.scene.cameras.main.fadeOut(2000, 0, 0, 0);
            this.scene.time.delayedCall(2000, () => {
                this.scene.scene.start('forest', { from: 'battle' });
            });
        } else {
            console.log("Escape failed! Monster attacks.");
            this.monsterTurn();
        }
    }

    monsterTurn() {
        this.scene.time.delayedCall(500, () => {
            if (this.battleEnded) return;
            const monsterAttack = this.monsterManager.attack;
            let playerStats = this.playerManager.stats;

            let effectiveAttack = monsterAttack;
            if (this.playerManager.isGuarding) {
                effectiveAttack = monsterAttack - (monsterAttack * 0.1);
                this.playerManager.isGuarding = false;
                console.log("Player guarded! Damage reduced.");
            }

            if (effectiveAttack > playerStats.defense) {
                const remainingDamage = effectiveAttack - playerStats.defense;
                playerStats.defense = 0;
                playerStats.health -= remainingDamage;
                playerStats.health = Math.max(playerStats.health, 0);
            } else {
                playerStats.defense -= effectiveAttack;
            }

            console.log(`Monster attacked! Player stats:`, playerStats);
            this.updateCombatantStats();
            this.checkBattleOutcome();

            if (!this.battleEnded) {
                this.inputLocked = false;
            }
        });
    }

    checkBattleOutcome() {
        if (this.playerManager.stats.health <= 0) {
            console.log("Player defeated!");
            this.playerManager.playDeathAnimation();
            this.endBattle();
        } else if (this.monsterManager.health <= 0) {
            console.log("Monster defeated!");
            this.monsterManager.playDeathAnimation();
            this.endBattle();
        }
    }

    endBattle() {
        this.battleEnded = true;
        console.log("Battle has ended.");

        this.scene.time.delayedCall(1500, () => {
            // Animate UI panels off-screen (slide up and fade out)
            this.scene.tweens.add({
                targets: [this.playerStatsPanel, this.monsterStatsPanel],
                y: -200, // slide out
                alpha: 0,
                duration: 1000,
                ease: "Power2"
            });

            // Animate battle UI buttons downward off the screen at the same time
            this.uiBoxes.forEach((container, index) => {
                this.scene.tweens.add({
                    targets: container,
                    y: container.y + 200, // adjust 200 to how far off screen you want them
                    duration: 500,
                    ease: "Power2",
                    delay: index * 100
                });
            });

            // Create Victory Screen popup
            const victoryContainer = this.scene.add.container(0, 0);
            const bg = this.scene.add.rectangle(320, 200, 400, 300, 0x000000, 0.8);
            bg.setStrokeStyle(3, 0xffffff);

            const victoryText = this.scene.add.text(320, 150, "Victory!", {
                fontSize: "32px",
                fill: "#FFD700",
                fontStyle: "bold"
            }).setOrigin(0.5);

            const coinsText = this.scene.add.text(320, 220, "Coins Earned: 0", {
                fontSize: "24px",
                fill: "#ffffff"
            }).setOrigin(0.5);

            victoryContainer.add([bg, victoryText, coinsText]);

            // Animate coins counting up to reward value
            const luckFactor = this.playerManager.stats.luck;
            let base_coins;
            switch (this.monsterManager.currentMonsterType) {
                case "SkeletonBase":
                    base_coins = Phaser.Math.Between(5, 15);
                    break;
                case "SkeletonRogue":
                    base_coins = Phaser.Math.Between(10, 20);
                    break;
                case "OrcBase":
                    base_coins = Phaser.Math.Between(15, 30);
                    break;
                case "SkeletonWarrior":
                    base_coins = Phaser.Math.Between(20, 35);
                    break;
                case "SkeletonMage":
                    base_coins = Phaser.Math.Between(25, 40);
                    break;
                case "OrcRogue":
                    base_coins = Phaser.Math.Between(30, 50);
                    break;
                case "OrcWarrior":
                    base_coins = Phaser.Math.Between(40, 60);
                    break;
                case "OrcMage":
                    base_coins = Phaser.Math.Between(50, 80);
                    break;
                default:
                    base_coins = Phaser.Math.Between(5, 80);
                    break;
            }

            let final_coins = Math.floor(base_coins + (luckFactor / 10));

            this.scene.tweens.addCounter({
                from: 0,
                to: final_coins,
                duration: 1000,
                ease: "Linear",
                onUpdate: tween => {
                    const value = Math.floor(tween.getValue());
                    coinsText.setText("Coins Earned: " + value);
                },
                onComplete: () => {
                    // Add coins to the player's stat.
                    this.playerManager.stats.coins += final_coins;

                    // Determine loot drops based on luck
                    const baseDrops = 1; // your base drop(s) per battle
                    const noLootChance = Math.max(0.33 * Math.exp(-luckFactor / 100), 0.05);
                    let totalDrops = 0;
                    if (Math.random() > noLootChance) {
                        totalDrops = baseDrops + Math.floor(luckFactor / 50);
                    }
                    if (totalDrops > 0) {
                        totalDrops = Math.min(totalDrops, 4);
                        const lootItems = this.lootManager.getLootDrops(totalDrops);
                        lootItems.forEach(item => {
                            // Add item to player's inventory using LootManager item data.
                            this.playerManager.addInventoryItem(item.key);
                            this.playerManager.inventory.push(item);
                            localStorage.setItem('inventory', JSON.stringify(this.playerManager.inventory));
                            console.log("Player received:", item.key, "-", this.lootManager.getDescription(item.key));
                        });

                      const columns = Math.min(lootItems.length, 4);  // Maximum 4 items per row
                      const itemSize = 40;  // Desired display size for each loot image
                      const spacing = 10;   // Spacing between items
                      const gridWidth = columns * itemSize + (columns - 1) * spacing;
                      const rows = Math.ceil(lootItems.length / columns);
                      const totalHeight = rows * itemSize + (rows - 1) * spacing;

                      // Create a container for loot and center it at (320, 260)
                      const lootContainer = this.scene.add.container(320, 260);
                      // Loop over loot items and add each image
                      for (let i = 0; i < lootItems.length; i++) {
                        const col = i % columns;
                        const row = Math.floor(i / columns);
                        const x = -gridWidth / 2 + col * (itemSize + spacing) + itemSize / 2;
                        const y = -totalHeight / 2 + row * (itemSize + spacing) + itemSize / 2;
                        const lootImage = this.scene.add.image(x, y, lootItems[i].key)
                            .setDisplaySize(itemSize, itemSize)
                            .setOrigin(0.5);
                        lootContainer.add(lootImage);
                    }
                      victoryContainer.add(lootContainer);

                    } else {
                        const lootText = this.scene.add.text(320, 260, "Loot: None", {
                            fontSize: "20px",
                            fill: "#FFD700",
                            fontStyle: "bold"
                        }).setOrigin(0.5);
                        victoryContainer.add(lootText);
                    }

                    // After battle, refill temporary battle stats:
                    this.playerManager.stats.health = 1000;
                    this.playerManager.stats.defense = 50;
                    this.playerManager.stats.mana = 80;

                    // Save the persistent stats to localStorage.
                    const persistentStats = {
                        coins: this.playerManager.stats.coins,
                        attack: this.playerManager.stats.attack,
                        speed: this.playerManager.stats.speed,
                        luck: this.playerManager.stats.luck,
                        agility: this.playerManager.stats.agility
                    };
                    localStorage.setItem('playerPersistentStats', JSON.stringify(persistentStats));
                }
            });

            // Add a "Continue" button below the victory panel
            const continueButton = this.scene.add.text(320, 300, "Continue", {
                fontSize: "24px",
                fill: "#FFD700",
                fontFamily: "Arial",
                fontStyle: "bold",
                backgroundColor: "#000000", // For contrast; adjust as needed
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }).setOrigin(0.5);

            // Enable interactivity with a pointer (open cursor on hover)
            continueButton.setInteractive({ cursor: 'pointer' });

            continueButton.on('pointerover', () => {
                continueButton.setStyle({ fill: "#FFFFFF" });
                this.customCursor.setTexture("openCursor").setScale(0.6);
            });

            continueButton.on('pointerout', () => {
                continueButton.setStyle({ fill: "#FFD700" });
                this.customCursor.setTexture("customCursor").setScale(0.6);
            });

            continueButton.on('pointerdown', () => {
                // Fade the scene to black over 2 seconds
                this.scene.cameras.main.fadeOut(2000, 0, 0, 0);
                // After 2 seconds, transition to the forest scene with 'battle' data
                this.scene.time.delayedCall(2000, () => {
                    this.scene.scene.start('forest', { from: 'battle' });
                });
            });

            // Add the continue button to the Victory container so it appears below the victory panel
            victoryContainer.add(continueButton);
        });
    }
}
