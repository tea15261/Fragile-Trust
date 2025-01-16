// Basic Phaser game setup

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true // Enable this for collision debugging
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
    this.load.image('forest', 'assets/environment/forest backdrop.png'); // Load the forest backdrop
    this.load.image('tavern', 'assets/environment/tavern.jpg'); // Load the tavern
    this.load.spritesheet('playerRun', 'assets/player/run/test.png', { frameWidth: 32, frameHeight: 32 }); // Load run-sheet sprite sheet
    this.load.spritesheet('handsIdle', 'assets/player/idle/Knight Idle holding nothing.png', { frameWidth: 32, frameHeight: 32 }); // Load hands sprite sheet
    this.load.spritesheet('handsRun', 'assets/player/run/Knight Run holding nothing.png', { frameWidth: 64, frameHeight: 64 }); // Load running hands sprite sheet
}

function create() {
    // Add the forest backdrop and scale it down
    const forestBackdrop = this.add.image(320, 200, 'forest'); // Add the backdrop
    forestBackdrop.setScale(0.4); // Scale down to fit the screen (adjust as needed)

    // Initialize your game objects here
    this.player = this.physics.add.sprite(300, 200, 'playerIdle'); // Create the player sprite with the idle frame
    this.player.setCollideWorldBounds(true); // Prevent the player from going out of bounds
    this.player.setOrigin(0.5, 1); // Center horizontally and bottom vertically
    this.player.setSize(32, 32); // Set the size of the physics body to match the sprite
    this.player.setOffset(0, 0); // Adjust the offset if necessary

    // Create hands sprite
    this.hands = this.add.sprite(this.player.x, this.player.y, 'handsIdle'); // Create hands sprite
    this.hands.setOrigin(0.5, 1); // Set origin to center both horizontally and vertically
    this.hands.visible = false; // Initially hide the hands

    // Player state variable
    this.playerState = 'holdingNothing'; // Initial state

    // Create animations for different states
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('playerIdle', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('playerRun', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'handsIdle',
        frames: this.anims.generateFrameNumbers('handsIdle', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'handsRun',
        frames: this.anims.generateFrameNumbers('handsRun', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.player.anims.play('idle'); // Play the idle animation

    // Input handling
    this.cursors = this.input.keyboard.createCursorKeys(); // Create cursor keys for movement
    // Create a static group for obstacles
    this.obstacles = this.physics.add.staticGroup();
    
    // Add invisible walls (you can adjust the position and size)
    this.obstacles.create(0, 200, null).setSize(400, 150).setOrigin(0, 0).setVisible(false); // Left wall
    this.obstacles.create(0, 300, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
    this.obstacles.create(10, 290, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
    this.obstacles.create(20, 280, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
    this.obstacles.create(30, 270, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
    this.obstacles.create(40, 260, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
    this.obstacles.create(50, 250, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall
    this.obstacles.create(60, 240, null).setSize(200, 75).setOrigin(0, 0).setVisible(false); // Left wall

    this.obstacles.create(0, 0, null).setSize(560, 300).setOrigin(0, 0).setVisible(false); // Left wall
    this.obstacles.create(300, 0, null).setSize(260, 60).setOrigin(0, 0).setVisible(false); // Top wall
    this.obstacles.create(600, 270, null).setSize(425, 100).setOrigin(0, 0).setVisible(false); // Right wall
    this.obstacles.create(700, 370, null).setSize(425, 100).setOrigin(0, 0).setVisible(false); // Right wall
    this.obstacles.create(700, 170, null).setSize(325, 150).setOrigin(0, 0).setVisible(false); // Right wall

    // Enable collision between the player and the obstacles
    this.physics.add.collider(this.player, this.obstacles);

    // Create a static group for special walls
    this.specialWalls = this.physics.add.staticGroup();

    // Add special walls (you can adjust the position and size)
    this.specialWalls.create(165, 300, null).setSize(50, 60).setOrigin(0, 0).setVisible(false); // Example special wall
    this.specialWalls.create(395, 300, null).setSize(50, 120).setOrigin(0, 0).setVisible(false);
    this.specialWalls.create(445, 400, null).setSize(50, 25).setOrigin(0, 0).setVisible(false);
    this.specialWalls.create(520, 200, null).setSize(150, 160).setOrigin(0, 0).setVisible(false);
    this.specialWalls.create(540, 170, null).setSize(150, 120).setOrigin(0, 0).setVisible(false);
    this.specialWalls.create(600, 170, null).setSize(120, 230).setOrigin(0, 0).setVisible(false);
    // Enable collision between the player and the special walls
    this.physics.add.overlap(this.player, this.specialWalls, (player, wall) => {
        handleSpecialWallEnter.call(this, player, wall); // Correctly bind the context
    }, null, this);
}

function update() {
    // Reset velocities
    this.player.setVelocityX(0);
    this.player.setVelocityY(0);

    const speed = 160; // Define a constant speed

    // Movement logic
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


    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.flipX = true; // Flip the sprite to face left
        this.hands.x = this.player.x-4; // Position hands relative to player
        this.hands.y = this.player.y+2; // Position hands relative to player
    } 
    if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.flipX = false; // Ensure the sprite faces right
        this.hands.x = this.player.x+4; // Position hands relative to player
        this.hands.y = this.player.y+2; // Position hands relative to player
    } 
    if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed); // Move up
        this.hands.y = this.player.y-2; // Position hands relative to player
    } 
    if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed); // Move down
        this.hands.y = this.player.y+4; // Position hands relative to player
    }

    // Determine which animation to play
    if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
        this.player.anims.play('run', true); // Play running animation
        this.hands.visible = true; // Show hands when running
        this.hands.anims.play('handsRun', true); // Play running hands animation
        
    } else {
        this.player.anims.play('idle', true); // Play idle animation
        this.hands.visible = true; // Show hands when idle
        this.hands.anims.play('handsIdle', true); // Play hands animation
        this.hands.x = this.player.x; // Position hands relative to player
        this.hands.y = this.player.y; // Position hands relative to player
    }

    // Update hands animation based on state
    if (this.playerState === 'holdingNothing') {
        if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
            this.player.anims.play('run', true); // Play running animation
            this.hands.visible = true; // Show hands when running
            this.hands.anims.play('handsRun', true); // Play running hands animation
        } else if (this.player.body.velocity.x == 0 && this.player.body.velocity.y == 0) {
            this.player.anims.play('idle', true); // Play idle animation
            this.hands.visible = true; // Show hands when idle
            this.hands.anims.play('handsIdle', true); // Play hands animation
            this.hands.x = this.player.x; // Position hands relative to player
            this.hands.y = this.player.y; // Position hands relative to player
    } else if (this.playerState === 'holdingSomething') {
        // Logic for holding something (if needed)
    }

    // Example condition to switch to holding state
    if (this.input.keyboard.checkDown(this.cursors.space, 250)) { // Example: space key to toggle state
        if (this.playerState === 'holdingNothing') {
            this.playerState = 'holdingSomething';
            // Change sprite or animation if needed
        } else {
            this.playerState = 'holdingNothing';
            // Change sprite or animation if needed
        }
    }
    }

    // Check if the player is overlapping with the special wall
    if (this.physics.overlap(this.player, this.specialWalls)) {
        // Make the player and hands invisible
        this.player.setVisible(false);
        this.hands.setVisible(false);
    } else {
        // Make the player and hands visible again
        this.player.setVisible(true);
        this.hands.setVisible(true);
    }

} 

function handleSpecialWallEnter(player, wall) {
    // Make the player and hands invisible
    player.setVisible(false);
    this.hands.setVisible(false);
} 