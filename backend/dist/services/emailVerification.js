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
exports.sendOrderConfirmationEmail = exports.sendNewsLetterEmail = exports.sendVerificationMail = void 0;
const nodemailer = __importStar(require("nodemailer"));
const mjml_1 = __importDefault(require("mjml"));
const googleapis_1 = require("googleapis");
const OAuth2 = googleapis_1.google.auth.OAuth2;
const sendEmail = async (emailOptions) => {
    const isProduction = process.env.NODE_ENV === "production";
    let transporter;
    if (isProduction) {
        transporter = nodemailer.createTransport({
            host: process.env.host,
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: process.env.NODEMAILER_AUTH_USER,
                serviceClient: process.env.client_id,
                privateKey: process.env.private_key?.replace(/\\n/g, '\n'),
                accessUrl: 'https://oauth2.googleapis.com/token'
            }
        });
        try {
            await transporter?.verify();
            const emailinfo = await transporter?.sendMail(emailOptions);
            console.log("emailinfo", emailinfo);
        }
        catch (error) {
            console.log("erratas", error);
        }
    }
    else {
        transporter = nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.Email,
                pass: process.env.NODEMAILER_AUTH_PASS,
            }
        });
        try {
            await transporter?.sendMail(emailOptions);
        }
        catch (error) {
            console.log("erratas", error);
        }
    }
};
;
const sendVerificationMail = (user) => {
    const mjmlContent = `
  <mjml>
  <mj-head>
    <mj-title>Verify Email</mj-title>
    <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500"></mj-font>
    <mj-attributes>
      <mj-all font-family="Montserrat, Helvetica, Arial, sans-serif"></mj-all>
      <mj-text font-weight="400" font-size="16px" color="#000000" line-height="24px"></mj-text>
      <mj-section padding="0px"></mj-section>
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#F2F2F2">
    <mj-section vertical-align="middle" background-size="cover" background-repeat="no-repeat">
      <mj-column width="100%">
        <mj-text align="center" padding="50px 40px 0 40px" font-weight="300">Hello,${user.name}, Insider Hood will give you unique perspectives on the enchatning neighborgoohds of New York City. We kindly ask for your email verification </mj-text>
        <mj-button href="${user.baseUrlForEmailVerification}/emailconfirmation/${user.emailToken[0]}" align="center" background-color="#5FA91D" color="#FFFFFF" border-radius="2px"  inner-padding="15px 30px" padding-bottom="100px" padding-top="20px">VERIFY EMAIL</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `;
    // Compile MJML to HTML
    const { html } = (0, mjml_1.default)(mjmlContent);
    const mailOptions = {
        from: `Insider Hood <${process.env.Email}>`,
        to: user.email,
        subject: 'Verify your email',
        html: html,
        text: "Hello, this email is for your email verification."
    };
    sendEmail(mailOptions);
};
exports.sendVerificationMail = sendVerificationMail;
const sendNewsLetterEmail = (email) => {
    const mjmlContent = `
  <mjml>
  <mj-head>
    <mj-title>Verify Email</mj-title>
    <mj-font name="Montserrat" href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500"></mj-font>
    <mj-attributes>
      <mj-all font-family="Montserrat, Helvetica, Arial, sans-serif"></mj-all>
      <mj-text font-weight="400" font-size="16px" color="#333333" line-height="24px"></mj-text>
      <mj-button font-family="Montserrat, Helvetica, Arial, sans-serif" font-size="16px" font-weight="500"></mj-button>
      <mj-section padding="0px"></mj-section>
    </mj-attributes>
    <mj-style>
      .title { font-size: 20px; font-weight: 500; margin-bottom: 10px; }
      .button { font-weight: 500; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#F2F2F2">
    <mj-section padding-top="30px" padding-bottom="30px">
      <mj-column width="600px">
        <mj-text css-class="title" color="#000000" padding-bottom="20px">
          Hey there! 
        </mj-text>
        <mj-text font-weight="400" padding-bottom="20px">
          I'm thrilled you've joined us at the Insider Hood newsletter! We're all about diving deep into the heart of New York City, bringing you closer to its people, buildings, and the stories that shape them.

          I will share only the stuff that matters to you, the kind of insights that make you feel more connected to this amazing city. Welcome aboard!

          If you are from New York City and would like to share your insights on your neighborhood, I invite you to fill out the following form:
        </mj-text>
        <mj-button href="${email.baseUrlForEmailVerification}/questionnaire" align="center" background-color="#5FA91D" color="#FFFFFF" border-radius="2px" inner-padding="15px 30px" font-weight="bold" padding-bottom="0px" padding-top="20px">
          QUESTIONNAIRE
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `;
    // Compile MJML to HTML
    const { html } = (0, mjml_1.default)(mjmlContent);
    const mailOptions = {
        from: `Insider Hood <${process.env.Email}>`,
        to: email.email,
        subject: 'Welcome to the Insider Hood Newsletter',
        html: html,
        text: "Insider Hood Newsletter."
    };
    sendEmail(mailOptions);
};
exports.sendNewsLetterEmail = sendNewsLetterEmail;
const sendOrderConfirmationEmail = (emailInfo) => {
    const { name, email, state, city, address, postalCode, orderId } = emailInfo;
    console.log('emailInfo from send confirmatio email methiod', emailInfo);
    const mjmlContent = `
  
  <mjml>
  <mj-head>
    <mj-title>Order Confirmation</mj-title>
    <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
    <mj-attributes>
      <mj-all font-family="Roboto, sans-serif" />
      <mj-text font-size="16px" line-height="24px" />
    </mj-attributes>
    <mj-style>
      .title {
        font-size: 20px;
        font-weight: bold;
        color: #333333;
      }
      .info-title {
        font-size: 16px;
        font-weight: bold;
        color: #333333;
        margin-bottom: 5px;
      }
      .info {
        margin-bottom: 15px;
      }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f0f0f0">
    <mj-section background-color="#ffffff" padding="30px">
      <mj-column>
        <mj-text css-class="title">Hi ${name}, thank you for your order!</mj-text>
        <mj-text>We will follow up with a tracking email once your package is on its way. Here are the details of your order:</mj-text>
        <mj-text>If you need any further information, please don't hesitate to reply back to this email.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  
  `;
    const { html } = (0, mjml_1.default)(mjmlContent);
    const mailOptions = {
        from: `Insider Hood <${process.env.Email}>`,
        to: email,
        subject: 'Thank you for your Order',
        html: html,
        text: "Insider Hood Order."
    };
    sendEmail(mailOptions);
};
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
//# sourceMappingURL=emailVerification.js.map