"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendChatHistory = exports.SendChatNotifications = void 0;
const emailNotifications_1 = require("../services/emailNotifications");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * @description sends notification email
 * @route POST /api/chat/sendChatInfo
 * @access public
*/
const SendChatNotifications = async (req, res) => {
    const { webPageRoute, payLoad } = req.body;
    const emailNotify = new emailNotifications_1.sendEmailNotifications(webPageRoute, process.env.Email ? process.env.Email : '');
    emailNotify.sendEmail(JSON.stringify(payLoad))
        .then(result => console.log('Email sending initiated', result))
        .catch(error => console.error('Error sending email', error));
    res.status(202).json({ message: 'Notification process initiated' });
};
exports.SendChatNotifications = SendChatNotifications;
/**
 * @description sends notification email
 * @route POST /api/chat/sendCharSummary
 * @access public
*/
const SendChatHistory = async (req, res) => {
    console.log('route hit');
    const { email, chatHistory } = req.body;
    const emailNotify = new emailNotifications_1.sendEmailNotifications('', process.env.Email ? process.env.Email : '');
    emailNotify.sendChatSummary(chatHistory, email);
    res.status(202).json({ message: 'Notification process initiated' });
};
exports.SendChatHistory = SendChatHistory;
//# sourceMappingURL=chat.js.map