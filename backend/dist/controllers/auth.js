"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const user_1 = require("../models/user");
const bad_request_error_1 = require("../errors/bad-request-error");
const password_1 = require("../services/password");
/**
 * @description logs in user
 * @route POST /api/signin
 * @access public
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("reqqq body", req.body);
    const existingUser = await user_1.User.findOne({ email });
    console.log('existingUser', existingUser);
    if (!existingUser) {
        throw new bad_request_error_1.BadRequestError("Invalid credentials");
    }
    const passwordMatch = await password_1.Password.compare(existingUser?.password, password);
    if (!passwordMatch) {
        throw new bad_request_error_1.BadRequestError("Incorrect password");
    }
    // // // Generate JWT
    // const userJwt = jwt.sign(
    //   {
    //     id: existingUser.id,
    //     email: existingUser.email,
    //     name: existingUser.name,
    //     isVerified: existingUser.isVerified
    //   },
    //   'process.env.JWT_KEY!'
    // );
    // // Store JWT on the session object created by cookieSession
    // req.session = {
    //   jwt: userJwt,
    // };
    res.status(200).send({ existingUser }); //existingUser
};
exports.login = login;
