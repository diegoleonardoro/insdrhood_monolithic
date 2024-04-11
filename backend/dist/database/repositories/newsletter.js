"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterRepository = void 0;
const index_1 = require("../index");
const bad_request_error_1 = require("../../errors/bad-request-error");
const emailVerification_1 = require("../../services/emailVerification");
class NewsletterRepository {
    constructor() {
        this.collectionName = 'newsletter';
        this.db = (0, index_1.connectToDatabase)();
    }
    async subscribeToNewsletter(data) {
        const db = await this.db;
        const { email, name = null, newsletter, frequency = 'everyweek' } = data;
        const emailsCollection = db.collection(this.collectionName);
        const existingEmail = await emailsCollection.findOne({ email });
        if (existingEmail) {
            throw new bad_request_error_1.BadRequestError("Email in use");
        }
        ;
        const newData = { email, name, newsletter, frequency };
        await emailsCollection.insertOne(newData);
        (0, emailVerification_1.sendNewsLetterEmail)({
            email: email,
            baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : ''
        });
        return { message: "Email subscribed" };
    }
}
exports.NewsletterRepository = NewsletterRepository;
//# sourceMappingURL=newsletter.js.map