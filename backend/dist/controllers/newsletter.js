"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewsLetter = void 0;
const newsletter_1 = require("../database/repositories/newsletter");
/**
 * @description send newsletter
 * @route GET /api/newsletter/send
 * @access public
*/
const sendNewsLetter = async (req, res) => {
    const newsletterRepository = new newsletter_1.NewsletterRepository();
    console.log("req.body", req.body);
    const { frequency } = req.body;
    const { message } = await newsletterRepository.sendNewsLetter({ frequency });
    res.status(200).send(message);
};
exports.sendNewsLetter = sendNewsLetter;
//# sourceMappingURL=newsletter.js.map