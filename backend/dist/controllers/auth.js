"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNeighborhood = exports.getAllNeighborhoods = exports.updateNeighborhoodData = exports.saveNeighborhoodData = exports.uploadFile = exports.verifyemail = exports.updateUserData = exports.signout = exports.currentuser = exports.login = exports.signup = void 0;
const bad_request_error_1 = require("../errors/bad-request-error");
const password_1 = require("../services/password");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const AWS = require("aws-sdk");
const index_1 = require("../index");
const mongodb_1 = require("mongodb");
const emailVerification_1 = require("../services/emailVerification");
/**
 * @description registers a new user
 * @route POST /api/signup
 * @access public
*/
const signup = async (req, res) => {
    const { name, email, password, image, formsResponded, residentId, userImagesId } = req.body;
    const db = (0, index_1.getDb)();
    const users = db.collection("users");
    const existingUser = await users.findOne({ email });
    if (existingUser) {
        throw new bad_request_error_1.BadRequestError("Email in use");
    }
    ;
    // // capiralize name and create email token:
    const nameFirstLetterCapitalized = name.charAt(0).toUpperCase();
    const remainingName = name.slice(1);
    const nameCapitalized = nameFirstLetterCapitalized + remainingName;
    const emailToken = crypto_1.default.randomBytes(64).toString("hex");
    const user = {
        name: nameCapitalized,
        email,
        password: password ? password : '',
        image: image ? image : null,
        isVerified: false,
        emailToken,
        formsResponded: formsResponded,
        residentId: residentId ? residentId : null,
        passwordSet: password ? true : false,
        userImagesId
    };
    const newUser = await users.insertOne(user);
    // Generate JWT
    const userJwt = jsonwebtoken_1.default.sign({
        id: newUser.insertedId,
        email: user.email,
        name: user.name,
        image: user.image,
        isVerified: user.isVerified,
        residentId: user.residentId,
        userImagesId: user.userImagesId
    }, process.env.JWT_KEY);
    // Store JWT on the session object created by cookieSession
    req.session = {
        jwt: userJwt,
    };
    (0, emailVerification_1.sendVerificationMail)({
        name: user.name,
        email: user.email,
        emailToken: user.emailToken,
        baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL : ''
    });
    const insertedRecord = await users.findOne({ _id: newUser.insertedId });
    res.status(201).send(insertedRecord);
};
exports.signup = signup;
/**
 * @description logs users in
 * @route POST /api/signin
 * @access public
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    const db = (0, index_1.getDb)();
    const users = db.collection("users");
    const existingUser = await users.findOne({ email });
    if (!existingUser) {
        throw new bad_request_error_1.BadRequestError("Invalid credentials");
    }
    const passwordMatch = await password_1.Password.compare(existingUser?.password, password);
    if (!passwordMatch) {
        throw new bad_request_error_1.BadRequestError("Incorrect password");
    }
    // Generate JWT
    const userJwt = jsonwebtoken_1.default.sign({
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        image: existingUser.image,
        isVerified: existingUser.isVerified,
        residentId: existingUser.residentId,
        userImagesId: existingUser.userImagesId
    }, process.env.JWT_KEY);
    // Store JWT on the session object created by cookieSession
    req.session = {
        jwt: userJwt,
    };
    res.status(200).send(existingUser); //existingUser
};
exports.login = login;
/**
 * @description checks if there is a logged in user and if so sends it back to the client
 * @route GET /api/currentuser
 * @access public
 */
const currentuser = async (req, res) => {
    res.send(req.currentUser || null);
};
exports.currentuser = currentuser;
/**
 * @description authenticate user with email token
 * @route GET /tokenauth/:token
 * @access public
 */
// Create route that will ahthenticate user with the email token 
/**
 * @description logs user out
 * @route POST /api/signout
 * @access only accesible when user is authenticated
 */
const signout = async (req, res) => {
    delete req.session?.jwt;
    res.send({});
};
exports.signout = signout;
/**
 * @description updates user data
 * @route PUT /api/updateuserdata/:id
 * @access private
 */
const updateUserData = async (req, res) => {
    const { id } = req.params;
    let updates = req.body;
    if (updates.password) {
        updates.password = await password_1.Password.toHash(updates.password);
    }
    const db = (0, index_1.getDb)();
    const users = db.collection("users");
    const user = await users.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, { $set: updates }, { returnDocument: 'after' });
    res.status(200).send(user);
};
exports.updateUserData = updateUserData;
/**
 * @description confirms user's email
 * @route GET /api/emailVerification/:emailtoken
 * @access only accessible with the email verification link
 */
