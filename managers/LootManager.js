import ItemManager from '/managers/ItemManager.js';

export default class LootManager {
    constructor(scene) {
        this.scene = scene;
        this.itemManager = new ItemManager();
    }

    getLootTable() {
        return this.itemManager.getLootTable();
    }

    chooseLoot() {
        const lootTable = this.getLootTable();
        const totalWeight = lootTable.reduce((sum, loot) => sum + (loot.weight || 1), 0);
        let rand = Phaser.Math.Between(1, totalWeight);
        for (let loot of lootTable) {
            if (rand <= loot.weight) return loot;
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
        const item = this.itemManager.getItem(itemKey);
        return item ? item.description : "No description available.";
    }

    getPrice(itemKey) {
        const item = this.itemManager.getItem(itemKey);
        return item ? item.price : 0;
    }

    getLootItem(itemKey) {
        return this.itemManager.getItem(itemKey);
    }

    getAllLoot() {
        return this.getLootTable();
    }
}