import * as nodemailer from 'nodemailer';
import mjml from 'mjml';
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;
import { ObjectId } from 'mongodb';
import { S3 } from 'aws-sdk';

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

  // if (isProduction) {
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

  // } else {

  //   transporter = nodemailer.createTransport({
  //     host: 'smtp-mail.outlook.com', // Example host for development
  //     port: 587,
  //     secure: false, // Use TLS
  //     auth: {
  //       user: process.env.Email,
  //       pass: process.env.NODEMAILER_AUTH_PASS,
  //     }
  //   });

  //   try {

  //     await transporter?.sendMail(emailOptions);

  //   } catch (error) {
  //     console.log("erratas", error)
  //   }
  // }
};

interface User {
  email: string;
  emailToken?: string[];
  baseUrlForEmailVerification: string;
  userId: string; // Add userId to the interface
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
          <mj-text css-class="content">Thank you for subscribing to Insider Hood. This website will do its best to provide you with the best guides and content.</mj-text>
          <mj-text css-class="content">Please click the button below to verify your email and set up a password</mj-text>
          <mj-button href="${user.baseUrlForEmailVerification}/set-password/${user.userId}" background-color="#5FA91D" color="white">
            Verify Email
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

export const resetPassword = (user: User) => {
  const mjmlContent = `
  <mjml>
    <mj-head>
      <mj-title>Reset Your Insider Hood Password</mj-title>
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
          <mj-text css-class="title">Reset Your Password</mj-text>
          <mj-text css-class="content">We received a request to reset your password for your Insider Hood account. If you didn't make this request, you can ignore this email.</mj-text>
          <mj-text css-class="content">To reset your password, please click the button below:</mj-text>
          <mj-button href="${user.baseUrlForEmailVerification}/resetpassword/${user.userId}" background-color="#5FA91D" color="white">
            Reset Password
          </mj-button>
          <mj-text css-class="footer-text">If the button doesn't work, you can copy and paste this link into your browser: ${user.baseUrlForEmailVerification}/resetpassword/${user.userId}</mj-text>
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
    subject: 'Reset Your Insider Hood Password',
    html: html,
    text: "Reset your Insider Hood password by clicking the link in this email."
  };

  sendEmail(mailOptions);
}

export const sendPdfDownloadEmail = async (userEmail: string, pdfFileName: string) => {
  const isProduction = process.env.NODE_ENV === "production";

  const s3 = new S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION || 'us-east-1'
  });

  const key = pdfFileName.startsWith('http')
    ? pdfFileName.split('.com/')[1]
    : `brochures/WestVillage/${pdfFileName}`;

  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('S3_BUCKET_NAME is not defined in environment variables');
  }

  const s3Params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const s3Object = await s3.getObject(s3Params).promise();

    const mjmlContent = `
    <mjml>
      <mj-head>
        <mj-title>Your PDF is Ready for Download</mj-title>
        <mj-attributes>
          <mj-all font-family="Roboto, Arial, sans-serif" />
          <mj-text font-size="16px" line-height="24px" />
        </mj-attributes>
        <mj-style inline="inline">
          .title { font-size: 24px; font-weight: bold; color: #4A4A4A; }
          .content { font-size: 16px; color: #4A4A4A; line-height: 24px; }
        </mj-style>
      </mj-head>
      <mj-body background-color="#f7f7f7">
        <mj-section background-color="#ffffff" padding="50px 30px">
          <mj-column>
            <mj-text css-class="title">Your PDF is Ready!</mj-text>
            <mj-text css-class="content">Hello ${userEmail},</mj-text>
            <mj-text css-class="content">Your PDF is now available for download. You can find it attached to this email.</mj-text>
            <mj-text css-class="content">If you have any issues accessing the PDF, please don't hesitate to contact us.</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
    `;

    const { html } = mjml(mjmlContent);

    const mailOptions = {
      from: `Insider Hood <${process.env.NODEMAILER_AUTH_USER}>`,
      to: userEmail,
      subject: 'Your PDF is Ready for Download',
      html: html,
      text: "Your PDF is ready for download. Please check the email for the attached PDF.",
      attachments: [
        {
          filename: pdfFileName,
          content: s3Object.Body instanceof Buffer ? s3Object.Body : Buffer.from(s3Object.Body as Uint8Array),
          contentType: 'application/pdf'
        }
      ]
    };

    let transporter = nodemailer.createTransport({
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
    await transporter.verify();
    const emailInfo = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", emailInfo);
  } catch (error) {
    console.error('Error sending PDF download email:', error);
    throw error;
  }
};
