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
    async subscribeToNewsletter(email) {
        const db = await this.db;
        const emailsCollection = db.collection(this.collectionName);
        const existingEmail = await emailsCollection.findOne({ email });
        if (existingEmail) {
            throw new bad_request_error_1.BadRequestError("Email in use");
        }
        const newEmailData = { email, subscribed: true };
        await emailsCollection.insertOne(newEmailData);
        (0, emailVerification_1.sendNewsLetterEmail)({
            email: email,
            baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : ''
        });
        return { message: "Email subscribed" };
    }
}
exports.NewsletterRepository = NewsletterRepository;
//# sourceMappingURL=newsletter.js.map