
import * as nodemailer from 'nodemailer';
import mjml from 'mjml';


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
  const transporter = createMailTransporter();

  const mailOptions = {
    from: `Insider Hood <${process.env.NODEMAILER_AUTH_USER}>`,
    to: user.email,
    subject: 'Verify your email',
    html: html,
    text: "Hello, this email is for your email verification."
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Verification email sent")
    }
  });
}

// Define a type for transporter options
type TransporterOptions = {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user?: string;
    pass?: string;
    type?: string;
    serviceClient?: string;
    privateKey?: string;
    accessUrl?: string;
  };
};

const createMailTransporter = () => {
  const transporterOptions: any = {
    auth: {
      user: process.env.NODEMAILER_AUTH_USER,
    }
  };

  if (process.env.NODE_ENV === 'production') {
    transporterOptions.host = process.env.host;
    transporterOptions.port = 465; // Default SMTP secure port
    transporterOptions.secure = true;
    transporterOptions.auth.type = 'OAuth2';
    // transporterOptions.auth.serviceClient = process.env.project_id;
    transporterOptions.auth.clientId= process.env.client_id;
    transporterOptions.auth.clientEmail= process.env.client_email;
    transporterOptions.auth.privateKey = process.env.private_key;
    transporterOptions.auth.accessUrl = process.env.token_uri;
    transporterOptions.auth.tokenUri= process.env.token_uri;
    transporterOptions.auth.scope= 'https://www.googleapis.com/auth/gmail.send';

    console.log('process.env.host', process.env.host);
    console.log('process.env.project_id', process.env.project_id);
    console.log('process.env.private_key', process.env.private_key);
    console.log('transporterOptions.auth.accessUrl', transporterOptions.auth.accessUrl);

  } else {
    transporterOptions.service = process.env.NODEMAILER_SERVICE;
    transporterOptions.auth.pass = process.env.NODEMAILER_AUTH_PASS;
  }

  console.log('transporterOptions', transporterOptions);

  const transporter = nodemailer.createTransport(transporterOptions);
  return transporter;

};