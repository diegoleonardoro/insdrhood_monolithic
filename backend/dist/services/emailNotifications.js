"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailNotifications = void 0;
const nodemailer = __importStar(require("nodemailer"));
const googleapis_1 = require("googleapis");
const OAuth2 = googleapis_1.google.auth.OAuth2;
class sendEmailNotifications {
    constructor(webPageRoute, email) {
        this.webPageRoute = webPageRoute;
        this.email = email;
        this.mjmlContent = this.createMJMLContent();
    }
    createMJMLContent(additionalText) {
        return `
    <mjml>
      <mj-head>
        <mj-title>New Visit Notification</mj-title>
        <mj-attributes>
          <mj-all font-family="Roboto, Arial, sans-serif" />
          <mj-text font-size="16px" line-height="24px" />
          <mj-section padding="20px" />
        </mj-attributes>
        <mj-styles>
          <style type="text/css">
            .title { font-size: 20px; font-weight: bold; color: #333333; }
            .content { font-size: 16px; color: #555555; }
            .highlight { font-size: 16px; font-weight: bold; color: #1070ca; }
            .footer { font-size: 14px; color: #999999; padding-top: 20px; }
          </style>
        </mj-styles>
      </mj-head>
      <mj-body background-color="#f7f7f7">
        <mj-section background-color="#ffffff" padding="40px">
          <mj-column>
            
            <mj-image src="https://insiderhood.s3.amazonaws.com/blog/70ad7596-d4aa-494f-ae01-38a7a18f1b75/74c92db8-a989-45fe-880d-01fac4e99e17" alt="Insider Hood" width="200px"></mj-image>
            
            <mj-text css-class="title" padding-top="20px">New Visit Detected!</mj-text>
            <mj-text css-class="content" padding-top="10px">The following route was visited: <span class="highlight">${this.webPageRoute}</span></mj-text>
            
            ${additionalText ? `<mj-text css-class="content" padding-top="10px">Additional Payload Details:<br/><span class="highlight">${additionalText}</span></mj-text>` : ""}
            
            <mj-text css-class="footer">Thank you for using Insider Hood. If you have any questions, feel free to reply to this email.</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
    }
    async sendEmail(body) {
        this.mjmlContent = this.createMJMLContent(body); // Update the email content when sending
        const emailOptions = {
            from: `Insider Hood <${this.email}>`,
            to: 'diego@insiderhood.com',
            subject: `New visit to ${this.webPageRoute}`,
            html: this.mjmlContent,
            text: "Hello, this email is to let you know that you received a new site visit."
        };
        const isProduction = process.env.NODE_ENV === "production";
        let transporter = nodemailer.createTransport({
            host: isProduction ? process.env.host : 'smtp-mail.outlook.com',
            port: isProduction ? 465 : 587,
            secure: isProduction,
            auth: isProduction ? {
                type: 'OAuth2',
                user: process.env.NODEMAILER_AUTH_USER,
                serviceClient: process.env.client_id,
                privateKey: process.env.private_key?.replace(/\\n/g, '\n'),
                accessUrl: 'https://oauth2.googleapis.com/token'
            } : {
                user: this.email,
                pass: process.env.NODEMAILER_AUTH_PASS,
            }
        });
        try {
            await transporter.verify();
            const result = await transporter.sendMail(emailOptions);
            console.log("Email sent successfully", result);
            return `Email sent successfully: ${result.messageId}`;
        }
        catch (error) {
            console.log("Error sending email", error);
            throw new Error(`Failed to send email: ${error}`);
        }
    }
}
exports.sendEmailNotifications = sendEmailNotifications;
//# sourceMappingURL=emailNotifications.js.map