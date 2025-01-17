export default class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.hands = null;
        this.shadow = null; 
        this.playerState = 'holdingNothing';

        this.init();
    }

    init() {
        this.shadow = this.scene.add.ellipse(400, 100, 30, 10, 0x000000, 0.5);
        this.shadow.setOrigin(0.5, 1.5);

        // create player and hands sprites
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

    update() {
        const speed = 160;
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);
        
        const velocity = { x: 0, y: 0 };
        
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
        
        if (velocity.x !== 0 && velocity.y !== 0) {
            const normalizationFactor = Math.sqrt(2) / 2;
            velocity.x *= normalizationFactor;
            velocity.y *= normalizationFactor;
        }
        
        this.player.setVelocity(velocity.x, velocity.y);
        
        if (!this.scene.cursors.up.isDown && !this.scene.cursors.down.isDown) {
            this.hands.y = this.player.y + 2; 
        }

        this.shadow.x = this.player.x;
        this.shadow.y = this.player.y + 8;

        // update animations based on movement
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

        // state switching and visibility
        if (this.scene.input.keyboard.checkDown(this.scene.cursors.space, 250)) {
            this.playerState = this.playerState === 'holdingNothing' ? 'holdingSomething' : 'holdingNothing';
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