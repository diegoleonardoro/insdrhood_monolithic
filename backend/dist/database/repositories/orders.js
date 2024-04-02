"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersRepository = void 0;
const index_1 = require("../index");
const emailVerification_1 = require("../../services/emailVerification");
class OrdersRepository {
    constructor() {
        this.collectionName = 'orders';
        this.db = (0, index_1.connectToDatabase)();
    }
    ;
    async saveToDb(orderInfo) {
        const db = await this.db;
        const ordersCollection = db.collection(this.collectionName);
        const newOrder = await ordersCollection.insertOne(orderInfo);
        const orderId = newOrder.insertedId;
        return { orderId };
    }
    async sendOrderConfirmationEmail_(orderInfo) {
        console.log('orderInfo from sendConfirmation email ', orderInfo);
        (0, emailVerification_1.sendOrderConfirmationEmail)(orderInfo);
    }
}
exports.OrdersRepository = OrdersRepository;
//# sourceMappingURL=orders.js.map