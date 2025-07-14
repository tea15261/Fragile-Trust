import ItemManager from '/managers/ItemManager.js';

let pinnedItem = null;
let isSliderDragging = false;
let currentSellValue = 0;

export default class ShopManager {
    
    constructor(scene, playerManager) {
        this.scene = scene;
        this.playerManager = playerManager;
        this.itemManager = new ItemManager();
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

        // Improved coin text style
        const coinText = this.scene.add.text(
            66,
            75,
            `Coins: ${this.playerManager.stats.coins}`,
            {
                fontSize: '20px',
                fill: '#FFCE00', // Brighter gold
                fontFamily: 'Verdana',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true }
            }
        );

        // Create the shop container BEFORE adding any elements to it.
        this.shopContainer = this.scene.add.container(0, 0, [shopBg, coinText]);

        // Improved coin gain popup style
        this.coinGainPopup = this.scene.add.text(
            coinText.x + 75, 
            coinText.y - 17, 
            '', 
            {
                fontSize: '18px',
                fill: '#00FF00',
                fontFamily: 'Verdana',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true }
            }
        ).setOrigin(0, 0);
        this.coinGainPopup.setVisible(false);
        this.shopContainer.add(this.coinGainPopup);

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
                fontSize: '13px',
                fill: '#FFCE00',
                fontFamily: 'Verdana',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 1 }
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
        buyContent.setSize(boxWidth, boxHeight);

        // Left Panel: Shop Grid (items to buy)
        const buyGridAreaWidth = 300;
        const buyGridAreaHeight = boxHeight - 40;
        const buySlotGap = 10;
        const buyCols = 5;
        const buyRows = 3;
        const buySlotSize = Math.floor((buyGridAreaWidth - (buyCols + 1) * buySlotGap) / buyCols);
        const buyGridX = 0;
        const buyGridY = 0;

        const buyGridContainer = this.scene.add.container(buyGridX, buyGridY);

        // Grid background
        const buyGridBg = this.scene.add.graphics();
        buyGridBg.fillStyle(0x222222, 0.7);
        buyGridBg.fillRoundedRect(0, 0, buyGridAreaWidth, buyGridAreaHeight + 20, 10);
        buyGridContainer.add(buyGridBg);
        
        // Instead of const healthPotionData = {...}
        const shopItems = this.itemManager.getShopItems();
        shopItems.forEach((item, i) => {
            const row = Math.floor(i / buyCols);
            const col = i % buyCols;
            const buySlotX = buySlotGap + col * (buySlotSize + buySlotGap);
            const buySlotY = buySlotGap + row * (buySlotSize + buySlotGap);

            // Create a container for the item card
            const cardContainer = this.scene.add.container(buySlotX, buySlotY);

            // Card background with border and shadow
            const cardBg = this.scene.add.graphics();
            cardBg.fillStyle(0x292929, 0.95);
            cardBg.fillRoundedRect(0, 0, buySlotSize, buySlotSize, 10);
            cardBg.lineStyle(2, 0xFFD700, 1);
            cardBg.strokeRoundedRect(0, 0, buySlotSize, buySlotSize, 10);
            cardBg.setAlpha(0.98);

            // Item image
            const itemImage = this.scene.add.image(
                buySlotSize / 2,
                buySlotSize / 2,
                item.key
            )
                .setDisplaySize(buySlotSize - 12, buySlotSize - 12)
                .setOrigin(0.5);
            itemImage.setInteractive({ useHandCursor: true });

            // Add hover effect
            itemImage.on('pointerover', () => {
                cardBg.clear();
                cardBg.fillStyle(0x333333, 1);
                cardBg.fillRoundedRect(0, 0, buySlotSize, buySlotSize, 10);
                cardBg.lineStyle(2, 0xFFD700, 1);
                cardBg.strokeRoundedRect(0, 0, buySlotSize, buySlotSize, 10);
            });
            itemImage.on('pointerout', () => {
                cardBg.clear();
                cardBg.fillStyle(0x292929, 0.95);
                cardBg.fillRoundedRect(0, 0, buySlotSize, buySlotSize, 10);
                cardBg.lineStyle(2, 0xFFD700, 1);
                cardBg.strokeRoundedRect(0, 0, buySlotSize, buySlotSize, 10);
            });

            // Show details when clicking the item
            itemImage.on("pointerdown", () => {
                updateBuyRightDetail(item);
            });

            // Add all elements to the card container
            cardContainer.add([cardBg, itemImage]);

            // Add the card container to the grid
            buyGridContainer.add(cardContainer);
        });

        const buyRightPanelX = buyGridAreaWidth + 30;
        const buyRightPanelWidth = boxWidth - buyRightPanelX - 20;
        const buyRightPanelHeight = buyGridAreaHeight + 20;
        const buyRightDetail = this.scene.add.container(buyRightPanelX, 0);

        const buyDetailBg = this.scene.add.graphics();
        buyDetailBg.fillStyle(0x222222, 0.7);
        buyDetailBg.fillRoundedRect(0, 0, buyRightPanelWidth, buyRightPanelHeight, 10);
        buyRightDetail.add(buyDetailBg);

        const buyDynamicDetailContainer = this.scene.add.container(0, 0);
        buyRightDetail.add(buyDynamicDetailContainer);

        // Function to update right detail panel for buying
        const updateBuyRightDetail = (item) => {
            buyDynamicDetailContainer.removeAll(true);

            if (item) {
                const nameText = this.scene.add.text(buyRightPanelWidth / 2, 10, item.name, {
                    fontSize: '16px',
                    fill: '#FFD700',
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    align: 'center',
                    wordWrap: { width: buyRightPanelWidth - 20 }
                }).setOrigin(0.5, 0);

                const itemImage = this.scene.add.image(buyRightPanelWidth / 2, 40, item.key)
                    .setDisplaySize(60, 60)
                    .setOrigin(0.5, 0);

                const descriptionText = this.scene.add.text(buyRightPanelWidth / 2, 110, item.description, {
                    fontSize: '12px',
                    fill: '#FFFFFF',
                    fontFamily: 'Arial',
                    align: 'center',
                    wordWrap: { width: buyRightPanelWidth - 20 }
                }).setOrigin(0.5, 0);

                // Price label
                const priceText = this.scene.add.text(
                    buyRightPanelWidth / 2,
                    180,
                    `Price: ${item.price} coins`,
                    {
                        fontSize: '14px',
                        fill: '#FFD700',
                        fontFamily: 'Arial',
                        fontStyle: 'bold'
                    }
                ).setOrigin(0.5, 0);

                // Buy button
                const buyButtonWidth = 100;
                const buyButtonHeight = 30;
                const buyButtonX = buyRightPanelWidth / 2 - buyButtonWidth / 2;
                const buyButtonY = 210;

                const buyButtonBg = this.scene.add.graphics();
                buyButtonBg.fillStyle(0xFFD700, 1);
                buyButtonBg.fillRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);
                buyButtonBg.lineStyle(2, 0xFFFFFF, 1);
                buyButtonBg.strokeRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);
                buyButtonBg.setInteractive(new Phaser.Geom.Rectangle(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight), Phaser.Geom.Rectangle.Contains);

                const buyButtonText = this.scene.add.text(
                    buyButtonX + buyButtonWidth / 2,
                    buyButtonY + buyButtonHeight / 2,
                    "Buy",
                    {
                        fontSize: "16px",
                        fill: "#000000",
                        fontFamily: "Arial",
                        fontStyle: "bold",
                        align: "center"
                    }
                ).setOrigin(0.5, 0.5);

                // Add hover effect
                buyButtonBg.on('pointerover', () => {
                    buyButtonBg.clear();
                    buyButtonBg.fillStyle(0xFFFACD, 1); // Lighter gold color on hover
                    buyButtonBg.fillRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);
                    buyButtonBg.lineStyle(2, 0xFFFFFF, 1); // White border
                    buyButtonBg.strokeRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);

                    // Show red coin loss popup
                    this.coinGainPopup.setText(`-${item.price}`);
                    this.coinGainPopup.setStyle({ fill: '#FF4444' });
                    this.coinGainPopup.setVisible(true);
                });

                // Remove hover effect
                buyButtonBg.on('pointerout', () => {
                    buyButtonBg.clear();
                    buyButtonBg.fillStyle(0xFFD700, 1); // Original gold color
                    buyButtonBg.fillRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);
                    buyButtonBg.lineStyle(2, 0xFFFFFF, 1); // White border
                    buyButtonBg.strokeRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);

                    // Hide coin loss popup
                    this.coinGainPopup.setVisible(false);
                });

                // Add click effect and buying logic
                buyButtonBg.on('pointerdown', () => {
                // Click visual effect
                buyButtonBg.clear();
                buyButtonBg.fillStyle(0xFFC107, 1); // Pressed color
                buyButtonBg.fillRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);
                buyButtonBg.lineStyle(2, 0xFFFFFF, 1);
                buyButtonBg.strokeRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);

                // Hide coin loss popup (will animate it instead)
                this.coinGainPopup.setVisible(false);

                // Reset to default after a short delay
                this.scene.time.delayedCall(100, () => {
                    buyButtonBg.clear();
                    buyButtonBg.fillStyle(0xFFD700, 1);
                    buyButtonBg.fillRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);
                    buyButtonBg.lineStyle(2, 0xFFFFFF, 1);
                    buyButtonBg.strokeRoundedRect(buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, 5);
                });

                // Buying logic
                if (this.playerManager.stats.coins >= item.price) {
                    this.playerManager.stats.coins -= item.price;

                    // Add to inventoryData and update UI
                    this.playerManager.addInventoryItem(item.key);

                    // Also add to inventory array if not already present (for legacy support)
                    // (If you want to stack, you can check for existing item and increment count)
                    let found = false;
                    for (let invItem of this.playerManager.inventory) {
                        if (invItem.key === item.key) {
                            invItem.count = (invItem.count || 1) + 1;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        this.playerManager.inventory.push({ key: item.key, count: 1 });
                    }
                    localStorage.setItem('inventory', JSON.stringify(this.playerManager.inventory));

                    coinText.setText(`Coins: ${this.playerManager.stats.coins}`);

                    // --- Animate the coin loss popup (red, floating up and fading out) ---
                    const initialPopupY = coinText.y - 17;
                    this.coinGainPopup.setText(`-${item.price}`);
                    this.coinGainPopup.setStyle({ fill: '#FF4444' });
                    this.coinGainPopup.setVisible(true);
                    this.coinGainPopup.alpha = 1;
                    this.coinGainPopup.y = initialPopupY;

                    this.scene.tweens.add({
                        targets: this.coinGainPopup,
                        y: initialPopupY - 20, // move 20 pixels up
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            this.coinGainPopup.setVisible(false);
                            this.coinGainPopup.alpha = 1;
                            this.coinGainPopup.y = initialPopupY;
                        }
                    });

                    // --- Animate the coin text pop ---
                    this.scene.tweens.add({
                        targets: coinText,
                        scale: { from: 1.2, to: 1 },
                        duration: 300,
                        ease: 'Power2'
                    });
                } else {
                    // --- Not enough coins: shake the button and show warning text ---
                    this.scene.tweens.add({
                        targets: buyButtonBg,
                        x: { from: buyButtonBg.x, to: buyButtonBg.x + 10 },
                        yoyo: true,
                        repeat: 5,
                        duration: 40,
                        onComplete: () => { buyButtonBg.x = 0; }
                    });

                    // Show red warning text above the button
                    const warningText = this.scene.add.text(
                        buyButtonX + buyButtonWidth / 2,
                        buyButtonY - 18,
                        "Not enough coins!",
                        {
                            fontSize: "15px",
                            fill: "#FF4444",
                            fontFamily: "Arial",
                            fontStyle: "bold",
                            stroke: "#000000",
                            strokeThickness: 2
                        }
                    ).setOrigin(0.5);

                    buyDynamicDetailContainer.add(warningText);

                    this.scene.tweens.add({
                        targets: warningText,
                        y: warningText.y - 20,
                        alpha: 0,
                        duration: 900,
                        ease: 'Power2',
                        onComplete: () => warningText.destroy()
                    });
                }
            });

                // --- Add hover effect for coin loss popup ---
                buyButtonBg.on('pointerover', () => {
                    this.coinGainPopup.setText(`-${item.price}`);
                    this.coinGainPopup.setStyle({ fill: '#FF4444' }); // Red color
                    this.coinGainPopup.setVisible(true);
                });
                buyButtonBg.on('pointerout', () => {
                    this.coinGainPopup.setVisible(false);
                });

                buyDynamicDetailContainer.add([nameText, itemImage, descriptionText, priceText, buyButtonBg, buyButtonText]);
            } else {
                // Default message
                const noSelectText = this.scene.add.text(
                    buyRightPanelWidth / 2,
                    buyRightPanelHeight / 2,
                    "No item selected",
                    {
                        fontSize: '20px',
                        fill: '#FFD700',
                        fontFamily: 'Arial',
                        fontStyle: 'bold',
                        align: 'center',
                        wordWrap: { width: buyRightPanelWidth - 20, useAdvancedWrap: true }
                    }
                ).setOrigin(0.5);
                buyDynamicDetailContainer.add(noSelectText);
            }
            buyRightDetail.bringToTop(buyDynamicDetailContainer);
        };

        buyContent.add([buyGridContainer, buyRightDetail]);
        updateBuyRightDetail(null);

        // Improved coin gain popup style
        this.coinGainPopup = this.scene.add.text(
            coinText.x + 75, 
            coinText.y - 17, 
            '', 
            {
                fontSize: '18px',
                fill: '#00FF00',
                fontFamily: 'Verdana',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true }
            }
        ).setOrigin(0, 0);
        this.coinGainPopup.setVisible(false);
        this.shopContainer.add(this.coinGainPopup);

        
        contentBox.lineStyle(3, 0xffffff, 0.8);
        contentBox.strokeRoundedRect(0, 0, boxWidth, boxHeight, 10);

        
        contentBoxContainer.setDepth(9);




        tabContainer.add([tabBuy, tabSell, tabLucky]);

        const sellContent = this.scene.add.container(10, 10);
        sellContent.setSize(boxWidth, boxHeight);

        // Dimensions for the grid area on the left
        const gridAreaWidth = 300; // Left panel width
        const gridAreaHeight = boxHeight - 40; // Adjusted height to fit better
        const slotGap = 10; // Gap between slots
        const cols = 5; // Number of columns
        const rows = 3; // Number of rows
        const slotSize = Math.floor((gridAreaWidth - (cols + 1) * slotGap) / cols); // Dynamically calculate slot size
        const gridX = 0;
        const gridY = 0;

        // Left Panel: Inventory Grid (sells items)
        const gridContainer = this.scene.add.container(gridX, gridY);

        // Draw a background for the grid that matches the shop color theme
        const gridBg = this.scene.add.graphics();
        gridBg.fillStyle(0x222222, 0.7);
        gridBg.fillRoundedRect(0, 0, gridAreaWidth, gridAreaHeight+20, 10);
        gridContainer.add(gridBg);
        

        // Vertical Barrier (thin dark grey line, not touching top and bottom)
        const barrierHeight = gridAreaHeight - 40; // Reduced height to not touch top and bottom
        const barrier = this.scene.add.rectangle(gridAreaWidth + 15, 100, 2, barrierHeight, 0x333333);

        // Right Panel: Item Detail
        const rightPanelX = gridAreaWidth + 30;
        const rightPanelWidth = boxWidth - rightPanelX - 20;
        const rightPanelHeight = gridAreaHeight+20;
        const rightDetail = this.scene.add.container(rightPanelX, 0);

        const dynamicDetailContainer = this.scene.add.container(0, 0);
        rightDetail.add(dynamicDetailContainer);

        const detailBg = this.scene.add.graphics();
        detailBg.fillStyle(0x222222, 0.7);
        detailBg.fillRoundedRect(0, 0, rightPanelWidth, rightPanelHeight, 10);
        rightDetail.add(detailBg);

        // Add both panels and the barrier to sellContent
        sellContent.add([gridContainer, barrier, rightDetail]);

        // Function to update the right detail panel based on the hovered item
        const updateSellRightDetail = (item) => {
            // Clear dynamic container so static elements remain intact.
            dynamicDetailContainer.removeAll(true);
        
            if (item) {
                // Get description from LootManager.
                const description = this.playerManager.lootManager.getDescription(item.key) || "No description available.";
                // Reserve space for the slider.
                const sliderReservedHeight = 40; // space reserved at bottom
                const contentHeight = rightPanelHeight - sliderReservedHeight;
        
                // Create item title.
                const itemName = this.itemManager.getItem(item.key)?.name || item.key;
                    const nameText = this.scene.add.text(rightPanelWidth / 2, 10, itemName, {
                    fontSize: '16px',
                    fill: '#FFD700',
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    align: 'center',
                    wordWrap: { width: rightPanelWidth - 20 }
                }).setOrigin(0.5, 0);
        
                // NEW: Create coin gain text below the title.
                // Retrieve the price from LootManager.
                const price = this.playerManager.lootManager.getPrice(item.key);
                // Set initial sell quantity to 0 (or use currentSellValue if already set).
                const initialSellQuantity = currentSellValue || 0;
        
                // Create item image.
                const itemImage = this.scene.add.image(rightPanelWidth / 2, 40, item.key)
                    .setDisplaySize(60, 60)
                    .setOrigin(0.5, 0);
        
                // Create description text.
                const descriptionText = this.scene.add.text(rightPanelWidth / 2, 110, description, {
                    fontSize: '12px',
                    fill: '#FFFFFF',
                    fontFamily: 'Arial',
                    align: 'center',
                    wordWrap: { width: rightPanelWidth - 20 }
                }).setOrigin(0.5, 0);

                // Adjust description text size if needed.
                const descriptionMaxHeight = contentHeight - (itemImage.y + itemImage.displayHeight + 10);
                if (descriptionText.height > descriptionMaxHeight) {
                    descriptionText.setFontSize(10);
                }
        
                // Add texts to the dynamic container.
                dynamicDetailContainer.add([nameText, itemImage, descriptionText]);
        
                // Define slider track dimensions.
                const sliderTrackWidth = rightPanelWidth - 40; // leave side margins
                const sliderTrackX = rightPanelWidth / 2 - sliderTrackWidth / 2;
                const sliderTrackY = rightPanelHeight - sliderReservedHeight + 10;
        
                // Create the slider track.
                const sliderTrack = this.scene.add.rectangle(
                    sliderTrackX,
                    sliderTrackY,
                    sliderTrackWidth,
                    4,             // increased thickness for a nicer look
                    0x222222       // dark background matching the shop theme
                ).setOrigin(0, 0.5);
        
                // Create the slider knob.
                const knobWidth = 12;
                const knobHeight = 24;
                const knob = this.scene.add.rectangle(
                    sliderTrackX,
                    sliderTrackY,
                    knobWidth,
                    knobHeight,
                    0xffd700       // gold color
                ).setOrigin(0.5, 0.5);
                knob.setInteractive();
                this.scene.input.setDraggable(knob);
        
                // Create a numeric label below the slider track.
                const sliderValueText = this.scene.add.text(
                    rightPanelWidth / 2,
                    sliderTrackY - 30,
                    `${currentSellValue}`,
                    { fontSize: '14px', fill: '#ffffff', fontFamily: 'Arial', align: 'center' }
                ).setOrigin(0.5, 0);
        
                // Assume maxValue is determined by the item count (default to 1)
                const maxValue = item.count || 1;
        
                // Draw incremental tick marks on the slider track.
                const tickCount = 5; // number of ticks (including endpoints)
                for (let i = 0; i < tickCount; i++) {
                    const tickX = sliderTrackX + i * (sliderTrackWidth / (tickCount - 1));
                    const tickHeight = (i === 0 || i === tickCount - 1) ? 10 : 6;
                    const tick = this.scene.add.rectangle(
                        tickX,
                        sliderTrackY,
                        2,   // tick width
                        tickHeight,
                        0xFFD700       // using gold for tick marks
                    ).setOrigin(0.5, 0.5);
                    dynamicDetailContainer.add(tick);
                }
        
                // Inside updateSellRightDetail, after setting up sliderTrack and knob:
                knob.on('drag', (pointer, dragX) => {
                    dragX = Phaser.Math.Clamp(dragX, sliderTrackX, sliderTrackX + sliderTrackWidth);
                    knob.x = dragX;
                    const value = Math.round(((dragX - sliderTrackX) / sliderTrackWidth) * maxValue);
                    currentSellValue = value;
                    sliderValueText.setText(value);
                    // Update the global coin gain popup live.
                    if (value > 0) {
                        this.coinGainPopup.setText(`+${price * value}`);
                        this.coinGainPopup.setStyle({ fill: '#00FF00' });
                        this.coinGainPopup.setVisible(true);
                    } else {
                        this.coinGainPopup.setVisible(false);
                    }
                    updateSellButtonVisibility(value); // Update button visibility.
                });

                knob.on('dragend', () => {
                    const percent = (knob.x - sliderTrackX) / sliderTrackWidth;
                    const value = Math.round(percent * maxValue);
                    currentSellValue = value;
                    const newX = sliderTrackX + (value / maxValue) * sliderTrackWidth;
                    knob.x = newX;
                    sliderValueText.setText(value);
                    if (value > 0) {
                        this.coinGainPopup.setText(`+${price * value}`);
                        this.coinGainPopup.setVisible(true);
                    } else {
                        this.coinGainPopup.setVisible(false);
                    }
                    updateSellButtonVisibility(value); // Update button visibility.
                });
        
                // Add slider elements to the dynamic detail container.
                dynamicDetailContainer.add([sliderTrack, knob, sliderValueText]);

                // Create a "Sell" button below the slider
                const sellButtonWidth = 100;
                const sellButtonHeight = 30;
                const sellButtonX = rightPanelWidth / 2 - sellButtonWidth / 2;
                const sellButtonY = sliderTrackY + 27; // Position below the slider

                // Button background
                const sellButtonBg = this.scene.add.graphics();
                sellButtonBg.fillStyle(0xFFD700, 1); // Gold color
                sellButtonBg.fillRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                sellButtonBg.lineStyle(2, 0xFFFFFF, 1); // White border
                sellButtonBg.strokeRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                sellButtonBg.setInteractive(new Phaser.Geom.Rectangle(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight), Phaser.Geom.Rectangle.Contains);
                sellButtonBg.setVisible(false); // Initially hidden

                // Button text
                const sellButtonText = this.scene.add.text(
                    sellButtonX + sellButtonWidth / 2,
                    sellButtonY + sellButtonHeight / 2,
                    "Sell",
                    {
                        fontSize: "16px",
                        fill: "#000000", // Black text
                        fontFamily: "Arial",
                        fontStyle: "bold",
                        align: "center"
                    }
                ).setOrigin(0.5, 0.5);
                sellButtonText.setVisible(false); // Initially hidden

                // Add the button elements to the dynamic detail container
                dynamicDetailContainer.add([sellButtonBg, sellButtonText]);

                // Update button visibility based on slider value
                const updateSellButtonVisibility = (value) => {
                    const isVisible = value > 0;
                    sellButtonBg.setVisible(isVisible);
                    sellButtonText.setVisible(isVisible);
                };

                // Add hover effect
                sellButtonBg.on('pointerover', () => {
                    sellButtonBg.clear();
                    sellButtonBg.fillStyle(0xFFFACD, 1); // Lighter gold color on hover
                    sellButtonBg.fillRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                    sellButtonBg.lineStyle(2, 0xFFFFFF, 1); // White border
                    sellButtonBg.strokeRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                });

                // Remove hover effect
                sellButtonBg.on('pointerout', () => {
                    sellButtonBg.clear();
                    sellButtonBg.fillStyle(0xFFD700, 1); // Original gold color
                    sellButtonBg.fillRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                    sellButtonBg.lineStyle(2, 0xFFFFFF, 1); // White border
                    sellButtonBg.strokeRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                });

                // Add click effect and selling logic
                sellButtonBg.on('pointerdown', () => {
                    console.log("Sell button clicked. currentSellValue:", currentSellValue, "selected item:", item);
                    
                    // Click visual effect
                    sellButtonBg.clear();
                    sellButtonBg.fillStyle(0xFFC107, 1);
                    sellButtonBg.fillRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                    sellButtonBg.lineStyle(2, 0xFFFFFF, 1);
                    sellButtonBg.strokeRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                    
                    // Reset to default after a short delay
                    this.scene.time.delayedCall(100, () => {
                        sellButtonBg.clear();
                        sellButtonBg.fillStyle(0xFFD700, 1);
                        sellButtonBg.fillRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                        sellButtonBg.lineStyle(2, 0xFFFFFF, 1);
                        sellButtonBg.strokeRoundedRect(sellButtonX, sellButtonY, sellButtonWidth, sellButtonHeight, 5);
                    });
                    
                    // Only process if there is a sell value and an item is selected.
                    if (currentSellValue > 0 && item) {
                        // 1. Update player's coins using LootManager price and sell quantity.
                        const price = this.playerManager.lootManager.getPrice(item.key);
                        const totalSaleValue = price * currentSellValue;
                        this.playerManager.stats.coins += totalSaleValue;
                        console.log("Player earned", totalSaleValue, "coins from sale.");

                        // 2. Update localStorage for player's persistent stats.
                        const persistentStats = {
                            coins: this.playerManager.stats.coins,
                            attack: this.playerManager.stats.attack,
                            speed: this.playerManager.stats.speed,
                            luck: this.playerManager.stats.luck,
                            agility: this.playerManager.stats.agility
                        };
                        localStorage.setItem('playerPersistentStats', JSON.stringify(persistentStats));
                        
                        // 3. Animate and update the coin text in the shop UI.
                        // Assume coinText is the text element in the shop that shows the coin count.
                        coinText.setText(`Coins: ${this.playerManager.stats.coins}`);
                        this.scene.tweens.add({
                            targets: coinText,
                            scale: { from: 1.2, to: 1 },
                            duration: 300,
                            ease: 'Power2'
                        });

                        // 4. Also update the coin display in the player's inventory coin pouch if available.
                        if (this.playerManager.coinText) {
                            this.playerManager.coinText.setText(`Coins: ${this.playerManager.stats.coins}`);
                            this.scene.tweens.add({
                                targets: this.playerManager.coinText,
                                scale: { from: 1.2, to: 1 },
                                duration: 300,
                                ease: 'Power2'
                            });
                        }

                        // 5. Proceed with removal of sold items from inventory.
                        console.log("Calling removeInventoryItem for", item.key, "with amount", currentSellValue);
                        this.playerManager.removeInventoryItem(item.key, currentSellValue);
                        
                        // Look up the item again.
                        let updatedItem = this.playerManager.inventory.find(invItem => {
                            if (typeof invItem === "object") return invItem.key === item.key;
                            else return invItem === item.key;
                        });
                        console.log("Updated item after removal:", updatedItem);
                        
                        // If no such item exists or its count is zero, unpin the item.
                        if (!updatedItem || (updatedItem.count !== undefined && updatedItem.count === 0)) {
                            console.log("Item completely removed from inventory.");
                            pinnedItem = null;
                            updateSellRightDetail(null);
                        } else {
                            updateSellRightDetail(updatedItem);
                        }
                        
                        console.log("Updating sell grid...");
                        updateSellGrid();
                        
                        if (this.playerManager.updateInventoryDisplay) {
                            console.log("Updating inventory display...");
                            this.playerManager.updateInventoryDisplay();
                        }

                        // Save the initial y position (set when the popup was created)
                        const initialPopupY = coinText.y - 17;

                        // Animate the coin gain popup: move up and fade out
                        this.scene.tweens.add({
                            targets: this.coinGainPopup,
                            y: initialPopupY - 20, // move 20 pixels up
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => {
                                this.coinGainPopup.setVisible(false);
                                // Reset for future use:
                                this.coinGainPopup.alpha = 1;
                                this.coinGainPopup.y = initialPopupY;
                            }
                        });
                    }
                });

            // Note: When switching items (or pinning a new one), updateSellRightDetail() is called,
                // so the coin gain text is re-created and reflects the new item's price.
            } else {
                // If no item is selected, show the default message.
                const noSelectText = this.scene.add.text(
                    rightPanelWidth / 2,
                    rightPanelHeight / 2,
                    "No item selected",
                    {
                        fontSize: '20px',
                        fill: '#FFD700',
                        fontFamily: 'Arial',
                        fontStyle: 'bold',
                        align: 'center',
                        wordWrap: { width: rightPanelWidth - 20, useAdvancedWrap: true }
                    }
                ).setOrigin(0.5);
                dynamicDetailContainer.add(noSelectText);
            }
        
            // Ensure the dynamic detail container is on top.
            rightDetail.bringToTop(dynamicDetailContainer);
        };

        // Function to update the sell grid
        const updateSellGrid = () => {
            // Completely remove (and destroy) previous children from gridContainer.
            gridContainer.removeAll(true);
            
            // Dimensions for the grid area on the left
            const gridAreaWidth = 300; // Left panel width
            const slotGap = 10; // Gap between slots
            const cols = 5; // Number of columns
            const rows = 3; // Number of rows
            const slotSize = Math.floor((gridAreaWidth - (cols + 1) * slotGap) / cols); // Dynamically calculate slot size

            // Create a new gridBg
            const newGridBg = this.scene.add.graphics();
            newGridBg.fillStyle(0x222222, 0.7);
            newGridBg.fillRoundedRect(0, 0, gridAreaWidth, gridAreaHeight + 20, 10);
            gridContainer.add(newGridBg);
            
            // Loop to add horizontal lines for every slot in a grid of 5 columns (cols) and 3 rows.
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const slotX = slotGap + col * (slotSize + slotGap);
                    const slotY = slotGap + row * (slotSize + slotGap);
                    const horizontalLine = this.scene.add.rectangle(
                        slotX + slotSize / 2, // Centered horizontally in the slot.
                        slotY + slotSize + 5, // Slightly below the slot.
                        slotSize - 12,        // Slightly shorter than the slot width.
                        2,                    // Thickness of the line.
                        0x333333              // Dark grey color.
                    ).setOrigin(0.5, 0.5);
                    gridContainer.add(horizontalLine);
                }
            }

            // Loop over each slot (using the inventoryData array)
            this.playerManager.inventoryData.forEach((itemData, index) => {
                if (!itemData) return; // Skip empty slots

                const row = Math.floor(index / cols);
                const col = index % cols;
                if (row >= rows) return;  // Limit grid to defined rows
                const slotX = slotGap + col * (slotSize + slotGap);
                const slotY = slotGap + row * (slotSize + slotGap);

                // Create the item image centered in the slot
                const itemImage = this.scene.add.image(
                    slotX + slotSize / 2,
                    slotY + slotSize / 2,
                    itemData.key
                )
                    .setDisplaySize(slotSize - 10, slotSize - 10)
                    .setOrigin(0.5);
                itemImage.slotIndex = index;
                itemImage.setInteractive({ draggable: true });
                
                // Add pointer events (using updateSellRightDetail)
                itemImage.on("pointerover", (pointer) => {
                    if (!pinnedItem) {
                        updateSellRightDetail(itemData);
                    } else if (pinnedItem.key !== itemData.key) {
                        pinnedItem = null;
                        updateSellRightDetail(itemData);
                    }
                });
                itemImage.on("pointerdown", () => {
                    pinnedItem = itemData;
                    updateSellRightDetail(itemData);
                });
                itemImage.on("pointerout", () => {
                    if (!pinnedItem) {
                        updateSellRightDetail(null);
                    }
                });

                gridContainer.add(itemImage);
                
                // If count > 1, display the count
                if (itemData.count > 1) {
                    const countText = this.scene.add.text(
                        slotX + slotSize - 5,
                        slotY + 5,
                        `${itemData.count}`,
                        {
                            fontSize: "16px",
                            fill: "#ffffff"
                        }
                    ).setOrigin(1, 0);
                    gridContainer.add(countText);
                }
            });
        };

        // Finally, add sellContent to the shop container:
        this.shopContainer.add(sellContent);

        const luckyContent = this.scene.add.container(10, 10);
        
        // --- Define a helper function to load the gambling buttons ---
        const loadGamblingButtons = () => {
            // Clear any previous content from luckyContent
            luckyContent.removeAll(true);
            
            const gameLabels = ['High Low', 'Blackjack', 'Poker', 'War'];
            const gameButtonWidth = 114; 
            const gameButtonHeight = 80;
            const gameGap = 15;

            gameLabels.forEach((label, index) => {
                const x = index * (gameButtonWidth + gameGap);
                const y = 125; // row where buttons are placed

                // Calculate dimensions for the vertical decorative rectangle
                const verticalRectWidth = gameButtonWidth - 40;  // Adjust width as needed
                const verticalRectHeight = 110;                  // Adjust height as needed
                const verticalRectX = (gameButtonWidth - verticalRectWidth) / 2;
                const verticalRectY = -verticalRectHeight - 10;    // gap above the button

                let verticalRect;
                if (index === 0) {
                    // Create the transparent rectangle.
                    const rectGraphics = this.scene.add.graphics();
                    rectGraphics.fillStyle(0x222222, 0.7);
                    rectGraphics.fillRoundedRect(verticalRectX, verticalRectY, verticalRectWidth, verticalRectHeight, 5);
                    
                    // Create the pink-card image, centered within the rectangle.
                    const image = this.scene.add.image(
                        verticalRectX + verticalRectWidth / 2, 
                       (verticalRectY + verticalRectHeight / 2)+2, 
                        'pink-card'
                    ).setOrigin(0.5);
                    // Set the display size as desired.
                    image.setDisplaySize(1700, 1000);

                    // Combine the transparent rectangle and image into a container.
                    verticalRect = this.scene.add.container(0, 0, [rectGraphics, image]);
                } else if (index === 1) {

                    // Create the transparent rectangle.
                    const rectGraphics = this.scene.add.graphics();
                    rectGraphics.fillStyle(0x222222, 0.7);
                    rectGraphics.fillRoundedRect(verticalRectX, verticalRectY, verticalRectWidth, verticalRectHeight, 5);
                    
                    // Create the pink-card image, centered within the rectangle.
                    const image = this.scene.add.image(
                        verticalRectX + verticalRectWidth / 2, 
                       (verticalRectY + verticalRectHeight / 2)+2, 
                        'orange-card'
                    ).setOrigin(0.5);
                    // Set the display size as desired.
                    image.setDisplaySize(1700, 1000);

                    // Combine the transparent rectangle and image into a container.
                    verticalRect = this.scene.add.container(0, 0, [rectGraphics, image]);
                } else if (index === 2) {

                    // Create the transparent rectangle.
                    const rectGraphics = this.scene.add.graphics();
                    rectGraphics.fillStyle(0x222222, 0.7);
                    rectGraphics.fillRoundedRect(verticalRectX, verticalRectY, verticalRectWidth, verticalRectHeight, 5);
                    
                    // Create the pink-card image, centered within the rectangle.
                    const image = this.scene.add.image(
                        verticalRectX + verticalRectWidth / 2, 
                       (verticalRectY + verticalRectHeight / 2)+2, 
                        'blue-card'
                    ).setOrigin(0.5);
                    // Set the display size as desired.
                    image.setDisplaySize(1700, 1000);

                    // Combine the transparent rectangle and image into a container.
                    verticalRect = this.scene.add.container(0, 0, [rectGraphics, image]);
                } else if (index === 3) {

                    // Create the transparent rectangle.
                    const rectGraphics = this.scene.add.graphics();
                    rectGraphics.fillStyle(0x222222, 0.7);
                    rectGraphics.fillRoundedRect(verticalRectX, verticalRectY, verticalRectWidth, verticalRectHeight, 5);
                    
                    // Create the pink-card image, centered within the rectangle.
                    const image = this.scene.add.image(
                        verticalRectX + verticalRectWidth / 2, 
                       (verticalRectY + verticalRectHeight / 2)+2, 
                        'black-card'
                    ).setOrigin(0.5);
                    // Set the display size as desired.
                    image.setDisplaySize(1700, 1000);

                    // Combine the transparent rectangle and image into a container.
                    verticalRect = this.scene.add.container(0, 0, [rectGraphics, image]);
                }

                // Create button background.
                const gameButtonBg = this.scene.add.graphics();
                gameButtonBg.fillStyle(0x333333, 0.8);
                gameButtonBg.fillRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);
                gameButtonBg.lineStyle(2, 0xffffff, 1);
                gameButtonBg.strokeRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);
                // Make the background interactive.
                gameButtonBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, gameButtonWidth, gameButtonHeight), Phaser.Geom.Rectangle.Contains);

                // Create button text matching the shop text style.
                const gameButtonText = this.scene.add.text(gameButtonWidth / 2, gameButtonHeight / 2, label, {
                    fontSize: '18px',
                    fill: '#FFCE00',
                    fontFamily: 'Verdana',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2 }
                }).setOrigin(0.5);

                // Create container with vertical rectangle, then button background and text.
                const gameButton = this.scene.add.container(x, y, [verticalRect, gameButtonBg, gameButtonText]);
                gameButton.setSize(gameButtonWidth, gameButtonHeight);

                // Set a flag to track hover state.
                gameButtonBg.isHovered = false;

                // Attach interactive events directly to the background.
                gameButtonBg.on('pointerover', () => {
                    gameButtonBg.isHovered = true;
                    gameButtonBg.clear();
                    gameButtonBg.fillStyle(0x555555, 0.9);
                    gameButtonBg.fillRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);
                    gameButtonBg.lineStyle(2, 0xffffff, 1);
                    gameButtonBg.strokeRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);
                });

                gameButtonBg.on('pointerout', () => {
                    gameButtonBg.isHovered = false;
                    gameButtonBg.clear();
                    gameButtonBg.fillStyle(0x333333, 0.8);
                    gameButtonBg.fillRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);
                    gameButtonBg.lineStyle(2, 0xffffff, 1);
                    gameButtonBg.strokeRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);
                });

                // When clicked, clear all buttons and show a placeholder for the selected game.
                gameButtonBg.on('pointerdown', () => {
                    // Simulate press effect.
                    gameButtonBg.clear();
                    gameButtonBg.fillStyle(0xffffff, 1);
                    gameButtonBg.fillRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);
                    gameButtonBg.lineStyle(2, 0xffffff, 1);
                    gameButtonBg.strokeRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);

                    this.scene.time.delayedCall(100, () => {
                        // Revert drawing based on hover state.
                        gameButtonBg.clear();
                        if (gameButtonBg.isHovered) {
                            gameButtonBg.fillStyle(0x555555, 0.9);
                        } else {
                            gameButtonBg.fillStyle(0x333333, 0.8);
                        }
                        gameButtonBg.fillRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);
                        gameButtonBg.lineStyle(2, 0xffffff, 1);
                        gameButtonBg.strokeRoundedRect(0, 0, gameButtonWidth, gameButtonHeight, 10);

                        console.log("Selected game:", label);
                        // Clear all gambling buttons.
                        luckyContent.removeAll(true);
                        // Show placeholder text for the selected game with consistent styling.
                        const placeholderStyle = {
                            fontSize: '20px',
                            fill: '#FFD700',
                            fontFamily: 'Arial',
                            fontStyle: 'bold',
                            stroke: '#000000',
                            strokeThickness: 2,
                            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2 }
                        };
                        const placeholderText = this.scene.add.text(
                            120,
                            5,
                            `Placeholder for ${label}`,
                            placeholderStyle
                        ).setOrigin(0.5);
                        luckyContent.add(placeholderText);
                    });
                });

                luckyContent.add(gameButton);
            });
        };

        // Call the helper function to load the gambling buttons
        loadGamblingButtons();

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

            // Hide the coin gain popup if not on the sell tab
            if (activeContent !== 1 && this.coinGainPopup) {
                this.coinGainPopup.setVisible(false);
            }

            // When Lucky Mug tab is activated, re-load the gambling buttons.
            if (activeContent === 2) {
                luckyContent.setVisible(true);
                loadGamblingButtons();
            } else {
                luckyContent.setVisible(false);
            }
        };

        tabBuy.getAt(0).on('pointerdown', () => setActiveTab(0, 0));
        tabSell.getAt(0).on('pointerdown', () => {
            setActiveTab(1, 1);
            updateSellRightDetail(null);  // Ensure no item is selected initially
        });
        tabLucky.getAt(0).on('pointerdown', () => setActiveTab(2, 2));

        this.shopContainer.add([contentBoxContainer, tabContainer]);

        this.keyE = this.scene.input.keyboard.addKey('E');
        this.keyE.on('down', () => {
            if (this.playerManager.shopOpen) {
                this.closeShop();
            }
        });

        this.playerManager.shopOpen = true;

        // Call updateSellGrid after setting up the sell grid
        updateSellGrid();
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