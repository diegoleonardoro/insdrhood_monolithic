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
exports.sendVerificationMail = void 0;
const nodemailer = __importStar(require("nodemailer"));
const mjml_1 = __importDefault(require("mjml"));
const googleapis_1 = require("googleapis");
const OAuth2 = googleapis_1.google.auth.OAuth2;
const sendEmail = async (emailOptions) => {
    console.log("process.env.NODEMAILER_AUTH_USER", process.env.NODEMAILER_AUTH_USER);
    console.log("process.env.client_id", process.env.client_id);
    console.log("process.env.private_key", process.env.private_key);
    console.log("process.env.host", process.env.host);
    const transporter = nodemailer.createTransport({
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
        await transporter.verify();
        const emailinfo = await transporter.sendMail(emailOptions);
        console.log("emailinfo", emailinfo);
    }
    catch (error) {
        console.log("erratas", error);
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
        <mj-text align="center" padding="50px 40px 0 40px" font-weight="300">Hello,${user.name}, Insider Hoold will give you unique perspectives on the enchatning neighborgoohds of New York City. We kindly ask for your email verification </mj-text>
        <mj-button href="${user.baseUrlForEmailVerification}/emailconfirmation/${user.emailToken[0]}" align="center" background-color="#5FA91D" color="#FFFFFF" border-radius="2px"  inner-padding="15px 30px" padding-bottom="100px" padding-top="20px">VERIFY EMAIL</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `;
    // Compile MJML to HTML
    const { html } = (0, mjml_1.default)(mjmlContent);
    const mailOptions = {
        from: `Insider Hood <${process.env.NODEMAILER_AUTH_USER}>`,
        to: user.email,
        subject: 'Verify your email',
        html: html,
        text: "Hello, this email is for your email verification."
    };
    sendEmail(mailOptions);
};
exports.sendVerificationMail = sendVerificationMail;
//# sourceMappingURL=emailVerification.js.map