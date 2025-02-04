export default class BattleManager {
    constructor(scene, playerManager, monsterManager, customCursor) {
        this.scene = scene;
        this.playerManager = playerManager;
        this.monsterManager = monsterManager;
        this.customCursor = customCursor;
        this.uiBoxes = [];
        this.battleUIShown = false;
        this.playerStatsPanel = null;
        this.monsterStatsPanel = null;
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
            graphics.fillStyle(0x000000, 0.8);
            graphics.fillRect(0, 0, boxWidth, boxHeight);
            graphics.lineStyle(2, 0xffffff, 1);
            graphics.strokeRect(0, 0, boxWidth, boxHeight);

            const text = this.scene.add.text(boxWidth / 2, boxHeight / 2, optionLabels[i], {
                font: "18px Arial",
                fill: "#ffffff"
            }).setOrigin(0.5);

            container.add([graphics, text]);
            container.graphics = graphics;

            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, boxWidth, boxHeight), Phaser.Geom.Rectangle.Contains);

            container.on("pointerover", () => {
                this.customCursor.setTexture("openCursor").setScale(0.6);

                this.scene.tweens.add({
                    targets: container,
                    scale: 1.1,
                    duration: 150,
                    ease: "Power1"
                });
                container.setDepth(10);

                container.graphics.clear();
                container.graphics.fillStyle(0x000000, 0.8);
                container.graphics.fillRect(0, 0, boxWidth, boxHeight);
                container.graphics.lineStyle(2, 0xff0000, 1);
                container.graphics.strokeRect(0, 0, boxWidth, boxHeight);
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
                container.graphics.fillStyle(0x000000, 0.8);
                container.graphics.fillRect(0, 0, boxWidth, boxHeight);
                container.graphics.lineStyle(2, 0xffffff, 1);
                container.graphics.strokeRect(0, 0, boxWidth, boxHeight);
            });

            container.on("pointerdown", () => {
                this.customCursor.setTexture("closedCursor").setScale(0.6);
                console.log("Clicked:", optionLabels[i]);
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

        this.monsterManager.displayCombatantStats();
    }

}
