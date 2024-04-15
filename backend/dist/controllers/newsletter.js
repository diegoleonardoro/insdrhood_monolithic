"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewsLetterReferralEmail = exports.sendNewsLetter = void 0;
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
//# sourceMappingURL=newsletter.js.map