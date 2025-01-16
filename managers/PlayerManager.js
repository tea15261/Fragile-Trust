export default class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.hands = null;
        this.playerState = 'holdingNothing';

        this.init();
    }

    init() {
        // Create player and hands sprites
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

        // Never delete this code, it makes sure diagonal movement is equal
    if (this.cursors.left.isDown && this.cursors.up.isDown) {
        this.player.setVelocityX(-speed / Math.sqrt(2)); // Normalize for diagonal movement
        this.player.setVelocityY(-speed / Math.sqrt(2));
        this.hands.x = this.player.x-2; // Position hands relative to player
        this.hands.y = this.player.y-2; // Position hands relative to player
    } else if (this.cursors.left.isDown && this.cursors.down.isDown) {
        this.player.setVelocityX(-speed / Math.sqrt(2)); // Normalize for diagonal movement
        this.player.setVelocityY(speed / Math.sqrt(2));
        this.hands.x = this.player.x-2; // Position hands relative to player
        this.hands.y = this.player.y+2; // Position hands relative to player
    } else if (this.cursors.right.isDown && this.cursors.up.isDown) {
        this.player.setVelocityX(speed / Math.sqrt(2)); // Normalize for diagonal movement
        this.player.setVelocityY(-speed / Math.sqrt(2));
        this.hands.x = this.player.x+2; // Position hands relative to player
        this.hands.y = this.player.y-2; // Position hands relative to player
    } else if (this.cursors.right.isDown && this.cursors.down.isDown) {
        this.player.setVelocityX(speed / Math.sqrt(2)); // Normalize for diagonal movement
        this.player.setVelocityY(speed / Math.sqrt(2));
        this.hands.x = this.player.x+2; // Position hands relative to player
        this.hands.y = this.player.y+2; // Position hands relative to player
    }

        if (this.scene.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.flipX = true;
            this.hands.x = this.player.x - 4;
            this.hands.y = this.player.y + 2;
        } else if (this.scene.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.flipX = false;
            this.hands.x = this.player.x + 4;
            this.hands.y = this.player.y + 2;
        }

        if (this.scene.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            this.hands.y = this.player.y - 2;
        } else if (this.scene.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            this.hands.y = this.player.y + 4;
        }

        // Update animations based on movement
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

        // Handle state switching and visibility
        if (this.scene.input.keyboard.checkDown(this.scene.cursors.space, 250)) {
            this.playerState = this.playerState === 'holdingNothing' ? 'holdingSomething' : 'holdingNothing';
        }
    }

    hide() {
        this.player.setVisible(false);
        this.hands.setVisible(false);
    }

    show() {
        this.player.setVisible(true);
        this.hands.setVisible(true);
    }
}