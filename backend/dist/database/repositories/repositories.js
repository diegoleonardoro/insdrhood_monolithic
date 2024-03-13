"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeighborhoodRepository = void 0;
const mongodb_1 = require("mongodb");
const index_1 = require("../index");
class NeighborhoodRepository {
    constructor() {
        this.collectionName = 'neighborhoods';
        this.db = (0, index_1.connectToDatabase)();
    }
    async getAll({ page = 1, pageSize = 10 }) {
        const db = await this.db;
        const neighborhoodsCollection = db.collection(this.collectionName);
        const projection = { neighborhoodDescription: 1, user: 1, borough: 1, neighborhood: 1 };
        const skip = (page - 1) * pageSize;
        const total = await neighborhoodsCollection.countDocuments({});
        const neighborhoods = await neighborhoodsCollection
            .find({}, { projection })
            .sort({ neighborhood: 1 })
            .skip(skip)
            .limit(pageSize)
            .toArray();
        return { neighborhoods, total };
    }
    async getOne(neighborhoodId) {
        const db = await this.db;
        const neighborhoodsCollection = db.collection(this.collectionName);
        const neighborhood = await neighborhoodsCollection.findOne({ _id: new mongodb_1.ObjectId(neighborhoodId) });
        return neighborhood;
    }
}
exports.NeighborhoodRepository = NeighborhoodRepository;
//# sourceMappingURL=repositories.js.map