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
          <mj-all font-family="Helvetica, Arial, sans-serif" />
          <mj-text font-size="16px" line-height="24px" />
          <mj-section padding="20px" />
        </mj-attributes>
        <mj-styles>
          <style type="text/css">            
            .content {
              font-size: 16px;
              color: #555;
              margin-top: 10px; /* added margin for spacing */
            }
            .highlight {
              font-weight: bold;
              color: #1070ca;
            }
            .footer {
              font-size: 14px;
              color: #888;
              padding-top: 10px;
              text-align: center;
            }
            
          </style>
        </mj-styles>
      </mj-head>
      <mj-body background-color="#ffffff">
        <mj-section>
          <mj-column css-class="card">
            <mj-text css-class="content">The following route was visited:</mj-text>
            <mj-text css-class="highlight">${this.webPageRoute}</mj-text>
            ${additionalText ? `
              <mj-section css-class="footer">
                <mj-text css-class="content">Payload Details:</mj-text>
                <mj-text css-class="highlight">${additionalText}</mj-text>
              </mj-section>
            ` : ""}
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