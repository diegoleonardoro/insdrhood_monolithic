
import * as nodemailer from 'nodemailer';
import mjml from 'mjml';
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;
import { ObjectId } from 'mongodb';


type SendEmailOptions = {
  from: string;
  to: string;
  subject: string;
  html: any;
  text: string;
}

interface OrderInfo {
  name: string;
  email: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
  orderId?: ObjectId;
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
      <mj-title>Welcome to Insider Hood</mj-title>
      <mj-attributes>
        <mj-all font-family="Roboto, Arial, sans-serif" />
        <mj-text font-size="16px" line-height="24px" />
      </mj-attributes>
      <mj-style inline="inline">
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #4A4A4A;
        }
        .content {
          font-size: 16px;
          color: #4A4A4A;
          line-height: 24px;
        }
        .footer-text {
          font-size: 14px;
          color: #4A4A4A;
        }
      </mj-style>
    </mj-head>
    <mj-body background-color="#f7f7f7">
      <mj-section background-color="#ffffff" padding="50px 30px">
        <mj-column>
          <mj-image src="https://insiderhood.s3.amazonaws.com/blog/70ad7596-d4aa-494f-ae01-38a7a18f1b75/74c92db8-a989-45fe-880d-01fac4e99e17" alt="Insider Hood" width="400px"></mj-image>
          <mj-text css-class="title" padding-top="20px">Welcome to Insider Hood, ${user.name}!</mj-text>
          <mj-text css-class="content">Our aim is to provide thoughtful content about New York City. We strive to highlight historic places, delving into their architecture and history.</mj-text>
          <mj-text css-class="footer-text" padding-top="20px">If you have any questions, feel free to reply to this email.</mj-text>
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


interface Email {
  email: string;
  baseUrlForEmailVerification: string
}

export const sendNewsLetterEmail = (email: Email) => {

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
  const { html } = mjml(mjmlContent);
  const mailOptions = {
    from: `Insider Hood <${process.env.Email}>`,
    to: email.email,
    subject: 'Welcome to the Insider Hood Newsletter',
    html: html,
    text: "Insider Hood Newsletter."
  };

  sendEmail(mailOptions);

}


export const sendOrderConfirmationEmail = (emailInfo: OrderInfo) => {

  const { name, email, state, city, address, postalCode, orderId } = emailInfo

  console.log('emailInfo from send confirmatio email methiod', emailInfo)
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
  
  `

  const { html } = mjml(mjmlContent);

  const mailOptions = {
    from: `Insider Hood <${process.env.Email}>`,
    to: email,
    subject: 'Thank you for your Order',
    html: html,
    text: "Insider Hood Order."
  };
  sendEmail(mailOptions);
}