const verifyemail = async (req, res) => {
    const emailtoken = req.params.emailtoken;
    const db = (0, index_1.getDb)();
    const users = db.collection("users");
    // find the user with the email token:
    const user = await users.findOne({ emailToken: emailtoken });
    if (!user) {
        throw new bad_request_error_1.BadRequestError("Invalid email token");
    }
    const updatedUser = await users.findOneAndUpdate({ _id: user._id }, {
        $set: {
            isVerified: true,
            // emailToken: ''
        }
    }, { returnDocument: 'after' });
    // Generate JWT
    const userJwt = jsonwebtoken_1.default.sign({
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        image: updatedUser?.image,
        isVerified: updatedUser?.isVerified,
        residentId: updatedUser?.residentId,
        userImagesId: updatedUser?.userImagesId
    }, process.env.JWT_KEY);
    // Store JWT on the session object created by cookieSession
    req.session = {
        jwt: userJwt,
    };
    res.status(200).send(updatedUser);
};
exports.verifyemail = verifyemail;
/**
 * @description makes request to aws S3 to get signed url
 * @route GET /api/neighborhood/imageupload/:neighborhood/:randomUUID/:imagetype
 * @access public
 */
const uploadFile = async (req, res) => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        signatureVersion: "v4",
        region: "us-east-1",
    });
    const { neighborhood, randomUUID, imageType } = req.params;
    const randomUUID_imageIdentifier = (0, uuid_1.v4)();
    const key = `places/${req.currentUser ? req.currentUser.id
        : randomUUID}/${neighborhood}/${randomUUID_imageIdentifier}.${imageType}`;
    s3.getSignedUrlPromise("putObject", {
        Bucket: "insiderhood",
        ContentType: imageType,
        Key: key,
    }, (err, url) => {
        res.send({ key, url });
    });
};
exports.uploadFile = uploadFile;
/**
 * @description saves form data
 * @route POST /neighborhood/savedata
 * @access public
 */
const saveNeighborhoodData = async (req, res) => {
    const db = (0, index_1.getDb)();
    const users = db.collection("users");
    let user;
    if (req.currentUser) {
        user = await users.findOne({ email: req.currentUser.email });
    }
    ;
    const neighborhoods = db.collection("neighborhoods");
    const newNeighborhood = await neighborhoods.insertOne({
        ...req.body,
        user: user ? { id: user.id, name: user.name, email: user.email } : undefined
    });
    res.status(201).send(newNeighborhood);
};
exports.saveNeighborhoodData = saveNeighborhoodData;
/**
 * @description updates neighborhood data
 * @route PUT /api/updateneighborhood/:id
 * @access public
*/
const updateNeighborhoodData = async (req, res) => {
    const { id } = req.params;
    let updates = req.body;
    const db = (0, index_1.getDb)();
    const neighborhoods = db.collection("neighborhoods");
    let updateQuery = {};
    if (updates.neighborhoodImages) {
        // If updating neighborhoodImages, use $push to add images to the existing array
        updateQuery.$push = { neighborhoodImages: { $each: updates.neighborhoodImages } };
        delete updates.neighborhoodImages; // Remove the property after adding to $push
    }
    if (Object.keys(updates).length > 0) {
        // If there are other updates, use $set to update fields
        updateQuery.$set = updates;
    }
    const neighborhood = await neighborhoods.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, updateQuery, { returnDocument: "after" });
    // const neighborhood = await Neighborhood.findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true });
    res.status(200).send(neighborhood);
};
exports.updateNeighborhoodData = updateNeighborhoodData;
/**
 * @description gets all neighbohoods data submitted from the form
 * @route GET/api/neighborhoods
 * @access public
 */
const getAllNeighborhoods = async (req, res) => {
    // const allNeighborhoods = await Neighborhood.find({});
    const db = (0, index_1.getDb)();
    const neighborhoods = await db.collection("neighborhoods").find({}).toArray();
    res.status(200).send(neighborhoods);
};
exports.getAllNeighborhoods = getAllNeighborhoods;
/**
 * @description get a specific neighborhood
 * @route /api/neighborhood/:neighborhoodid
 * @access public
 */
const getNeighborhood = async (req, res) => {
    const { neighborhoodid } = req.params;
    const db = (0, index_1.getDb)();
    const neighbohoods = db.collection("neighborhoods");
    const neighborhood = await neighbohoods.findOne({ _id: new mongodb_1.ObjectId(neighborhoodid) });
    res.status(200).send(neighborhood);
};
exports.getNeighborhood = getNeighborhood;
//# sourceMappingURL=auth.js.map