import PlayerManager from '/managers/PlayerManager.js';

export default class MonsterManager {
    constructor(scene, playerManager) {
        this.scene = scene;
        this.monster = null;
        this.shadow = null;
        this.healthBar = null;
        this.defenseBar = null;
        this.attackBar = null;
        this.playerManager = playerManager;

        this.monsterTypes = [
            {
                key: 'SkeletonBase',
                stats: { health: 75, attack: 45, defense: 30 },
            },
            {
                key: 'SkeletonWarrior',
                stats: { health: 75, attack: 45, defense: 30 },
            },
            {
                key: 'SkeletonRouge',
                stats: { health: 75, attack: 45, defense: 30 },
            },
            {
                key: 'SkeletonMage',
                stats: { health: 75, attack: 45, defense: 30 },
            },
            {
                key: 'OrcBase',
                stats: { health: 100, attack: 60, defense: 40 },
            },
            {
                key: 'OrcWarrior',
                stats: { health: 100, attack: 60, defense: 40 },
            },
            {
                key: 'OrcRouge',
                stats: { health: 100, attack: 60, defense: 40 },
            },
            {
                key: 'OrcMage',
                stats: { health: 100, attack: 60, defense: 40 },
            },
        ];

        this.init();
    }

    init() {
        this.createAnimations();
        this.generateNewMonster();
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'skeletonBaseIdle',
            frames: this.scene.anims.generateFrameNumbers('SkeletonBaseIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'skeletonWarriorIdle',
            frames: this.scene.anims.generateFrameNumbers('SkeletonWarriorIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'skeletonRougeIdle',
            frames: this.scene.anims.generateFrameNumbers('SkeletonRougeIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'skeletonMageIdle',
            frames: this.scene.anims.generateFrameNumbers('SkeletonMageIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'orcBaseIdle',
            frames: this.scene.anims.generateFrameNumbers('OrcBaseIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'orcWarriorIdle',
            frames: this.scene.anims.generateFrameNumbers('OrcWarriorIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'orcRougeIdle',
            frames: this.scene.anims.generateFrameNumbers('OrcRougeIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'orcMageIdle',
            frames: this.scene.anims.generateFrameNumbers('OrcMageIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    }

    generateNewMonster() {
        const monsterType = Phaser.Math.RND.pick(this.monsterTypes);
        this.currentMonsterType = monsterType.key;
        
        this.health = monsterType.stats.health;
        this.attack = monsterType.stats.attack;
        this.defense = monsterType.stats.defense;

        this.createMonster();
    }

    createMonster(color) {
        const posX = 200; 
        const posY = 100;

        if(this.monster) {
            this.monster.destroy();
            this.shadow.destroy();
        }

        this.shadow = this.scene.add.ellipse(posX, posY + 8, 30, 10, 0x000000, 0.5);
        this.shadow.setOrigin(-1.8, -10.2);

        if (this.currentMonsterType === 'SkeletonBase') {
            this.monster = this.scene.add.sprite(posX, posY, 'SkeletonBaseIdle');
            this.monster.play('skeletonBaseIdle');
        } else if (this.currentMonsterType === 'SkeletonWarrior') {
            this.monster = this.scene.add.sprite(posX, posY, 'SkeletonWarriorIdle');
            this.monster.play('skeletonWarriorIdle');
        }
        else if (this.currentMonsterType === 'SkeletonRouge') {
            this.monster = this.scene.add.sprite(posX, posY, 'SkeletonRougeIdle');
            this.monster.play('skeletonRougeIdle');
        }
        else if (this.currentMonsterType === 'SkeletonMage') {
            this.monster = this.scene.add.sprite(posX, posY, 'SkeletonMageIdle');
            this.monster.play('skeletonMageIdle');
        }
        else if (this.currentMonsterType === 'OrcBase') {
            this.monster = this.scene.add.sprite(posX, posY, 'OrcBaseIdle');
            this.monster.play('orcBaseIdle');
        }
        else if (this.currentMonsterType === 'OrcWarrior') {
            this.monster = this.scene.add.sprite(posX, posY, 'OrcWarriorIdle');
            this.monster.play('orcWarriorIdle');
        }
        else if (this.currentMonsterType === 'OrcRouge') {
            this.monster = this.scene.add.sprite(posX, posY, 'OrcRougeIdle');
            this.monster.play('orcRougeIdle');
        }
        else if (this.currentMonsterType === 'OrcMage') {
            this.monster = this.scene.add.sprite(posX, posY, 'OrcMageIdle');
            this.monster.play('orcMageIdle');
        }
        
        this.monster.setOrigin(0.5, 0.5);
        this.monster.setSize(32, 32);
    }

    stats() {
        return {
            health: this.health,
            attack: this.attack,
            defense: this.defense
        };
    }

    name() {
        return this.currentMonsterType;
    }

    hide() {
        this.monster.setVisible(false);
        this.shadow.setVisible(false);
    }

    show() {
        this.monster.setVisible(true);
        this.shadow.setVisible(true);
    }

    reset() {
        this.generateNewMonster();
        this.show();
    }
}