export default class ShopManager {
    constructor(scene, playerManager) {
        this.scene = scene;
        this.playerManager = playerManager;
        this.shopContainer = null;
        this.init();
    }

    init() {
        console.log("Shop opened");

        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;

        // Create a semi-transparent black box with rounded corners
        const shopBg = this.scene.add.graphics();
        shopBg.fillStyle(0x000000, 0.8);
        shopBg.fillRoundedRect(50, 50, screenWidth - 100, screenHeight - 100, 20);
        shopBg.lineStyle(2, 0xffffff, 0.8);
        shopBg.strokeRoundedRect(50, 50, screenWidth - 100, screenHeight - 100, 20);

        // Display the amount of coins in the top left corner
        const coinText = this.scene.add.text(
            70,
            70,
            `Coins: ${this.playerManager.stats.coins}`,
            { fontSize: '24px', fill: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold' }
        );

        // Create a container to hold the shop UI elements
        this.shopContainer = this.scene.add.container(0, 0, [shopBg, coinText]);

        // Add key listener to exit the shop menu
        this.keyE = this.scene.input.keyboard.addKey('E');
        this.keyE.on('down', () => {
            if (this.playerManager.shopOpen) {
                this.closeShop();
            }
        });
        

        // Prevent inventory access while the shop is open
        this.playerManager.shopOpen = true;
    }

    closeShop() {
        if (this.shopContainer) {
            this.shopContainer.destroy();
            this.shopContainer = null;
        }
        this.scene.physics.resume();
        this.scene.anims.resumeAll();

        // Teleport the player 30 pixels below the shop hitbox
        this.playerManager.player.y = 150;
        console.log("Teleport");
        // Allow inventory access again after a short delay
        this.scene.time.delayedCall(200, () => {
            this.playerManager.shopOpen = false;
        });
    }
}