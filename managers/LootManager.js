export default class LootManager {
    constructor(scene) {
        this.scene = scene;
        // Define the loot table with weighted probabilities, descriptions, and prices.
        // The weights add up to 100 so that the percentages match your plan.
        this.lootTable = [
            // Common (40% total)
            { key: "Weathered Bronze Band", weight: 15, description: "A rugged bronze band, worn with age.", price: 5 },
            { key: "Duskworn Ring", weight: 15, description: "A ring with a mysterious, dark allure.", price: 10 },
            { key: "Carved Bone Loop", weight: 10, description: "An intricately carved bone loop.", price: 15 },
            // Uncommon (30% total)
            { key: "Moonlit Band", weight: 10, description: "A silver ring that shimmers under the moonlight.", price: 20 },
            { key: "Spiral-Engraved Ring", weight: 10, description: "A ring with elegant spiral engravings.", price: 25 },
            { key: "Ember-Touched Band", weight: 10, description: "A ring aglow with ember-like warmth.", price: 30 },
            // Rare (20% total)
            { key: "Azure Jewel Band", weight: 10, description: "A ring set with a bright azure jewel.", price: 40 },
            { key: "Verdant Inlay Ring", weight: 5, description: "A ring featuring a rich, green inlay.", price: 50 },
            { key: "Gilded Topaz Ring", weight: 5, description: "A lavish ring adorned with a topaz gem.", price: 60 },
            // Very Rare (10% total)
            { key: "Crimson Crest Ring", weight: 10, description: "A regal ring decorated with a crimson crest.", price: 80 }
        ];
    }

    chooseLoot() {
        const totalWeight = this.lootTable.reduce((sum, loot) => sum + loot.weight, 0);
        let rand = Phaser.Math.Between(1, totalWeight);
        for (let loot of this.lootTable) {
            if (rand <= loot.weight) {
                return loot;
            }
            rand -= loot.weight;
        }
        return null;
    }

    getLootDrops(numDrops) {
        let drops = [];
        for (let i = 0; i < numDrops; i++) {
            const loot = this.chooseLoot();
            if (loot) drops.push(loot);
        }
        return drops;
    }

    getDescription(itemKey) {
        const item = this.lootTable.find(loot => loot.key === itemKey);
        return item ? item.description : "No description available.";
    }
    
    // New built-in function: Returns the price for a given loot item.
    getPrice(itemKey) {
        const item = this.lootTable.find(loot => loot.key === itemKey);
        return item ? item.price : 0;
    }

    // New built-in function: Returns the full loot object for a given item key.
    getLootItem(itemKey) {
        return this.lootTable.find(loot => loot.key === itemKey) || null;
    }
    
    // New built-in function: Returns the entire loot table.
    getAllLoot() {
        return this.lootTable;
    }
}