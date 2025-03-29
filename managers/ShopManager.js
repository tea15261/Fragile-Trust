let pinnedItem = null;
let isSliderDragging = false;

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

        // Create the sellContent container
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
            // Clear only the dynamic container so static elements remain intact.
            dynamicDetailContainer.removeAll(true);

            if (item) {
                // Get the description from PlayerManager's itemDescriptions.
                const description = this.playerManager.itemDescriptions[item.key] || "No description available.";

                // Reserve space for our slider.
                const sliderReservedHeight = 40; // space reserved at bottom
                const contentHeight = rightPanelHeight - sliderReservedHeight;

                // Create item title
                const nameText = this.scene.add.text(rightPanelWidth / 2, 10, item.key, {
                    fontSize: '16px',
                    fill: '#FFD700',
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    align: 'center',
                    wordWrap: { width: rightPanelWidth - 20 }
                }).setOrigin(0.5, 0);

                // Create item image
                const itemImage = this.scene.add.image(rightPanelWidth / 2, 40, item.key)
                    .setDisplaySize(60, 60)
                    .setOrigin(0.5, 0);

                // Create description text
                const descriptionText = this.scene.add.text(rightPanelWidth / 2, 110, description, {
                    fontSize: '12px',
                    fill: '#FFFFFF',
                    fontFamily: 'Arial',
                    align: 'center',
                    wordWrap: { width: rightPanelWidth - 20 }
                }).setOrigin(0.5, 0);

                // Dynamically adjust the description's font size if needed.
                const descriptionMaxHeight = contentHeight - (itemImage.y + itemImage.displayHeight + 10);
                if (descriptionText.height > descriptionMaxHeight) {
                    descriptionText.setFontSize(10);
                }

                // Add item details to the dynamic container.
                dynamicDetailContainer.add([nameText, itemImage, descriptionText]);

               

                // Define slider track dimensions
                const sliderTrackWidth = rightPanelWidth - 40; // leave side margins
                const sliderTrackX = rightPanelWidth / 2 - sliderTrackWidth / 2;
                const sliderTrackY = rightPanelHeight - sliderReservedHeight + 10;

                // Create the slider track with a slightly thicker line and shop color
                const sliderTrack = this.scene.add.rectangle(
                    sliderTrackX,
                    sliderTrackY,
                    sliderTrackWidth,
                    4,             // increased thickness for a nicer look
                    0x222222       // dark background matching the shop theme
                ).setOrigin(0, 0.5);

                // Create the slider knob as a vertical rectangle with a gold fill
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

                // Create a numeric label below the slider track
                const sliderValueText = this.scene.add.text(
                    rightPanelWidth / 2,
                    sliderTrackY - 30,
                    "0",
                    { fontSize: '14px', fill: '#ffffff', fontFamily: 'Arial', align: 'center' }
                ).setOrigin(0.5, 0);

                // Use the item count as the slider's maximum value (default to 1 if not present)
                const maxValue = item.count || 1;

                // --- Draw incremental tick marks on the slider track ---
                const tickCount = 5; // number of ticks (including endpoints)
                for (let i = 0; i < tickCount; i++) {
                    const tickX = sliderTrackX + i * (sliderTrackWidth / (tickCount - 1));
                    // Make endpoints slightly taller
                    const tickHeight = (i === 0 || i === tickCount - 1) ? 10 : 6;
                    const tick = this.scene.add.rectangle(
                        tickX,
                        sliderTrackY,
                        2,              // tick width
                        tickHeight,
                        0xFFD700       // using gold for tick marks
                    ).setOrigin(0.5, 0.5);
                    dynamicDetailContainer.add(tick);
                }

                // Drag event for the knob: update its x position and update the numeric value
                knob.on('drag', (pointer, dragX) => {
                    dragX = Phaser.Math.Clamp(dragX, sliderTrackX, sliderTrackX + sliderTrackWidth);
                    knob.x = dragX;
                    const value = Math.round(((dragX - sliderTrackX) / sliderTrackWidth) * maxValue);
                    sliderValueText.setText(value);
                });

                // Snap knob on drag end so it lines up exactly with the nearest increment
                knob.on('dragend', () => {
                    const percent = (knob.x - sliderTrackX) / sliderTrackWidth;
                    const value = Math.round(percent * maxValue);
                    const newX = sliderTrackX + (value / maxValue) * sliderTrackWidth;
                    knob.x = newX;
                    sliderValueText.setText(value);
                });

                // Add the slider elements to the dynamic detail container.
                dynamicDetailContainer.add([sliderTrack, knob, sliderValueText]);
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

            // Bring the dynamic container to the top so it overlays static elements.
            rightDetail.bringToTop(dynamicDetailContainer);
        };

        // Function to update the sell grid
        const updateSellGrid = () => {
            // Remove previous item images without destroying gridBg
            gridContainer.removeAll(false);
            // Re-add the grid background (it was not destroyed)
            gridContainer.add(gridBg);
            
            // Dimensions for the grid area on the left
            const gridAreaWidth = 300; // Left panel width
            const slotGap = 10; // Gap between slots
            const cols = 5; // Number of columns
            const rows = 3; // Number of rows
            const slotSize = Math.floor((gridAreaWidth - (cols + 1) * slotGap) / cols); // Dynamically calculate slot size

            // Loop over each slot (assuming the sell grid uses the same inventory array)
            this.playerManager.inventory.forEach((item, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                if (row >= rows) return; // Limit grid to defined rows
                const slotX = slotGap + col * (slotSize + slotGap);
                const slotY = slotGap + row * (slotSize + slotGap);

                // Always add a small horizontal line underneath the slot
                const horizontalLine = this.scene.add.rectangle(
                    slotX + slotSize / 2, // Centered horizontally
                    slotY + slotSize + 5, // Slightly below the slot
                    slotSize - 12,        // Slightly shorter than the slot width
                    2,                    // Thickness of the line
                    0x333333              // Dark grey color
                ).setOrigin(0.5, 0.5);
                gridContainer.add(horizontalLine);
            });

            // Loop over each slot (assuming the sell grid uses the same inventoryData array)
            this.playerManager.inventoryData.forEach((itemData, index) => {
                if (!itemData) return; // Skip empty slots

                // Calculate cell position using the defined grid layout
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
                
                // Add pointer events (reusing updateSellRightDetail)
                itemImage.on("pointerover", (pointer) => {
                    // If no item is pinned, update details on hover.
                    if (!pinnedItem) {
                        updateSellRightDetail(itemData);
                    }
                    // If a different item is hovered while one is pinned,
                    // unpin the current one and update the details.
                    else if (pinnedItem.key !== itemData.key) {
                        pinnedItem = null;
                        updateSellRightDetail(itemData);
                    }
                });
                itemImage.on("pointerdown", () => {
                    // When the item is clicked, pin it so details remain.
                    pinnedItem = itemData;
                    updateSellRightDetail(itemData);
                });
                itemImage.on("pointerout", () => {
                    // Only clear details if nothing is pinned.
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

        const fillerStyle = { fontSize: '20px', fill: '#FFD700', fontFamily: 'Arial', fontStyle: 'bold' };
        buyContent.add(this.scene.add.text(0, 0, "Placeholder for buying", fillerStyle));
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
        // Example in setActiveTab when Sell tab is activated:
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