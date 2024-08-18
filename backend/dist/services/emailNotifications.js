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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailNotifications = void 0;
const nodemailer = __importStar(require("nodemailer"));
const mjml_1 = __importDefault(require("mjml"));
const googleapis_1 = require("googleapis");
const OAuth2 = googleapis_1.google.auth.OAuth2;
function formatPromotionLinks(links) {
    const rows = links.map(link => `
    <tr>
      <td style="padding: 10px; border:1px solid #ccc;">${link['Tour Title']}</td>
      <td style="padding: 10px; border:1px solid #ccc;">
        <a href="${link['Activity URL']}" target="_blank">View Tour</a>
      </td>
    </tr>
  `).join('');
    return `
    <mj-section padding="20px" background-color="#F9F9F9">
      <mj-column>
        <mj-text font-size="18px" font-weight="bold" color="#333333" padding-bottom="10px">
          Featured Tours
        </mj-text>
        <mj-table>
          <tr style="background-color: #f0f0f0; color: #333;">
            <th style="padding: 10px;">Tour Title</th>
            <th style="padding: 10px;">Link</th>
          </tr>
          ${rows}
        </mj-table>
      </mj-column>
    </mj-section>
  `;
}
function formatContent(data) {
    if (Array.isArray(data)) {
        return formatPromotionLinks(data);
    }
    return `
    <mj-section padding="20px" background-color="#ffffff">
      <mj-column>
        <mj-text font-size="16px" padding-bottom="10px">${data.info || data}</mj-text>
        <mj-divider border-color="#E0E0E0" />
      </mj-column>
    </mj-section>
  `;
}
function createEmailBody(dataItems) {
    let bodyContent = dataItems.map(item => formatContent(item.content)).join('');
    const mjmlString = `
    <mjml>
      <mj-head>
        <mj-title>NYC Neighborhood Highlights</mj-title>
        <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
        <mj-attributes>
          <mj-all font-family="Roboto, Helvetica, Arial" />
          <mj-text line-height="1.5" />
        </mj-attributes>
        <mj-style inline="inline">
          body {
            background-color: #f4f4f4;
          }
          th {
            font-weight: bold;
            background-color: #e3e3e3;
          }
        </mj-style>
      </mj-head>
      <mj-body>
        <mj-section background-color="#23395B">
          <mj-column>
            <mj-text align="center" color="#ffffff" font-size="24px" font-weight="bold" padding-bottom="20px">
              Explore NYC: Insights and Tours
            </mj-text>
          </mj-column>
        </mj-section>
        ${bodyContent}
      </mj-body>
    </mjml>
  `;
    return (0, mjml_1.default)(mjmlString).html;
}
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
    async sendChatSummary(chatHistory, email) {
        const messagesForEmail = chatHistory.filter((msg) => {
            return msg.sendToEmail === true &&
                (!(typeof msg.content === 'string' && msg.content.includes("email address")));
        });
        const emailBody = createEmailBody(messagesForEmail);
        const emailOptions = {
            from: `Insider Hood <${this.email}>`,
            to: 'diego@insiderhood.com',
            subject: `Chat History`,
            html: emailBody,
            text: "Chat History"
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