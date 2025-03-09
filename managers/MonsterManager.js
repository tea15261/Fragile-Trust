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
            key: 'skeletonBaseDeath',
            frames: this.scene.anims.generateFrameNumbers('SkeletonBaseDeath', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'skeletonWarriorIdle',
            frames: this.scene.anims.generateFrameNumbers('SkeletonWarriorIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'skeletonWarriorDeath',
            frames: this.scene.anims.generateFrameNumbers('SkeletonWarriorDeath', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'skeletonRougeIdle',
            frames: this.scene.anims.generateFrameNumbers('SkeletonRougeIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'skeletonRougeDeath',
            frames: this.scene.anims.generateFrameNumbers('SkeletonRougeDeath', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'skeletonMageIdle',
            frames: this.scene.anims.generateFrameNumbers('SkeletonMageIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'skeletonMageDeath',
            frames: this.scene.anims.generateFrameNumbers('SkeletonMageDeath', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'orcBaseIdle',
            frames: this.scene.anims.generateFrameNumbers('OrcBaseIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'orcBaseDeath',
            frames: this.scene.anims.generateFrameNumbers('OrcBaseDeath', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'orcWarriorIdle',
            frames: this.scene.anims.generateFrameNumbers('OrcWarriorIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'orcWarriorDeath',
            frames: this.scene.anims.generateFrameNumbers('OrcWarriorDeath', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'orcRougeIdle',
            frames: this.scene.anims.generateFrameNumbers('OrcRougeIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'orcRougeDeath',
            frames: this.scene.anims.generateFrameNumbers('OrcRougeDeath', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'orcMageIdle',
            frames: this.scene.anims.generateFrameNumbers('OrcMageIdle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'orcMageDeath',
            frames: this.scene.anims.generateFrameNumbers('OrcMageDeath', { start: 0, end: 6 }),
            frameRate: 10,
            repeat: 0
        });
    }

    generateNewMonster(monsterKey = null) {
        const monsterType = monsterKey 
            ? this.monsterTypes.find(monster => monster.key === monsterKey)
            : Phaser.Math.RND.pick(this.monsterTypes);
        
        if (!monsterType) {
            console.warn(`Monster type "${monsterKey}" not found. Falling back to random.`);
            return this.generateNewMonster(); 
        }
    
        this.currentMonsterType = monsterType.key;
        this.health = monsterType.stats.health;
        this.attack = monsterType.stats.attack;
        this.defense = monsterType.stats.defense;
    
        this.createMonster();
    }
    

    createMonster() {
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

    playDeathAnimation() {
        const currentX = this.monster.x;
        const currentY = this.monster.y;

        if (this.currentMonsterType === 'SkeletonBase') {
            this.monster.play('skeletonBaseDeath');
        } else if (this.currentMonsterType === 'SkeletonWarrior') {
            this.monster.play('skeletonWarriorDeath');
        }
        else if (this.currentMonsterType === 'SkeletonRouge') {
            this.monster.play('skeletonRougeDeath');
        }
        else if (this.currentMonsterType === 'SkeletonMage') {
            this.monster.play('skeletonMageDeath');
        }
        else if (this.currentMonsterType === 'OrcBase') {
            this.monster.play('orcBaseDeath');
        }
        else if (this.currentMonsterType === 'OrcWarrior') {
            this.monster.play('orcWarriorDeath');
        }
        else if (this.currentMonsterType === 'OrcRouge') {
            this.monster.play('orcRougeDeath');
        }
        else if (this.currentMonsterType === 'OrcMage') {
            this.monster.play('orcMageDeath');
        }

        this.monster.setPosition(currentX, currentY-15);

        if (this.currentMonsterType === 'OrcWarrior')
            this.monster.setPosition(currentX-8, currentY-25);
        else if (this.currentMonsterType === 'SkeletonRouge')
            this.monster.setPosition(currentX+10, currentY-15);
        else if (this.currentMonsterType === 'SkeletonWarrior')
            this.monster.setPosition(currentX+10, currentY-10);
        else if (this.currentMonsterType === 'OrcBase')
            this.monster.setPosition(currentX-8, currentY-17);
        else if (this.currentMonsterType === 'OrcRouge')
            this.monster.setPosition(currentX-5, currentY-15);
        else if (this.currentMonsterType === 'OrcMage')
            this.monster.setPosition(currentX-5, currentY-15);

        this.monster.setOrigin(0.5, 0.5);
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