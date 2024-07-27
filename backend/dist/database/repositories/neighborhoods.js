"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeighborhoodRepository = void 0;
const mongodb_1 = require("mongodb");
const index_1 = require("../index");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
const neighborhoodNames_1 = __importDefault(require("./neighborhoodNames"));
class NeighborhoodRepository {
    static saveFormData(body, user) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        this.collectionName = 'neighborhoods';
        this.db = (0, index_1.connectToDatabase)();
        this.s3 = new aws_sdk_1.default.S3({
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            signatureVersion: 'v4',
            region: 'us-east-1',
        });
    }
    async createIndexes() {
        const db = await this.db;
        const neighborhoodsCollection = db.collection(this.collectionName);
        await neighborhoodsCollection.createIndex({ borough: 1 });
        await neighborhoodsCollection.createIndex({ neighborhood: 1 });
        await neighborhoodsCollection.createIndex({ neighborhoodDescription: 1 });
        await neighborhoodsCollection.createIndex({ user: 1 });
    }
    async getAll({ page, pageSize }) {
        const db = await this.db;
        const neighborhoodsCollection = db.collection(this.collectionName);
        const projection = { neighborhoodDescription: 1, user: 1, borough: 1, neighborhood: 1 };
        // Calculate the number of documents to skip
        const skip = (page - 1) * pageSize;
        // Perform the query with pagination
        const neighborhoodsCursor = neighborhoodsCollection
            .find({})
            .project(projection)
            .skip(skip)
            .limit(pageSize)
            .sort({ '_id': 1 });
        const neighborhoods = await neighborhoodsCursor.toArray();
        return { neighborhoods };
    }
    async getOne(neighborhoodId) {
        const db = await this.db;
        const neighborhoodsCollection = db.collection(this.collectionName);
        const neighborhood = await neighborhoodsCollection.findOne({ _id: new mongodb_1.ObjectId(neighborhoodId) });
        return neighborhood;
    }
    async getNeighbohoodData(neighborhood) {
        const db = await this.db;
        const neighborhoodsCollection = db.collection(this.collectionName);
        const neighborhoodCollections = await neighborhoodsCollection.find({ neighborhood: neighborhood }).toArray();
        const neighborhood_summaries = db.collection("neighborhood_summaries");
        const neighborhood_summariesCollections = await neighborhood_summaries.findOne({ neighborhood: neighborhood });
        console.log("neighborhood_summariesCollections", neighborhood_summariesCollections);
        return {
            userInputs: neighborhoodCollections,
            neighborhood_summariesCollections: neighborhood_summariesCollections
        };
    }
    async updateNeighborhoodData(id, updates) {
        const db = await this.db;
        const neighborhoodsCollection = db.collection(this.collectionName);
        let updateQuery = {};
        //Handling updates for nested objects:
        if (!updates.neighborhoodImages && !updates.removeImages && !updates.nightLifeRecommendations && !updates.recommendedFoodTypes) {
            Object.keys(updates).forEach((key) => {
                if (typeof updates[key] === 'object' && updates[key] !== null) {
                    // Iterate over nested object fields
                    for (const nestedKey in updates[key]) {
                        // Use dot notation for nested fields
                        updateQuery.$set = updateQuery.$set || {};
                        updateQuery.$set[`${key}.${nestedKey}`] = updates[key][nestedKey];
                    }
                    // Remove the nested object from updates after processing
                    delete updates[key];
                }
            });
        }
        if (updates.removeImages) {
            updateQuery.$set = { neighborhoodImages: updates.removeImages };
            delete updates.removeImages;
        }
        if (updates.neighborhoodImages) {
            // If updating neighborhoodImages, use $push to add images to the existing array
            updateQuery.$push = { neighborhoodImages: { $each: updates.neighborhoodImages } };
            delete updates.neighborhoodImages; // Remove the property after adding to $push
        }
        if (Object.keys(updates).length > 0) {
            // If there are other updates, use $set to update fields
            updateQuery.$set = { ...updateQuery.$set, ...updates };
        }
        const neighborhood = await neighborhoodsCollection.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, updateQuery, { returnDocument: "after" });
        return neighborhood;
    }
    async saveFormData(formData, user) {
        const db = await this.db;
        const neighborhoodsCollection = db.collection(this.collectionName);
        const newNeighborhood = await neighborhoodsCollection.insertOne({
            ...formData,
            user: user ?
                { id: user._id, name: user.name, email: user.email }
                :
                    { id: '', name: '', email: '' }
        });
        return newNeighborhood;
    }
    async generateUploadUrl(randomUUID) {
        const randomUUID_imageIdentifier = (0, uuid_1.v4)();
        const key = `blog/${randomUUID}/${randomUUID_imageIdentifier}`;
        // Using getSignedUrlPromise which returns a promise
        try {
            const url = await this.s3.getSignedUrlPromise('putObject', {
                Bucket: 'insiderhood',
                Key: key,
            });
            return { key, url };
        }
        catch (err) {
            console.error('Error generating signed URL', err);
            throw err; // Rethrow or handle as needed
        }
    }
    async generateUploadUrlForForm(neighborhood, randomUUID, user) {
        const randomUUID_imageIdentifier = (0, uuid_1.v4)();
        const key = `places/${user ? user.id
            : randomUUID}/${neighborhood}/${randomUUID_imageIdentifier}`;
        // Using getSignedUrlPromise which returns a promise
        try {
            const url = await this.s3.getSignedUrlPromise('putObject', {
                Bucket: 'insiderhood',
                Key: key,
            });
            return { key, url };
        }
        catch (err) {
            console.error('Error generating signed URL', err);
            throw err; // Rethrow or handle as needed
        }
    }
    async verifyemail(emailtoken) {
        const db = await this.db;
        const users = db.collection("users");
        const user = await users.findOne({ emailToken: { $in: [emailtoken] } });
        return {};
    }
    async neighborhoodResponsesCount() {
        const db = await this.db;
        const neighborhoodsCollection = db.collection(this.collectionName);
        const nhoodDocuments = await neighborhoodsCollection.find().toArray();
        const neighborhoodsCount_ = { ...neighborhoodNames_1.default };
        nhoodDocuments.forEach(doc => {
            const neighborhood = doc.neighborhood;
            if (neighborhoodsCount_.hasOwnProperty(neighborhood)) {
                neighborhoodsCount_[neighborhood]++;
            }
        });
        console.log('neighborhoodsCount', neighborhoodNames_1.default);
        return neighborhoodsCount_;
    }
}
exports.NeighborhoodRepository = NeighborhoodRepository;
//# sourceMappingURL=neighborhoods.js.map