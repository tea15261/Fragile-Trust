export class SkillManager {
  constructor() {
    this.skills = {
      offensive: [
        {
          key: 'focus',
          name: 'Focus',
          description: "Skips a turn but adds 10% more to attack for that turn.",
          damage: 25,
          cooldown: 3,
          prerequisite: null
        },
        {
          key: 'cripple',
          name: 'Cripple',
          description: "Lowers the enemy's attack by 10% for 3 turns.",
          damage: 15,
          cooldown: 1,
          prerequisite: 'focus'
        }
      ],
      defensive: [
        {
          key: 'deflect',
          name: 'Deflect',
          description: "Chance to reflect part of the enemy’s attack back at them (Luck helps, reflects 20%).",
          defenseBoost: 20,
          cooldown: 4,
          prerequisite: null
        },
        {
          key: 'anticipate',
          name: 'Anticipate',
          description: "Reduces damage from the next attack and increases attack next turn (Monster Attack - 30%, Attack + 20%).",
          defenseBoost: 20,
          cooldown: 4,
          prerequisite: 'deflect'
        }
      ],
      magic: [
        {
          key: 'hex',
          name: 'Hex',
          description: "Lowers enemy’s accuracy for a few turns. (Monster Attack - 15%)",
          damage: 30,
          manaCost: 15,
          cooldown: 3,
          prerequisite: null
        },
        {
          key: 'curse',
          name: 'Curse',
          description: "The enemy takes damage equal to a portion of the damage they deal.",
          damage: 30,
          manaCost: 15,
          cooldown: 3,
          prerequisite: 'hex'
        },
        {
          key: 'paralyze',
          name: 'Paralyze',
          description: "Prevents the enemy from moving for a turn.",
          damage: 0,
          manaCost: 20,
          cooldown: 4,
          prerequisite: 'curse'
        },
        {
          key: 'wither',
          name: 'Wither',
          description: "Reduces the enemy’s attack and defense over time. (-20% of each per turn for 3 turns)",
          damage: 0,
          manaCost: 25,
          cooldown: 5,
          prerequisite: 'paralyze'
        },
        {
          key: 'finaljudgement',
          name: 'Final Judgement',
          description: "Inflicts a powerful curse that deals immense damage to enemies over time, while also making them take double damage from all attacks. (-35% defense or health each turn + 2x player attack)",
          damage: 0,
          manaCost: 50,
          cooldown: 6,
          prerequisite: 'wither'
        }
      ],
      utility: [
        {
          key: 'timeshift',
          name: 'Time Shift',
          description: "Skips the enemy’s next turn but also reduces your next attack. (-15% normal attack just for that turn)",
          speedBoost: 50,
          cooldown: 2,
          prerequisite: null
        },
        {
          key: 'lastlaugh',
          name: 'Last Laugh',
          description: 'Deals damage based on how low your HP is.',
          speedBoost: 70,
          cooldown: 4,
          prerequisite: 'timeshift'
        },
        {
          key: 'overclock',
          name: 'Overclock',
          description: "Doubles Attack but reduces health over time. (-10% each turn for 3 turns)",
          speedBoost: 90,
          cooldown: 3,
          prerequisite: 'lastlaugh'
        },
        {
          key: 'bloodpact',
          name: 'Blood Pact',
          description: "Sacrifices 50% Health to add 50% more attack.",
          speedBoost: 110,
          cooldown: 5,
          prerequisite: 'overclock'
        },
        {
          key: 'fearofdeath',
          name: 'Fear of Death',
          description: "Reduces all enemy stats by 50% for 3 turns while also causing them to take damage whenever they attack. (15% of their attack also reduces their defense or health)",
          speedBoost: 130,
          cooldown: 6,
          prerequisite: 'bloodpact'
        }
      ]
    };
  }

  // Retrieve skills for a given type.
  getSkillsByType(type) {
    return this.skills[type] || [];
  }

  // Retrieve all skills.
  getAllSkills() {
    return this.skills;
  }
}

