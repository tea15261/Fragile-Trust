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

        // Create a container for tab headers inside shopContainer.
        // Position these relative to shopContainer (which already holds the shopBg and coinText).
        const tabContainer = this.scene.add.container(60, 80);

        // (Optional) If you need a background for the header, you can add one here.
        // In this case, we leave it transparent so it blends with the shop box.

        // Helper function to create a clickable tab that looks like a chrome tab using dark colors.
        const createTabButton = (label, x, width) => {
            // Create a container and explicitly set its size.
            const buttonContainer = this.scene.add.container(x, 0);
            buttonContainer.setSize(width, 30);
            
            // Create a rectangle as the button background.
            const buttonBg = this.scene.add.rectangle(0, 0, width, 30, 0x222222, 0.7)
                .setOrigin(0, 0);
            
            // (Optional) Use a Graphics object to draw a border.
            const borderGraphics = this.scene.add.graphics();
            borderGraphics.lineStyle(2, 0xaaaaaa, 1);
            borderGraphics.strokeRoundedRect(0, 0, width, 30, 5);
            
            // Create the text using your desired style.
            const buttonText = this.scene.add.text(width / 2, 15, label, {
                fontSize: '16px',
                fill: '#FFD700',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Add all elements to the container.
            buttonContainer.add([buttonBg, borderGraphics, buttonText]);
            
            // Set an interactive hit area exactly matching the container:
            buttonBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, 30), Phaser.Geom.Rectangle.Contains);
            buttonBg.on('pointerover', () => { buttonBg.setFillStyle(0x333333, 0.9); });
            buttonBg.on('pointerout', () => { buttonBg.setFillStyle(0x222222, 0.7); });

            
            return buttonContainer;
        };

        const tabWidth = 120;
        const tabMargin = 10;
        const tabBuy = createTabButton("Buy", 0, tabWidth);
        const tabSell = createTabButton("Sell", tabWidth + tabMargin, tabWidth);
        const tabLucky = createTabButton("The Lucky Mug", (tabWidth + tabMargin) * 2, tabWidth);
        tabContainer.add([tabBuy, tabSell, tabLucky]);
        

        // Create a container for the tab content panels inside the shop container.
        const contentContainer = this.scene.add.container(0, 40);
        const contentWidth = screenWidth - 120;
        const contentHeight = screenHeight - 150;

        // Create content containers for each tab.
        const buyContent = this.scene.add.container(10, 10);
        const sellContent = this.scene.add.container(10, 10);
        const luckyContent = this.scene.add.container(10, 10);

        // Add filler text (using dark-themed colors so no white backgrounds appear)
        const fillerStyle = { fontSize: '20px', fill: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold' };
        const buyText = this.scene.add.text(0, 0, "Buy items here...", fillerStyle);
        buyContent.add(buyText);
        const sellText = this.scene.add.text(0, 0, "Sell your items here...", fillerStyle);
        sellContent.add(sellText);
        const luckyText = this.scene.add.text(0, 0, "The Lucky Mug contents...", fillerStyle);
        luckyContent.add(luckyText);

        // Initially show only Buy content
        buyContent.setVisible(true);
        sellContent.setVisible(false);
        luckyContent.setVisible(false);

        // Add the content containers to the content container.
        contentContainer.add([buyContent, sellContent, luckyContent]);

        // Add both the tab headers and the content containers to the shop container.
        this.shopContainer.add([tabContainer, contentContainer]);

        // Event handlers to switch tabs.
        tabBuy.on('pointerdown', () => {
            buyContent.setVisible(true);
            sellContent.setVisible(false);
            luckyContent.setVisible(false);
        });
        tabSell.on('pointerdown', () => {
            buyContent.setVisible(false);
            sellContent.setVisible(true);
            luckyContent.setVisible(false);
        });
        tabLucky.on('pointerdown', () => {
            buyContent.setVisible(false);
            sellContent.setVisible(false);
            luckyContent.setVisible(true);
        });

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