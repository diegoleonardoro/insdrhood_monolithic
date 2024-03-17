"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNeighborhood = exports.getAllNeighborhoods = exports.updateNeighborhoodData = exports.saveNeighborhoodData = exports.uploadBlogFiles = exports.uploadFile = exports.verifyemail = exports.updateUserData = exports.signout = exports.currentuser = exports.login = exports.newsLetterSignUp = exports.signup = void 0;
const emailVerification_1 = require("../services/emailVerification");
const neighborhoods_1 = require("../database/repositories/neighborhoods");
const auth_1 = require("../database/repositories/auth");
const newsletter_1 = require("../database/repositories/newsletter");
/**
 * @description registers a new user
 * @route POST /api/signup
 * @access public
*/
const signup = async (req, res) => {
    const authRepository = new auth_1.AuthRepository();
    const { userJwt, userInfo } = await authRepository.signup(req.body);
    req.session = {
        jwt: userJwt,
    };
    res.status(201).send(userInfo);
};
exports.signup = signup;
/**
 * @description registers a new email to the newsletter
 * @route POST /api/newsletter/signup
 * @access public
*/
const newsLetterSignUp = async (req, res) => {
    const { email } = req.body;
    const newsletterRepository = new newsletter_1.NewsletterRepository();
    const result = await newsletterRepository.subscribeToNewsletter(email);
    res.status(201).send(result);
};
exports.newsLetterSignUp = newsLetterSignUp;
/**
 * @description logs users in
 * @route POST /api/signin
 * @access public
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    const authRepository = new auth_1.AuthRepository();
    const { userJwt, userInfo } = await authRepository.login(email, password);
    req.session = {
        jwt: userJwt,
    };
    res.status(200).send(userInfo); //existingUser
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
 * @description updates user data
 * @route PUT /api/updateuserdata/:id
 * @access private
 */
const updateUserData = async (req, res) => {
    const { id } = req.params;
    let updates = req.body;
    const authRepository = new auth_1.AuthRepository();
    const { userJwt, userInfo } = await authRepository.updateUserData(id, updates);
    //  Store JWT on the session object created by cookieSession
    req.session = {
        jwt: userJwt,
    };
    if (updates.emailToken && updates.email !== '' && updates.email) {
        (0, emailVerification_1.sendVerificationMail)({
            name: userInfo.name,
            email: userInfo.email,
            emailToken: updates.emailToken,
            baseUrlForEmailVerification: process.env.BASE_URL ? process.env.BASE_URL.split(" ")[0] : ''
        });
    }
    res.status(200).send(userInfo);
};
exports.updateUserData = updateUserData;
/**
 * @description confirms user's email
 * @route GET /api/emailVerification/:emailtoken
 * @access only accessible with the email verification link
 */
const verifyemail = async (req, res) => {
    const emailtoken = req.params.emailtoken;
    const authRepository = new auth_1.AuthRepository();
    const { userJwt, userInfo } = await authRepository.verifyUser(emailtoken);
    req.session = {
        jwt: userJwt,
    };
    res.status(200).send(userInfo);
};
exports.verifyemail = verifyemail;
/**
 * @description makes request to aws S3 to get signed url
 * @route GET /api/neighborhood/imageupload/:neighborhood/:randomUUID
 * @access public
 */
const uploadFile = async (req, res) => {
    const user = req.currentUser ? req.currentUser : null;
    const neighborhoodRepository = new neighborhoods_1.NeighborhoodRepository();
    const { neighborhood, randomUUID } = req.params;
    const signedKeyUrl = await neighborhoodRepository.generateUploadUrlForForm(neighborhood, randomUUID, user);
    res.send(signedKeyUrl);
};
exports.uploadFile = uploadFile;
/**
 * @description makes request to aws S3 to get signed url for blog images
 * @route GET /api/blog/:randomUUID
 * @access public
 */
const uploadBlogFiles = async (req, res) => {
    const neighborhoodRepository = new neighborhoods_1.NeighborhoodRepository();
    const { randomUUID } = req.params;
    const signedKeyUrl = await neighborhoodRepository.generateUploadUrl(randomUUID);
    res.send(signedKeyUrl);
};
exports.uploadBlogFiles = uploadBlogFiles;
/**
 * @description saves form data
 * @route POST /neighborhood/savedata
 * @access public
 */
const saveNeighborhoodData = async (req, res) => {
    let user;
    if (req.currentUser) {
        user = await auth_1.AuthRepository.getUser(req.currentUser.email);
    }
    ;
    const neighborhoodRepository = new neighborhoods_1.NeighborhoodRepository();
    const newNeighborhood = await neighborhoodRepository.saveFormData(req.body, user);
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
    const neighborhoodRepository = new neighborhoods_1.NeighborhoodRepository();
    const neighborhood = await neighborhoodRepository.updateNeighborhoodData(id, updates);
    res.status(200).send(neighborhood);
};
exports.updateNeighborhoodData = updateNeighborhoodData;
/**
 * @description gets all neighbohoods data submitted from the form
 * @route GET/api/neighborhoods
 * @access public
 */
const getAllNeighborhoods = async (req, res) => {
    const { page: pageQuery, pageSize: pageSizeQuery } = req.query;
    const page = parseInt(pageQuery, 10) || 1;
    const pageSize = parseInt(pageSizeQuery, 10) || 10;
    const neighborhoodRepository = new neighborhoods_1.NeighborhoodRepository();
    const { neighborhoods, total } = await neighborhoodRepository.getAll({ page, pageSize });
    res.status(200).send({ neighborhoods, total });
};
exports.getAllNeighborhoods = getAllNeighborhoods;
/**
 * @description get a specific neighborhood
 * @route /api/neighborhood/:neighborhoodid
 * @access public
 */
const getNeighborhood = async (req, res) => {
    const neighborhoodRepository = new neighborhoods_1.NeighborhoodRepository();
    const neighborhood = await neighborhoodRepository.getOne(req.params.neighborhoodid);
    res.status(200).send(neighborhood);
};
exports.getNeighborhood = getNeighborhood;
//# sourceMappingURL=auth.js.map