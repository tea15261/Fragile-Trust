export default class ItemManager {
    constructor() {
        // All items in the game (shop, loot, etc.)
        this.items = [
            // Example: Health Potion (shop item)
            {
                key: "healthPotion",
                name: "Health Potion",
                description: "Restores a moderate amount of health.",
                price: 25,
                type: "consumable",
                healthRestore: 50
            },
            {
                key: "manaPotion",
                name: "Mana Potion",
                description: "Restores a moderate amount of mana.",
                price: 30,
                type: "consumable",
                manaRestore: 40
            },
            {
                key: "defensePotion",
                name: "Defense Potion",
                description: "Restores a moderate amount of defense.",
                price: 20,
                type: "consumable",
                defenseRestore: 30
            },
            {
                key: "luckPotion",
                name: "Luck Potion",
                description: "Increases your luck, leading to a variety of benefits.",
                price: 40,
                type: "consumable",
                luckBoost: 20 
            },
            {
            key: "agilityPotion",
            name: "Agility Potion",
            description: "Increases your agility, boosting your dodge chance.",
            price: 25,
            type: "consumable",
            dodgeBoost: 15,
            },
            {
            key: "skillBook",
            name: "Skill Book",
            description: "A rare book required to unlock a new skill. Consumed on use.",
            price: 120,
            type: "consumable",
            unlocksSkill: true
            },
            // Example: Loot items
            { key: "Weathered Bronze Band", name: "Weathered Bronze Band", description: "A rugged bronze band, worn with age.", price: 5, weight: 15, type: "loot" },
            { key: "Duskworn Ring", name: "Duskworn Ring", description: "A ring with a mysterious, dark allure.", price: 10, weight: 15, type: "loot" },
            { key: "Carved Bone Loop", name: "Carved Bone Loop", description: "An intricately carved bone loop.", price: 15, weight: 10, type: "loot" },
            { key: "Moonlit Band", name: "Moonlit Band", description: "A silver ring that shimmers under the moonlight.", price: 20, weight: 10, type: "loot" },
            { key: "Spiral-Engraved Ring", name: "Spiral-Engraved Ring", description: "A ring with elegant spiral engravings.", price: 25, weight: 10, type: "loot" },
            { key: "Ember-Touched Band", name: "Ember-Touched Band", description: "A ring aglow with ember-like warmth.", price: 30, weight: 10, type: "loot" },
            { key: "Azure Jewel Band", name: "Azure Jewel Band", description: "A ring set with a bright azure jewel.", price: 40, weight: 10, type: "loot" },
            { key: "Verdant Inlay Ring", name: "Verdant Inlay Ring", description: "A ring featuring a rich, green inlay.", price: 50, weight: 5, type: "loot" },
            { key: "Gilded Topaz Ring", name: "Gilded Topaz Ring", description: "A lavish ring adorned with a topaz gem.", price: 60, weight: 5, type: "loot" },
            { key: "Crimson Crest Ring", name: "Crimson Crest Ring", description: "A regal ring decorated with a crimson crest.", price: 80, weight: 10, type: "loot" }
            // Add more items here!
        ];
    }

    // Get all items (optionally filter by type)
    getAllItems(type = null) {
        return type ? this.items.filter(item => item.type === type) : this.items;
    }

    // Get a single item by key
    getItem(key) {
        return this.items.find(item => item.key === key) || null;
    }

    // Get all loot items (for loot drops)
    getLootTable() {
        return this.items.filter(item => item.type === "loot");
    }

    // Get all shop items (for shop buy tab)
    getShopItems() {
        return this.items.filter(item => item.type === "consumable" || item.type === "shop");
    }
}