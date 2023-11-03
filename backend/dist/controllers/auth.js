"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserData = exports.saveNeighborhoodData = exports.uploadFile = exports.verifyemail = exports.signout = exports.currentuser = exports.login = exports.signup = void 0;
const user_1 = require("../models/user");
const neighborhood_1 = require("../models/neighborhood");
const bad_request_error_1 = require("../errors/bad-request-error");
const password_1 = require("../services/password");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    signatureVersion: "v4",
    region: "us-east-1",
});
const emailVerification_1 = require("../services/emailVerification");
/**
 * @description registers a new user
 * @route POST /api/signup
 * @access public
*/
const signup = async (req, res) => {
    const { name, email, password, image, formsResponded, residentId, userImagesId } = req.body;
    const existingUser = await user_1.User.findOne({ email });
    if (existingUser) {
        throw new bad_request_error_1.BadRequestError("Email in use");
    }
    ;
    // capiralize name and create email token:
    const nameFirstLetterCapitalized = name.charAt(0).toUpperCase();
    const remainingName = name.slice(1);
    const nameCapitalized = nameFirstLetterCapitalized + remainingName;
    const emailToken = crypto_1.default.randomBytes(64).toString("hex");
    // save user in database:
    const user = await user_1.User.build({
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
    });
    await user.save();
    // Generate JWT
    const userJwt = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        isVerified: user.isVerified,
        residentId: user.residentId
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
    // sendVerificationMail({ name: user.name, email: user.email, emailToken: user.emailToken }, baseUrlForEmailVerification);  
    res.status(201).send(user);
};
exports.signup = signup;
/**
 * @description logs users in
 * @route POST /api/signin
 * @access public
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await user_1.User.findOne({ email });
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
        residentId: existingUser.residentId
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
 * @description confirms user's email
 * @route GET /api/emailVerification/:emailtoken
 * @access only accessible with the email verification link
 */
const verifyemail = async (req, res) => {
    const emailtoken = req.params.emailtoken;
    // find the user with the email token:
    const user = await user_1.User.findOne({ emailToken: emailtoken });
    if (!user) {
        throw new bad_request_error_1.BadRequestError("Invalid email token");
    }
    user.isVerified = true;
    user.emailToken = '';
    await user.save();
    // Generate JWT
    const userJwt = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        isVerified: user.isVerified,
        residentId: user.residentId
    }, process.env.JWT_KEY);
    // Store JWT on the session object created by cookieSession
    req.session = {
        jwt: userJwt,
    };
    res.status(200).send(user);
};
exports.verifyemail = verifyemail;
/**
 * @description makes request to aws S3 to get signed url
 * @route GET /api/neighborhood/imageupload/:neighborhood/:randomUUID/:imagetype
 * @access public
 */
const uploadFile = async (req, res) => {
    const { neighborhood, randomUUID, imageType } = req.params;
    const randomUUID_imageIdentifier = (0, uuid_1.v4)();
    const key = `places/${req.currentUser ? req.currentUser.id
        : randomUUID}/${neighborhood}/${randomUUID_imageIdentifier}.${imageType}`;
    s3.getSignedUrlPromise("putObject", {
        Bucket: "populace",
        ContentType: imageType,
        Key: key,
    }, (err, url) => {
        res.send({ key, url });
    });
};
exports.uploadFile = uploadFile;
/**
 * @description save form data
 * @route POST /neighborhood/imageupload/:neighborhood/:randomUUID/:imagetype
 * @access public
 */
const saveNeighborhoodData = async (req, res) => {
    let user;
    if (req.currentUser) {
        user = await user_1.User.findOne({ email: req.currentUser.email });
    }
    const neighborhood = neighborhood_1.Neighborhood.build({
        ...req.body,
        user: user ? { id: user.id, name: user.name, email: user.email } : undefined
    });
    await neighborhood.save();
    res.status(201).send(neighborhood);
};
exports.saveNeighborhoodData = saveNeighborhoodData;
/**
 * @description updates user data
 * @route PUT /api/updateuserdata/:id
 * @access private
 */
const updateUserData = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    console.log('upsss', updates);
    const user = await user_1.User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    console.log("updated user", user);
    res.status(200).send(user);
};
exports.updateUserData = updateUserData;
