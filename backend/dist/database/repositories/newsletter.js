"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterRepository = void 0;
const index_1 = require("../index");
const bad_request_error_1 = require("../../errors/bad-request-error");
const emailVerification_1 = require("../../services/emailVerification");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const mongodb_1 = require("mongodb");
class NewsletterRepository {
    constructor() {
        this.collectionName = 'newsletter';
        this.db = (0, index_1.connectToDatabase)();
    }
    ;
    async fetchSubscribers(frequency) {
        const db = await this.db;
        const emailsCollection = db.collection(this.collectionName);
        const now = Date.now();
        if (frequency === 'allofthem') {
            return emailsCollection.find({}, { projection: { email: 1, name: 1, frequency: 1, _id: 0 } } // also return the unique identifier 
            ).toArray();
        }
        else {
            const desiredFrequencyInWeeks = parseInt(frequency);
            const desiredFrequencyInMs = desiredFrequencyInWeeks * 7 * 24 * 60 * 60 * 1000;
            return emailsCollection.find({
                frequency: frequency,
                // Check if lastSent is either missing or greater than or equal to desired frequency
                $or: [
                    { lastSent: { $exists: false } },
                    { $expr: { $gte: [{ $subtract: [now, '$lastSent'] }, desiredFrequencyInMs] } }
                ]
            }, { projection: { email: 1, name: 1, frequency: 1, _id: 0 } }).toArray();
        }
        ;
    }
    ;
    async sendEmails(subscribers) {
        if (subscribers.length === 0) {
            return { message: "No subscribers.", statusCode: 404 };
        }
        const msg = {
            from: { name: "Insider Hood", email: "admin@insiderhood.com" },
            personalizations: subscribers.map(subscriber => ({
                to: [{ email: subscriber.email }],
                dynamic_template_data: { name: subscriber.name }
                // add unique identifier for user which will be used to give the user the option to unsubscribe or change the frequency they receive emails
            })),
            templateId: "d-007c132db5d3481996d2e3720cb9fdce"
        };
        await mail_1.default.send(msg);
        const ids = subscribers.map(sub => sub._id);
        await this.updateLastSent(ids);
        return { message: "Newsletter Sent", statusCode: 200 };
    }
    async updateLastSent(ids) {
        const db = await this.db;
        const emailsCollection = db.collection(this.collectionName);
        // Convert string array to ObjectId array
        const objectIds = ids.map(id => new mongodb_1.ObjectId(id));
        await emailsCollection.updateMany({ _id: { $in: objectIds } }, { $set: { lastSent: new Date() } });
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
    ;
    async sendNewsLetter(data) {
        try {
            const subscribers = await this.fetchSubscribers(data.frequency);
            return await this.sendEmails(subscribers);
        }
        catch (error) {
            console.error("Error processing newsletter:", error);
            return { message: "Failed to send newsletter.", statusCode: 500 };
        }
    }
    ;
    async sendReferralEmail(data) {
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        const { email, templateId } = data;
        const db = await this.db;
        const emailsCollection = db.collection(this.collectionName);
        const existingEmail = await emailsCollection.findOne({ email });
        if (existingEmail) {
            throw new bad_request_error_1.BadRequestError("Email in use");
        }
        ;
        try {
            const msg = {
                to: email,
                from: {
                    name: "Insider Hood",
                    email: "admin@insiderhood.com"
                },
                templateId: templateId
            };
            await mail_1.default.send(msg);
            return { message: "Newsletter Sent", statusCode: 200 };
        }
        catch (error) {
            console.error("Error retrieving subscribers:", error); // Catch and log any errors during the query
            return { message: `Failed to send newsletter.`, statusCode: 500 };
        }
    }
}
exports.NewsletterRepository = NewsletterRepository;
//# sourceMappingURL=newsletter.js.map