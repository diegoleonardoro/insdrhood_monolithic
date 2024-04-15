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
class NewsletterRepository {
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
    async sendNewsLetter(data) {
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        const db = await this.db;
        const { frequency } = data;
        const emailsCollection = db.collection(this.collectionName);
        console.log("Querying frequency:", frequency); // Check the value of frequency
        try {
            const subscribersDocuments = await emailsCollection.find({ frequency: frequency }, { projection: { email: 1, _id: 0 } }).toArray();
            // Extract the email addresses from the documents
            const subscribers = subscribersDocuments.map(doc => doc.email);
            if (subscribers.length === 0) {
                return { message: `No subscribers.`, statusCode: 500 };
            }
            else {
                console.log("subscribers", subscribers);
                const msg = {
                    to: subscribers,
                    from: {
                        name: "Inisider Hood",
                        email: "admin@insiderhood.com"
                    },
                    dynamic_template_data: {
                        name: "Diego"
                    },
                    templateId: "d-007c132db5d3481996d2e3720cb9fdce" // Corrected from 'templageId' to 'templateId'
                };
                await mail_1.default.send(msg);
                return { message: "Newsletter Sent", statusCode: 200 };
            }
            ;
        }
        catch (error) {
            console.error("Error retrieving subscribers:", error); // Catch and log any errors during the query
            return { message: `Failed to send newsletter.`, statusCode: 500 };
        }
    }
}
exports.NewsletterRepository = NewsletterRepository;
//# sourceMappingURL=newsletter.js.map