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
                statsStr += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${stats[key]}\n`;
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
                statsStr += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${monsterStats[key]}\n`;
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
        this.endBattle();
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
      // add more logic here
    }
  }
