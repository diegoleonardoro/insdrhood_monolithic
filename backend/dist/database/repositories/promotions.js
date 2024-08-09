"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsRepository = void 0;
const index_1 = require("../index");
class PromotionsRepository {
    constructor() {
        this.collectionName = 'promotions';
        this.db = (0, index_1.connectToDatabase)();
    }
    async addNewRecords(promotions) {
        const db = await this.db;
        const promotionsCollection = db.collection(this.collectionName);
        const insertResults = await promotionsCollection.insertMany(promotions);
        const insertedPromotions = promotions.map((promotion, index) => ({
            ...promotion,
            _id: insertResults.insertedIds[index],
        }));
        return { insertedData: insertedPromotions };
    }
}
exports.PromotionsRepository = PromotionsRepository;
//# sourceMappingURL=promotions.js.map