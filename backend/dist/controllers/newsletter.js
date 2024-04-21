"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getuserInfo = exports.sendNewsLetterReferralEmail = exports.udpateNewsletterUsers = exports.sendNewsLetter = void 0;
const newsletter_1 = require("../database/repositories/newsletter");
/**
 * @description send newsletter
 * @route POST /api/newsletter/send
 * @access public
*/
const sendNewsLetter = async (req, res) => {
    const newsletterRepository = new newsletter_1.NewsletterRepository();
    const { frequency } = req.body;
    const { message } = await newsletterRepository.sendNewsLetter({ frequency });
    res.status(200).send(message);
};
exports.sendNewsLetter = sendNewsLetter;
/**
 * @description send newsletter
 * @route POST /api/newsletter/udpate
 * @access public
*/
const udpateNewsletterUsers = async (req, res) => {
    const { identifier, updates } = req.body;
    const newsletterRepository = new newsletter_1.NewsletterRepository();
    const { message, statusCode } = await newsletterRepository.updateUsers({ identifier, updates });
    res.status(statusCode).send(message);
};
exports.udpateNewsletterUsers = udpateNewsletterUsers;
/**
 * @description send newsletter
 * @route POST /api/newsletter/newsletterreferral
 * @access public
*/
const sendNewsLetterReferralEmail = async (req, res) => {
    const newsletterRepository = new newsletter_1.NewsletterRepository();
    const { email } = req.body;
    const templateId = 'd-86a14d2fac464094bcbd50099363aefe';
    const { message, statusCode } = await newsletterRepository.sendReferralEmail({ email, templateId });
    res.status(statusCode).send(message);
};
exports.sendNewsLetterReferralEmail = sendNewsLetterReferralEmail;
/**
 * @description send newsletter
 * @route GET /api/newsletter/getuserinfo
 * @access public
*/
const getuserInfo = async (req, res) => {
    const newsletterRepository = new newsletter_1.NewsletterRepository();
    const { identifier } = req.params;
    console.log("iddd", identifier);
    const { statusCode, user } = await newsletterRepository.getUserInfo({ identifier });
    res.status(statusCode).send(user);
};
exports.getuserInfo = getuserInfo;
//# sourceMappingURL=newsletter.js.map