export class SkillTreeUI {
  constructor(scene, skillManager, options = {}) {
    this.scene = scene;
    this.skillManager = skillManager;
    this.inventoryContainer = options.inventoryContainer || null;
    this.inventoryButton = options.inventoryButton || null;
    this.radarChart = options.radarChart || null;
    this.radarLabels = options.radarLabels || [];
    this.statTexts = options.statTexts || [];
    this.playerManager = options.playerManager || null;

    this.skillTreeContainer = null;

    this.skillNodes = {
      offensive: [],
      defensive: [],
      magic: [],
      utility: []
    };

    this.connectionGraphics = this.scene.add.graphics();
    this.unlockedSkills = {};

    // Tooltip container for displaying skill info on hover
    this.tooltip = null;
    
    this.eKey = this.scene.input.keyboard.addKey('E');
    this.eKey.on('down', () => {
      if (this.skillTreeContainer && this.skillTreeContainer.visible) {
        this.hideSkillTree();
      }
    });
  }
  
  // Method to create a tooltip for a given skill at (x, y) with improved styling and automatic positioning
  createTooltip(skill, x, y) {
    // Destroy any existing tooltip
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
    
    const padding = 10;
    const margin = 10; // margin from screen edges
    let textContent = `${skill.name}\n\n${skill.description}\nCooldown: ${skill.cooldown}`;
    if (skill.damage !== undefined) {
      textContent += `\nDamage: ${skill.damage}`;
    }
    if (skill.defenseBoost !== undefined) {
      textContent += `\nDefense Boost: ${skill.defenseBoost}`;
    }
    if (skill.manaCost !== undefined) {
      textContent += `\nMana Cost: ${skill.manaCost}`;
    }
    if (skill.speedBoost !== undefined) {
      textContent += `\nSpeed Boost: ${skill.speedBoost}`;
    }
    
    // Improved text style
    const style = { 
      fontSize: '14px', 
      fontFamily: 'Arial', 
      fill: '#ffffff', 
      align: 'left', 
      wordWrap: { width: 220 } 
    };
    const tooltipText = this.scene.add.text(0, 0, textContent, style);
    tooltipText.setPadding(padding, padding, padding, padding);
    
    // Use graphics to draw a rounded rectangle background with a border
    const bgGraphics = this.scene.add.graphics();
    bgGraphics.fillStyle(0x000000, 0.8);
    const bgWidth = tooltipText.width + padding * 2;
    const bgHeight = tooltipText.height + padding * 2;
    // Draw rounded rectangle (corner radius 8)
    bgGraphics.fillRoundedRect(0, 0, bgWidth, bgHeight, 8);
    // Optional border
    bgGraphics.lineStyle(2, 0xffffff, 0.8);
    bgGraphics.strokeRoundedRect(0, 0, bgWidth, bgHeight, 8);

    // Position the text within the background
    tooltipText.setPosition(padding, padding);

    // Calculate adjusted position so tooltip stays on screen
    const camWidth = this.scene.cameras.main.width;
    const camHeight = this.scene.cameras.main.height;
    let adjustedX = x;
    let adjustedY = y;
    
    if (adjustedX + bgWidth > camWidth - margin) {
      adjustedX = camWidth - bgWidth - margin;
    }
    if (adjustedY + bgHeight > camHeight - margin) {
      adjustedY = camHeight - bgHeight - margin;
    }
    if (adjustedX < margin) {
      adjustedX = margin;
    }
    if (adjustedY < margin) {
      adjustedY = margin;
    }

    // Create a container to hold both background and text
    this.tooltip = this.scene.add.container(adjustedX, adjustedY, [bgGraphics, tooltipText]);
    // Ensure the tooltip appears above other elements
    this.tooltip.setDepth(1000);
  }
  
