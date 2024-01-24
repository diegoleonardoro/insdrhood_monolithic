
import * as nodemailer from 'nodemailer';
import mjml from 'mjml';
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;



type SendEmailOptions = {
  from: string;
  to: string;
  subject: string;
  html: any;
  text: string;
}

const sendEmail = async (emailOptions: SendEmailOptions) => {

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
    } catch (error) {
      console.log("erratas", error)
    }

  } else {

    transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com', // Example host for development
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.Email,
        pass: process.env.NODEMAILER_AUTH_PASS,
      }
    });

    try {
      
      await transporter?.sendMail(emailOptions);

    } catch (error) {
      console.log("erratas", error)
    }

  }





};




interface User {
  name: string;
  email: string;
  emailToken: string[];
  baseUrlForEmailVerification: string
};

export const sendVerificationMail = (user: User) => {

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
  const { html } = mjml(mjmlContent);
  const mailOptions = {
    from: `Insider Hood <${process.env.Email}>`,
    to: user.email,
    subject: 'Verify your email',
    html: html,
    text: "Hello, this email is for your email verification."
  };

  sendEmail(mailOptions);

}

