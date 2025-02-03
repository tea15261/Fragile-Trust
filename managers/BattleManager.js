// BattleManager.js
export default class BattleManager {
    /**
     * @param {Phaser.Scene} scene - The battle scene.
     * @param {Object} playerManager - The player manager.
     * @param {Object} monsterManager - The monster manager.
     * @param {Phaser.GameObjects.Sprite} customCursor - The custom cursor sprite.
     */
    constructor(scene, playerManager, monsterManager, customCursor) {
        this.scene = scene;
        this.playerManager = playerManager;
        this.monsterManager = monsterManager;
        this.customCursor = customCursor;
        this.uiBoxes = [];
        this.battleUIShown = false;

        // Containers for the combatants’ stat panels.
        this.playerStatsPanel = null;
        this.monsterStatsPanel = null;
    }

    /**
     * Displays the battle UI if it isn’t already shown.
     */
    displayBattleUI() {
        if (this.battleUIShown) return;
        this.battleUIShown = true;

        // Ensure the custom cursor is valid.
        if (!this.customCursor) {
            this.customCursor = this.scene.add.sprite(0, 0, 'customCursor')
                .setVisible(false)
                .setDepth(9999);
            this.scene.input.on('pointermove', (pointer) => {
                this.customCursor.setVisible(true).setPosition(pointer.x, pointer.y);
            });
        }

        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const boxWidth = screenWidth / 2;
        const boxHeight = 75;
        const optionLabels = ["Attack", "Skills", "Focus", "Run"];
        const finalPositions = [
            { x: 0, y: screenHeight - 2 * boxHeight },
            { x: boxWidth, y: screenHeight - 2 * boxHeight },
            { x: 0, y: screenHeight - boxHeight },
            { x: boxWidth, y: screenHeight - boxHeight }
        ];

        // Create the UI boxes (each representing a battle option).
        for (let i = 0; i < 4; i++) {
            // Start offscreen at the bottom.
            const container = this.scene.add.container(finalPositions[i].x, screenHeight + boxHeight);

            // Create a graphics object for the background and border.
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x000000, 0.8);
            graphics.fillRect(0, 0, boxWidth, boxHeight);
            graphics.lineStyle(2, 0xffffff, 1);
            graphics.strokeRect(0, 0, boxWidth, boxHeight);

            // Create the label text.
            const text = this.scene.add.text(boxWidth / 2, boxHeight / 2, optionLabels[i], {
                font: "18px Arial",
                fill: "#ffffff"
            }).setOrigin(0.5);

            // Add graphics and text to the container.
            container.add([graphics, text]);
            container.graphics = graphics; // Save a reference for later redrawing

            // Make the container interactive.
            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, boxWidth, boxHeight), Phaser.Geom.Rectangle.Contains);

            // Pointer event handlers to create a pop-out effect and change cursor textures.
            container.on("pointerover", () => {
                // On hover, set the cursor to openCursor.
                this.customCursor.setTexture("openCursor");

                // Tween scale up for a pop-out effect.
                this.scene.tweens.add({
                    targets: container,
                    scale: 1.1,
                    duration: 150,
                    ease: "Power1"
                });
                container.setDepth(10);

                // Redraw the border in red.
                container.graphics.clear();
                container.graphics.fillStyle(0x000000, 0.8);
                container.graphics.fillRect(0, 0, boxWidth, boxHeight);
                container.graphics.lineStyle(2, 0xff0000, 1);
                container.graphics.strokeRect(0, 0, boxWidth, boxHeight);
            });

            container.on("pointerout", () => {
                // When the pointer leaves, revert the cursor.
                this.customCursor.setTexture("customCursor");

                // Tween back to the original scale.
                this.scene.tweens.add({
                    targets: container,
                    scale: 1,
                    duration: 150,
                    ease: "Power1"
                });
                container.setDepth(0);

                // Redraw the border in its default (white) style.
                container.graphics.clear();
                container.graphics.fillStyle(0x000000, 0.8);
                container.graphics.fillRect(0, 0, boxWidth, boxHeight);
                container.graphics.lineStyle(2, 0xffffff, 1);
                container.graphics.strokeRect(0, 0, boxWidth, boxHeight);
            });

            container.on("pointerdown", () => {
                // On pointer down, set the cursor to closedCursor.
                this.customCursor.setTexture("closedCursor");
                console.log("Clicked:", optionLabels[i]);
                // Future battle logic for the selected option goes here.
            });

            container.on("pointerup", () => {
                // On pointer up, revert to the openCursor if still hovering.
                this.customCursor.setTexture("openCursor");
            });

            this.uiBoxes.push(container);
        }

        // Animate the boxes into view from the bottom.
        this.uiBoxes.forEach((container, index) => {
            this.scene.tweens.add({
                targets: container,
                y: finalPositions[index].y,
                duration: 500,
                ease: "Power2",
                delay: index * 100
            });
        });

        // Create and display the combatant stats panels.
        this.displayCombatantStats();
    }

    /**
     * Creates and animates the stat panels for the player and the monster.
     */
    displayCombatantStats() {
        // --- Player Stats Panel ---
        if (!this.playerStatsPanel) {
            const panelWidth = 200, panelHeight = 150;
            const playerPanelX = this.scene.cameras.main.width - panelWidth - 20;
            const playerPanelYStart = -panelHeight;
            const playerPanelYTarget = 20;
            this.playerStatsPanel = this.scene.add.container(playerPanelX, playerPanelYStart);
    
            const bg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.5);
            bg.setOrigin(0, 0);
    
            const playerNameText = this.scene.add.text(10, 10, "Player", {
                fontSize: "16px",
                fill: "#ffffff"
            });
    
            let statsStr = "";
            const stats = this.playerManager.stats;
            for (let key in stats) {
                statsStr += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${stats[key]}\n`;
            }
            const playerStatsText = this.scene.add.text(10, 30, statsStr, {
                fontSize: "14px",
                fill: "#ffffff"
            });
    
            this.playerStatsPanel.add([bg, playerNameText, playerStatsText]);
    
            this.scene.tweens.add({
                targets: this.playerStatsPanel,
                y: playerPanelYTarget,
                duration: 500,
                ease: "Power2"
            });
        }
    
        // --- Monster Stats Panel ---
        if (!this.monsterStatsPanel) {
            const panelWidth = 200, panelHeight = 150;
            const monsterPanelX = 20;
            const monsterPanelYStart = -panelHeight;
            const monsterPanelYTarget = 20;
            this.monsterStatsPanel = this.scene.add.container(monsterPanelX, monsterPanelYStart);
    
            const bg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.5);
            bg.setOrigin(0, 0);
    
            // Use the current monster type as the name.
            const monsterNameText = this.scene.add.text(10, 10, "this.monsterManager.name", {
                fontSize: "16px",
                fill: "#ffffff"
            });
    
            // Use the stats getter from MonsterManager.
            const monsterStats = (this.monsterManager && this.monsterManager.stats) || 
                     { health: 100, defense: 50, attack: 70, speed: 120, luck: 30, agility: 40, mana: 60 };

            let statsStr = "";
            for (let key in monsterStats) {
                statsStr += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${monsterStats[key]}\n`;
            }
            const monsterStatsText = this.scene.add.text(10, 30, statsStr, {
                fontSize: "14px",
                fill: "#ffffff"
            });
    
            this.monsterStatsPanel.add([bg, monsterNameText, monsterStatsText]);
            //console.log("Monster Name:", this.monsterManager.name);
            //console.log("Monster Stats:", this.monsterManager.stats);

    
            this.scene.tweens.add({
                targets: this.monsterStatsPanel,
                y: monsterPanelYTarget,
                duration: 500,
                ease: "Power2"
            });
        }
    }

    // (Additional battle logic methods can be added here later.)
}
