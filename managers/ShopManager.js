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
        
        const shopBg = this.scene.add.graphics();
        shopBg.fillStyle(0x000000, 0.8);
        shopBg.fillRoundedRect(50, 50, screenWidth - 100, screenHeight - 100, 20);
        shopBg.lineStyle(2, 0xffffff, 0.8);
        shopBg.strokeRoundedRect(50, 50, screenWidth - 100, screenHeight - 100, 20);

        const coinText = this.scene.add.text(
            66,
            75,
            `Coins: ${this.playerManager.stats.coins}`,
            { fontSize: '22px', fill: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold' }
        );

        this.shopContainer = this.scene.add.container(0, 0, [shopBg, coinText]);

        const boxMargin = 10; 
        const boxWidth = screenWidth - 120; 
        const boxHeight = 227;
        const boxX = 50 + boxMargin; 
        const boxY = 150 - boxMargin - 30; 
        const contentBox = this.scene.add.graphics();
        contentBox.lineStyle(3, 0xffffff, 0.8);
        contentBox.strokeRoundedRect(0, 0, boxWidth, boxHeight, 10);

        const contentBoxContainer = this.scene.add.container(boxX, boxY, [contentBox]);
        contentBoxContainer.setDepth(9);

        const tabWidth = 120;
        const tabHeight = 50;
        const tabGap = 5;
        const tabX = screenWidth - (tabWidth * 3 + tabGap * 2) - 60;
        const tabY = 100 - boxMargin - 30;
        const tabContainer = this.scene.add.container(tabX, tabY);

        const createTabButton = (label, x) => {
            const tabBg = this.scene.add.graphics();
            tabBg.fillStyle(0x222222, 0.7);
            tabBg.fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 });
            tabBg.lineStyle(2, 0xffffff, 0.8);
            tabBg.strokeRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 });

            const tabText = this.scene.add.text(tabWidth / 2, tabHeight / 2, label, {
                fontSize: '16px',
                fill: '#FFD700', 
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            const tabContainer = this.scene.add.container(x, 0, [tabBg, tabText]);
            tabBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, tabWidth, tabHeight), Phaser.Geom.Rectangle.Contains);

            tabBg.on('pointerover', () => tabBg.clear().fillStyle(0x333333, 0.9).fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 }).strokeRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 }));
            tabBg.on('pointerout', () => tabBg.clear().fillStyle(0x222222, 0.7).fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 }).strokeRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 }));

            return tabContainer;
        };

        const tabBuy = createTabButton("Buy", 0);
        const tabSell = createTabButton("Sell", tabWidth + tabGap);
        const tabLucky = createTabButton("The Lucky Mug", (tabWidth + tabGap) * 2);

        tabContainer.add([tabBuy, tabSell, tabLucky]);

        const buyContent = this.scene.add.container(10, 10);
        const sellContent = this.scene.add.container(10, 10);
        const luckyContent = this.scene.add.container(10, 10);

        const fillerStyle = { fontSize: '20px', fill: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold' };
        buyContent.add(this.scene.add.text(0, 0, "Placeholder for buying", fillerStyle));
        sellContent.add(this.scene.add.text(0, 0, "Placeholder for selling", fillerStyle));
        luckyContent.add(this.scene.add.text(0, 0, "Placeholder for gambling", fillerStyle));

        buyContent.setVisible(true);
        sellContent.setVisible(false);
        luckyContent.setVisible(false);

        contentBoxContainer.add([buyContent, sellContent, luckyContent]);

        contentBox.strokeRoundedRect(
            0,
            0,
            boxWidth,
            boxHeight,
            { tl: 10, tr: 0, bl: 10, br: 10 } 
        );

        const setActiveTab = (activeTab, activeContent) => {
            [tabBuy, tabSell, tabLucky].forEach((tab, index) => {
                const bg = tab.getAt(0); 
                const text = tab.getAt(1); 
        
                if (index === activeTab) {
                    bg.clear();
                    bg.fillStyle(0xffffff, 1); 
                    bg.fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 });
                    bg.strokeRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 });
                    text.setFill('#ff0000');
        
                    this.scene.time.delayedCall(100, () => {
                        bg.clear();
                        bg.fillStyle(0x222222, 0.7); 
                        bg.fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 });
                        bg.strokeRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 });
                    });

                } else {
                    bg.clear();
                    bg.fillStyle(0x222222, 0.7); 
                    bg.fillRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 });
                    bg.strokeRoundedRect(0, 0, tabWidth, tabHeight, { tl: 10, tr: 10, bl: 0, br: 0 });
                    text.setFill('#FFD700'); 
                }
            });
        
            buyContent.setVisible(activeContent === 0);
            sellContent.setVisible(activeContent === 1);
            luckyContent.setVisible(activeContent === 2);
        };

        tabBuy.getAt(0).on('pointerdown', () => setActiveTab(0, 0));
        tabSell.getAt(0).on('pointerdown', () => setActiveTab(1, 1));
        tabLucky.getAt(0).on('pointerdown', () => setActiveTab(2, 2));

        this.shopContainer.add([contentBoxContainer, tabContainer]);

        this.keyE = this.scene.input.keyboard.addKey('E');
        this.keyE.on('down', () => {
            if (this.playerManager.shopOpen) {
                this.closeShop();
            }
        });

        this.playerManager.shopOpen = true;
    }

    closeShop() {
        if (this.shopContainer) {
            this.shopContainer.destroy();
            this.shopContainer = null;
        }
        this.scene.physics.resume();
        this.scene.anims.resumeAll();

        this.playerManager.player.y = 150;
        console.log("Teleport");
        this.scene.time.delayedCall(200, () => {
            this.playerManager.shopOpen = false;
        });
    }
}