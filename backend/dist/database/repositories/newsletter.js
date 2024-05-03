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
const uuid_1 = require("uuid"); // For generating UUIDs
class NewsletterRepository {
    constructor() {
        this.collectionName = 'newsletter';
        this.db = (0, index_1.connectToDatabase)();
    }
    ;
    async fetchSubscribers() {
        const db = await this.db;
        const emailsCollection = db.collection(this.collectionName);
        const now = new Date();
        const query = {
            $or: [
                { lastSent: { $exists: false } },
                {
                    $expr: {
                        $gte: [
                            { $subtract: [now, "$lastSent"] },
                            { $multiply: [{ $toDecimal: "$frequency" }, 518400000] } // Ensure frequency is a number
                        ]
                    }
                }
            ]
        };
        const newslettersToSend = await emailsCollection.find(query).toArray();
        return newslettersToSend;
    }
    ;
    async sendEmails(subscribers) {
        console.log("process.env.SENDGRID_API_KEY!", process.env.SENDGRID_API_KEY);
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        if (subscribers.length === 0) {
            return { message: "No subscribers.", statusCode: 404 };
        }
        const msg = {
            from: { name: "Insider Hood", email: "admin@insiderhood.com" },
            personalizations: subscribers.map(subscriber => ({
                to: [{ email: subscriber.email }],
                dynamic_template_data: {
                    name: subscriber.name,
                    //   unsubscribeButton: `<a href="${process.env.BASE_URL?.split(" ")[0]}/newsletterpreferences?user_id=${subscriber.identifier}"
                    //   style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px;">
                    //   Click Here
                    // </a>`
                }
            })),
            templateId: "d-beef468c69d64cfdbfac6b4e03546e08"
        };
        try {
            await mail_1.default.send(msg);
            const ids = subscribers.map(sub => sub._id);
            await this.updateLastSent(ids);
            return { message: "Newsletter Sent", statusCode: 200 };
        }
        catch (error) {
            console.error("Error sending email: ", error);
            return { message: "Failed to send newsletter", statusCode: 400 };
        }
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
    async sendNewsLetter() {
        try {
            const subscribers = await this.fetchSubscribers(); //data.frequency
            console.log('subscribersss', subscribers);
            return ({ message: '', statusCode: 2 });
            // return await this.sendEmails(subscribers);
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
    async updateUsers(data) {
        const db = await this.db;
        const emailsCollection = db.collection(this.collectionName);
        if (!data.identifier) {
            const allUsersCursor = emailsCollection.find({});
            const allUsers = await allUsersCursor.toArray();
            for (const doc of allUsers) {
                const updateResult = await emailsCollection.updateOne({ _id: doc._id }, { $set: { identifier: (0, uuid_1.v4)() } });
                console.log(updateResult);
            }
            return { message: `Updated documents with UUIDs`, statusCode: 200 };
        }
        else {
            // Update specific document by identifier
            const updateResult = await emailsCollection.updateOne({ identifier: data.identifier }, { $set: data.updates });
            if (updateResult.matchedCount === 0) {
                return { message: 'No document found with the provided identifier', statusCode: 200 };
            }
            else {
                return { message: 'Document updated successfully', statusCode: 200 };
            }
        }
    }
    ;
    async getUserInfo(data) {
        const db = await this.db;
        const emailsCollection = db.collection(this.collectionName);
        const { identifier } = data;
        const existingUser = await emailsCollection.findOne({ identifier });
        if (!existingUser) {
            throw new bad_request_error_1.BadRequestError("No user found");
        }
        ;
        return ({ user: existingUser, statusCode: 200 });
    }
}
exports.NewsletterRepository = NewsletterRepository;
//# sourceMappingURL=newsletter.js.map