// Basic Phaser game setup

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false // Enable this for collision debugging
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT, // Scale the game to fit the window
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game in the window
    },
    fps: {
        target: 60, // Set the target frame rate
        forceSetTimeOut: true // Use setTimeout to maintain the frame rate
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Load your assets here
    this.load.spritesheet('playerIdle', 'assets/player/idle/Idle-Sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('playerRun', 'assets/player/run/Run-Sheet.png', { frameWidth: 64, frameHeight: 64 }); // Load run-sheet sprite sheet
}

function create() {
    // Set a background color
    this.cameras.main.setBackgroundColor('#87CEEB'); // Light blue background

    // Initialize your game objects here
    this.player = this.physics.add.sprite(200, 200, 'playerIdle'); // Create the player sprite with the idle frame
    this.player.setCollideWorldBounds(true); // Prevent the player from going out of bounds
    this.player.setOrigin(0.5, 1); // Set origin to center both horizontally and vertically

    // Create an animation for the idle state
    this.anims.create({
        key: 'idle', // Animation key
        frames: this.anims.generateFrameNumbers('playerIdle', { start: 0, end: 3 }), // Adjust range to your spritesheet
        frameRate: 10, // Frames per second
        repeat: -1 // Loop the animation
    });

    // Create an animation for the running state
    this.anims.create({
        key: 'run', // Animation key
        frames: this.anims.generateFrameNumbers('playerRun', { start: 0, end: 5 }), // Adjust range to your run spritesheet
        frameRate: 10, // Frames per second
        repeat: -1 // Loop the animation
    });

    this.player.anims.play('idle'); // Play the idle animation

    // Input handling
    this.cursors = this.input.keyboard.createCursorKeys(); // Create cursor keys for movement
}

function update() {
    // Reset velocities
    this.player.setVelocityX(0);
    this.player.setVelocityY(0);

    const speed = 160; // Define a constant speed

    // Movement logic

    if (this.cursors.left.isDown && this.cursors.up.isDown) {
        this.player.setVelocityX(-speed / Math.sqrt(2)); // Normalize for diagonal movement
        this.player.setVelocityY(-speed / Math.sqrt(2));
    } else if (this.cursors.left.isDown && this.cursors.down.isDown) {
        this.player.setVelocityX(-speed / Math.sqrt(2)); // Normalize for diagonal movement
        this.player.setVelocityY(speed / Math.sqrt(2));
    } else if (this.cursors.right.isDown && this.cursors.up.isDown) {
        this.player.setVelocityX(speed / Math.sqrt(2)); // Normalize for diagonal movement
        this.player.setVelocityY(-speed / Math.sqrt(2));
    } else if (this.cursors.right.isDown && this.cursors.down.isDown) {
        this.player.setVelocityX(speed / Math.sqrt(2)); // Normalize for diagonal movement
        this.player.setVelocityY(speed / Math.sqrt(2));
    }


    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed); // Move left
        this.player.flipX = true; // Flip the sprite to face left
    } 
    if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed); // Move right
        this.player.flipX = false; // Ensure the sprite faces right
    } 
    if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed); // Move up
    } 
    if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed); // Move down
    }

    // Determine which animation to play
    if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
        this.player.anims.play('run', true); // Play running animation
    } else {
        this.player.anims.play('idle', true); // Play idle animation
    }
} 