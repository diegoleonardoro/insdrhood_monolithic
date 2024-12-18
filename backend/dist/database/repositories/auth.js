"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const mongodb_1 = require("mongodb");
const index_1 = require("../index");
const bad_request_error_1 = require("../../errors/bad-request-error");
const password_1 = require("../../services/password");
const emailVerification_1 = require("../../services/emailVerification");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthRepository {
    static verifyUser(emailtoken) {
        throw new Error("Method not implemented.");
    }
    static getUser(email) {
        throw new Error("Method not implemented.");
    }
    constructor() {
        this.collectionName = 'users';
        this.db = (0, index_1.connectToDatabase)();
    }
    async getUserById(id) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        const user = await usersCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        return user;
    }
    async getUser(email) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        const user = await usersCollection.findOne({ email });
        return user;
    }
    async verifyUser(emailToken) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        const user = await usersCollection.findOne({ emailToken: { $in: [emailToken] } });
        if (!user) {
            throw new bad_request_error_1.BadRequestError("Invalid email token");
        }
        const updatedUser = await usersCollection.findOneAndUpdate({ _id: user._id }, {
            $set: {
                isVerified: true,
                // emailToken: ''
            }
        }, { returnDocument: 'after' });
        const userInfo = {
            id: updatedUser?._id.toString(),
            email: updatedUser?.email,
            name: updatedUser?.name,
            image: updatedUser?.image,
            isVerified: updatedUser?.isVerified,
            neighborhoodId: updatedUser?.neighborhoodId,
            userImagesId: updatedUser?.userImagesId,
            passwordSet: user?.passwordSet,
            formsResponded: user?.formsResponded
        };
        // Generate JWT
        const userJwt = jsonwebtoken_1.default.sign(userInfo, process.env.JWT_KEY);
        // Store JWT on the session object created by cookieSession
        return { userJwt, userInfo };
    }
    async updateUserData(id, updates) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        if (updates.password) {
            updates.password = await password_1.Password.toHash(updates.password);
        }
        if ('email' in updates) {
            const emailToken = crypto_1.default.randomBytes(64).toString('hex');
            const existingUser = await usersCollection.findOne({
                email: updates.email,
                _id: { $ne: new mongodb_1.ObjectId(id) }
            });
            if (existingUser) {
                throw new bad_request_error_1.BadRequestError('Email in use');
            }
            updates.emailToken = [emailToken];
        }
        const updatedUser = await usersCollection.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, { $set: updates }, { returnDocument: 'after' });
        if (!updatedUser) {
            throw new Error('User not found');
        }
        const userInfo = {
            id: updatedUser._id.toString(),
            email: updatedUser.email,
            name: updatedUser.name,
            image: updatedUser.image,
            isVerified: updatedUser.isVerified,
            neighborhoodId: updatedUser.neighborhoodId,
            userImagesId: updatedUser.userImagesId,
            passwordSet: updatedUser.passwordSet,
            formsResponded: updatedUser.formsResponded
        };
        const userJwt = jsonwebtoken_1.default.sign(userInfo, process.env.JWT_KEY);
        return { userJwt, userInfo };
    }
    async login(email, password) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        const existingUser = await usersCollection.findOne({ email });
        if (!existingUser) {
            throw new bad_request_error_1.BadRequestError("Invalid credentials");
        }
        const passwordMatch = await password_1.Password.compare(existingUser.password, password);
        if (!passwordMatch) {
            throw new bad_request_error_1.BadRequestError("Incorrect password");
        }
        const userInfo = {
            id: existingUser._id.toString(),
            email: existingUser.email,
            name: existingUser.name,
            image: existingUser.image,
            isVerified: existingUser.isVerified,
            neighborhoodId: existingUser.neighborhoodId,
            userImagesId: existingUser.userImagesId,
            passwordSet: existingUser.passwordSet,
            formsResponded: existingUser.formsResponded,
        };
        // Generate JWT
        const userJwt = jsonwebtoken_1.default.sign(userInfo, process.env.JWT_KEY);
        return { userJwt, userInfo };
    }
    async signup(userInfo) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        const existingUser = await usersCollection.findOne({ email: userInfo.email });
        if (existingUser) {
            throw new bad_request_error_1.BadRequestError("Email in use");
        }
        ;
        const nameCapitalized = userInfo.name.charAt(0).toUpperCase() + userInfo.name.slice(1);
        const emailToken = crypto_1.default.randomBytes(64).toString("hex");
        const hashedPassword = userInfo.password ? await password_1.Password.toHash(userInfo.password) : '';
        const newUser = {
            ...userInfo,
            name: nameCapitalized,
            email: userInfo.email === '' ? null : userInfo.email,
            password: hashedPassword,
            image: userInfo.image ? userInfo.image : null,
            isVerified: false,
            emailToken: [emailToken],
            neighborhoodId: userInfo.neighborhoodId ? userInfo.neighborhoodId : null,
            passwordSet: !!userInfo.password,
            formsResponded: userInfo.formsResponded,
            userImagesId: userInfo.userImagesId
        };
        const insertResult = await usersCollection.insertOne(newUser);
        const userId = insertResult.insertedId;
        const userInfoForJwt = {
            id: userId.toString(),
            email: newUser.email,
            name: newUser.name,
            image: newUser.image,
            isVerified: newUser.isVerified,
            neighborhoodId: newUser.neighborhoodId,
            userImagesId: newUser.userImagesId,
            passwordSet: newUser.passwordSet
            // Include other necessary fields
        };
        const userJwt = jsonwebtoken_1.default.sign(userInfoForJwt, process.env.JWT_KEY);
        if (newUser.email) {
            (0, emailVerification_1.sendVerificationMail)({
                email: newUser.email,
                emailToken: [emailToken],
                baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : '',
                userId: userId.toString() // Add the userId here
            });
        }
        return { userJwt, userInfo: userInfoForJwt };
    }
    async saveEmail(email) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        if (!email) {
            throw new bad_request_error_1.BadRequestError('Email is required');
        }
        const existingUser = await usersCollection.findOne({ email });
        const emailToken = crypto_1.default.randomBytes(64).toString('hex');
        if (existingUser) {
            // send email asking users to reset their password
            (0, emailVerification_1.resetPassword)({
                email,
                baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : '',
                userId: existingUser._id.toString(),
                emailToken: []
            });
            throw new bad_request_error_1.BadRequestError('Email already exists');
        }
        const newUser = {
            email,
            isVerified: false,
            // emailToken: [emailToken],
            createdAt: new Date()
        };
        await usersCollection.insertOne(newUser);
        return { message: 'Email saved successfully' };
    }
    async getUserByIdAndGenerateToken(id) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        // Check if the id is a valid ObjectId
        if (!mongodb_1.ObjectId.isValid(id)) {
            console.error(`Invalid ObjectId: ${id}`);
            return null;
        }
        try {
            // Update the user's isVerified status to true
            const updatedUser = await usersCollection.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, { $set: { isVerified: true } }, { returnDocument: 'after' });
            if (!updatedUser) {
                console.error(`User not found for id: ${id}`);
                return null;
            }
            const userInfo = {
                id: updatedUser._id.toString(),
                email: updatedUser.email,
                name: updatedUser.name,
                isVerified: updatedUser.isVerified,
                passwordSet: updatedUser.passwordSet,
            };
            const userJwt = jsonwebtoken_1.default.sign(userInfo, process.env.JWT_KEY);
            return { userJwt, userInfo };
        }
        catch (error) {
            console.error(`Error in getUserByIdAndGenerateToken: ${error}`);
            return null;
        }
    }
    async updatePassword(id, newPassword) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        const hashedPassword = await password_1.Password.toHash(newPassword);
        const updatedUser = await usersCollection.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, {
            $set: {
                password: hashedPassword,
                passwordSet: true
            }
        }, { returnDocument: 'after' });
        if (!updatedUser) {
            throw new Error('User not found');
        }
        const userInfo = {
            id: updatedUser._id.toString(),
            email: updatedUser.email,
            name: updatedUser.name,
            image: updatedUser.image,
            isVerified: updatedUser.isVerified,
            neighborhoodId: updatedUser.neighborhoodId,
            userImagesId: updatedUser.userImagesId,
            passwordSet: updatedUser.passwordSet,
            formsResponded: updatedUser.formsResponded
        };
        return userInfo;
    }
    async resetPassword(userId, newPassword) {
        const db = await this.db;
        const usersCollection = db.collection(this.collectionName);
        // Check if the userId is a valid ObjectId
        if (!mongodb_1.ObjectId.isValid(userId)) {
            throw new bad_request_error_1.BadRequestError('Invalid user ID');
        }
        const hashedPassword = await password_1.Password.toHash(newPassword);
        const updatedUser = await usersCollection.findOneAndUpdate({ _id: new mongodb_1.ObjectId(userId) }, {
            $set: {
                password: hashedPassword,
                passwordSet: true
            }
        }, { returnDocument: 'after' });
        if (!updatedUser) {
            throw new bad_request_error_1.BadRequestError('User not found');
        }
        const userInfo = {
            id: updatedUser._id.toString(),
            email: updatedUser.email,
            name: updatedUser.name,
            image: updatedUser.image,
            isVerified: updatedUser.isVerified,
            neighborhoodId: updatedUser.neighborhoodId,
            userImagesId: updatedUser.userImagesId,
            passwordSet: updatedUser.passwordSet,
            formsResponded: updatedUser.formsResponded
        };
        const userJwt = jsonwebtoken_1.default.sign(userInfo, process.env.JWT_KEY);
        return { userJwt, userInfo };
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.js.map