  createSkillNodes() {
    this.skillNodes = { offensive: [], defensive: [], magic: [], utility: [] };
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Skill node positions
    const nodePositions = {
      offensive: [
        { x: centerX, y: centerY - 30 },
        { x: centerX, y: centerY - 70 }
      ],
      defensive: [
        { x: centerX, y: centerY + 30 },
        { x: centerX, y: centerY + 70 }
      ],
      magic: [
        { x: centerX + 50, y: centerY },
        { x: centerX + 90, y: centerY },
        { x: centerX + 130, y: centerY },
        { x: centerX + 170, y: centerY },
        { x: centerX + 210, y: centerY }
      ],
      utility: [
        { x: centerX - 50, y: centerY },
        { x: centerX - 90, y: centerY },
        { x: centerX - 130, y: centerY },
        { x: centerX - 170, y: centerY },
        { x: centerX - 210, y: centerY }
      ]
    };
  
    const categoryColors = {
      offensive: 0xff0000,
      defensive: 0x8B4513,
      magic: 0x800080,
      utility: 0x0000ff
    };

    ['offensive', 'defensive', 'magic', 'utility'].forEach(category => {
      const skills = this.skillManager.getSkillsByType(category);
      skills.forEach((skill, i) => {
        const pos = (nodePositions[category] && nodePositions[category][i]) || { x: centerX, y: centerY };
        const fillColor = categoryColors[category];
        const circle = this.scene.add.circle(pos.x, pos.y, 10, fillColor);
        circle.setInteractive({ useHandCursor: true });
  
        circle.isBeingHeld = false;
        circle.holdStartTime = 0;
        circle.progressBar = null;

        if (this.playerManager && this.playerManager.ownedSkills.includes(skill.key)) {
          this.unlockedSkills[skill.key] = true;
          circle.fillColor = 0x00ff00; // green
        }

        circle.on('pointerdown', () => {
          if (this.unlockedSkills[skill.key]) return;
          if (skill.prerequisite && !this.unlockedSkills[skill.prerequisite]) {
            this.scene.tweens.add({
              targets: circle,
              x: circle.x - 5,
              duration: 50,
              yoyo: true,
              repeat: 2,
              onComplete: () => {
                // Optionally reset any changed properties here.
              }
            });
            this.showPrerequisiteError(skill, circle.x, circle.y);
            return;
          }
          
          circle.isBeingHeld = true;
          circle.holdStartTime = this.scene.time.now;
        });
        
  
        circle.on('pointerup', () => {
          circle.isBeingHeld = false;
          if (circle.progressBar) {
            circle.progressBar.clear();
            circle.progressBar.destroy();
            circle.progressBar = null;
          }
        });
        circle.on('pointerout', () => {
          circle.isBeingHeld = false;
          if (circle.progressBar) {
            circle.progressBar.clear();
            circle.progressBar.destroy();
            circle.progressBar = null;
          }
        });
        
        // Tooltip events for hover display
        circle.on('pointerover', () => {
          this.createTooltip(skill, circle.x + 15, circle.y - 15);
        });
        circle.on('pointerout', () => {
          if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
          }
        });
  
        this.skillTreeContainer.add(circle);
        this.skillNodes[category].push({ skill, circle });
      });
    });
  }
  
  updateProgressBars() {
    const now = this.scene.time.now;
    ['offensive', 'defensive', 'magic', 'utility'].forEach(category => {
      this.skillNodes[category].forEach(node => {
        const circle = node.circle;
        if (circle.isBeingHeld) {
          const elapsed = now - circle.holdStartTime;
          const progress = Phaser.Math.Clamp(elapsed / 2000, 0, 1);
          if (!circle.progressBar) {
            circle.progressBar = this.scene.add.graphics();
          }
          circle.progressBar.clear();
          circle.progressBar.lineStyle(4, 0xffff00, 1);
          // draw the arc outside the circle.
          const arcRadius = 14;
          // set the starting angle to 270°
          const startAngle = Phaser.Math.DegToRad(270);
          // each arc extends 180° total when progress = 1.
          const deltaAngle = progress * Phaser.Math.DegToRad(180);
          // calculate the clockwise and counterclockwise end angles
          const endAngleCW = startAngle + deltaAngle;
          const endAngleCCW = startAngle - deltaAngle;
          // draw the clockwise arc
          circle.progressBar.beginPath();
          circle.progressBar.arc(circle.x, circle.y, arcRadius, startAngle, endAngleCW, false);
          circle.progressBar.strokePath();
          // draw the counterclockwise arc
          circle.progressBar.beginPath();
          circle.progressBar.arc(circle.x, circle.y, arcRadius, startAngle, endAngleCCW, true);
          circle.progressBar.strokePath();
      
          // if progress reaches 100%, unlock the skill
          if (progress >= 1) {
            circle.isBeingHeld = false;
            if (!this.unlockedSkills[node.skill.key]) {
              this.unlockedSkills[node.skill.key] = true;
              circle.fillColor = 0x00ff00;
              console.log(`Unlocked ${node.skill.name}`);
              if (this.playerManager && typeof this.playerManager.addOwnedSkill === 'function') {
                this.playerManager.addOwnedSkill(node.skill.key);
              }
            }
            // remove the progress bar
            circle.progressBar.clear();
            circle.progressBar.destroy();
            circle.progressBar = null;
          }
        }
      });
    });
  }
  
  
  showSkillTree() {
    if (this.inventoryContainer) this.inventoryContainer.setVisible(false);
    if (this.radarChart) this.radarChart.visible = false;
    this.radarLabels.forEach(label => label.setVisible(false));
    this.statTexts.forEach(text => text.setVisible(false));
    if (this.inventoryButton) this.inventoryButton.visible = false;
  
    this.scene.physics.pause();
    this.scene.anims.pauseAll();
  
    // Log all skills.
    console.log("All skills:", this.skillManager.getAllSkills());
  
    if (!this.skillTreeContainer) {
      this.skillTreeContainer = this.scene.add.container(0, 0);
      const centerX = this.scene.cameras.main.width / 2;
      const centerY = this.scene.cameras.main.height / 2;
      const gradientAlpha = 0.3;
  
      // X dividers.
      const bg = this.scene.add.rectangle(
        centerX, centerY,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        0x000000, 0.7
      );
      this.skillTreeContainer.add(bg);
  
      const graphics = this.scene.add.graphics();
      graphics.lineStyle(2, 0xffffff, 0.5);
      graphics.moveTo(0, 0);
      graphics.lineTo(this.scene.cameras.main.width, this.scene.cameras.main.height);
      graphics.moveTo(this.scene.cameras.main.width, 0);
      graphics.lineTo(0, this.scene.cameras.main.height);
      graphics.strokePath();
      this.skillTreeContainer.add(graphics);
  
      // create category triangles
      const createTriangle = (color, points) => {
        const triangle = this.scene.add.graphics();
        triangle.fillStyle(color, gradientAlpha);
        triangle.beginPath();
        triangle.moveTo(points[0].x, points[0].y);
        points.forEach(point => triangle.lineTo(point.x, point.y));
        triangle.closePath();
        triangle.fillPath();
        return triangle;
      };
  
      const offensiveTriangle = createTriangle(0xff0000, [
        { x: 0, y: 0 },
        { x: this.scene.cameras.main.width, y: 0 },
        { x: centerX, y: centerY }
      ]);
      this.skillTreeContainer.add(offensiveTriangle);
  
      const defensiveTriangle = createTriangle(0x8B4513, [
        { x: 0, y: this.scene.cameras.main.height },
        { x: this.scene.cameras.main.width, y: this.scene.cameras.main.height },
        { x: centerX, y: centerY }
      ]);
      this.skillTreeContainer.add(defensiveTriangle);
  
      const magicTriangle = createTriangle(0x800080, [
        { x: this.scene.cameras.main.width, y: 0 },
        { x: this.scene.cameras.main.width, y: this.scene.cameras.main.height },
        { x: centerX, y: centerY }
      ]);
      this.skillTreeContainer.add(magicTriangle);
  
      const utilityTriangle = createTriangle(0x0000ff, [
        { x: 0, y: 0 },
        { x: 0, y: this.scene.cameras.main.height },
        { x: centerX, y: centerY }
      ]);
      this.skillTreeContainer.add(utilityTriangle);

      const labelStyle = { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' };
      this.skillTreeContainer.add([
        this.scene.add.text(centerX, 50, 'OFFENSIVE', labelStyle).setOrigin(0.5),
        this.scene.add.text(centerX, this.scene.cameras.main.height - 50, 'DEFENSIVE', labelStyle).setOrigin(0.5),
        this.scene.add.text(this.scene.cameras.main.width - 100, centerY, 'MAGIC', labelStyle).setOrigin(0.5),
        this.scene.add.text(100, centerY, 'UTILITY', labelStyle).setOrigin(0.5)
      ]);
  
      this.skillTreeButton = this.createNavButton(
        this.scene.cameras.main.width - 610,
        this.scene.cameras.main.height / 2,
        true
      );
      this.skillTreeContainer.add(this.skillTreeButton);
  
      // IMPORTANT: Add connection graphics before creating nodes so lines are drawn underneath.
      this.skillTreeContainer.add(this.connectionGraphics);
  
      this.createSkillNodes();
    }
  
    this.skillTreeContainer.setVisible(true);
    this.updateConnectionLines();
  }
  
  update() {
    if (this.skillTreeContainer && this.skillTreeContainer.visible) {
      this.updateProgressBars();
    }
  }
  
  hideSkillTree() {
    // hide container
    if (this.skillTreeContainer) {
      this.skillTreeContainer.visible = false;
    }
    // show other UI elements
    if (this.inventoryContainer) this.inventoryContainer.setVisible(true);
    if (this.inventoryButton) this.inventoryButton.visible = true;
    if (this.radarChart) this.radarChart.visible = true;
    this.radarLabels.forEach(label => label.setVisible(true));
    this.statTexts.forEach(text => text.setVisible(true));
  
    // resume the game if inventory is not visible
    if (!this.inventoryContainer || !this.inventoryContainer.visible) {
      this.scene.physics.resume();
      this.scene.anims.resumeAll();
    }
  }

  updateConnectionLines() {
    this.connectionGraphics.clear();
    this.connectionGraphics.lineStyle(4, 0xffffff, 1);
    ['offensive', 'defensive', 'magic', 'utility'].forEach(category => {
      const nodes = this.skillNodes[category];
      for (let i = 0; i < nodes.length - 1; i++) {
        const curr = nodes[i].circle;
        const next = nodes[i + 1].circle;
        this.connectionGraphics.beginPath();
        this.connectionGraphics.moveTo(curr.x, curr.y);
        this.connectionGraphics.lineTo(next.x, next.y);
        this.connectionGraphics.strokePath();
      }
    });
  }
  
  createNavButton(x, y, flip = false) {
    const button = this.scene.add.graphics({ x: x, y: y });
    const trapezoidPoints = flip
      ? [
          { x: 0, y: -150 }, { x: 0, y: 150 },
          { x: -20, y: 130 }, { x: -20, y: -130 }
        ]
      : [
          { x: 0, y: -150 }, { x: 0, y: 150 },
          { x: 20, y: 130 }, { x: 20, y: -130 }
        ];
  
    // button base
    button.fillStyle(0x808080, 1);
    button.beginPath();
    button.moveTo(trapezoidPoints[0].x, trapezoidPoints[0].y);
    trapezoidPoints.forEach(p => button.lineTo(p.x, p.y));
    button.closePath().fillPath();
  
    // arrow
    const arrowPoints = flip
      ? [
          { x: -18, y: 0 }, { x: -8, y: -10 }, { x: -8, y: 10 }
        ]
      : [
          { x: 18, y: 0 }, { x: 8, y: -10 }, { x: 8, y: 10 }
        ];
    button.fillStyle(0x606060, 1);
    button.beginPath();
    button.moveTo(arrowPoints[0].x, arrowPoints[0].y);
    arrowPoints.forEach(p => button.lineTo(p.x, p.y));
    button.closePath().fillPath();
  
    // interactivity
    button.setInteractive(new Phaser.Geom.Polygon(trapezoidPoints), Phaser.Geom.Polygon.Contains);
    button.on('pointerover', () => button.fillStyle(0x909090, 1));
    button.on('pointerout', () => button.fillStyle(0x808080, 1));
    button.on('pointerdown', () => this.hideSkillTree());
  
    return button;
  }

  showPrerequisiteError(skill, x, y) {
    const errorText = this.scene.add.text(x, y - 20, `Unlock ${skill.prerequisite} first!`, {
      fontSize: '16px',
      fill: '#ff0000'
    }).setOrigin(0.5);
    
    // Fade out and destroy after 2 seconds.
    this.scene.tweens.add({
      targets: errorText,
      alpha: 0,
      duration: 2000,
      onComplete: () => errorText.destroy()
    });
  }

  

}
