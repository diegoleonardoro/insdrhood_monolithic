
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

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: 'diego@insiderhood.com',
      serviceClient: '106023068823450336331',
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC2VkauuEAY/D6l\nq97USTD5aP8GlgPe1YSuFedj0cEy1lmmaRpjX+dez1jZ+3GVl1O0pmXt1qBuqqmz\nu/61elEaAOTpS8R31wmg3Y10GyW+LTfnyg0FooD8El57CyE4S3JN8Qtfhd9V+LBo\nlQzm46xzfWOFYEFJVbxogG30JNOMt5GDxXdgbDIV63JXgMhhMa4NR1rJ9/GkaXaC\n6GIrhaMm33oErBv6jTOIrPD5jfoQgfgZCpQodujD4883pmHd5X+GREtxXK6HeIDM\ncGGxVlfAbQl1Zz+7sn64iBubfq6eQzpWDkvWbahqKgdFsD05aZrKJ8E1tW03kzQf\n7dPB1EStAgMBAAECggEAFKv3W3ucGLkQSSwRGTQrDzuuHgsH6U1/u1TUZOa05pSS\nmWE1Eqseygrr4dq15+W+Ia7zw2Ef0ywaDTx1BhIV+8K6MRDb91Izzz8O+GjTgJoT\nyn2HuGnSAcH7YCvE2mMDVH7NcUj2JwMIzPKJAewx8u32SHq/LBdCQv68eH9sVHmR\n+IuupoqHSY5gcgmci7J9imvh1csrXKlo0QhGyY7Y2LzQuV6NQtUkMQBMPDz5sfhY\nbqsYxXZxYT+uDJu99B6EcCu8CHFEgFAfJdbNNMVlyziwDVH558PclSu4I2Tvx1s9\nyqUfJ8lyNjV8JGZTYZ9FYdI5z8MIpclHHC1ktB4JQQKBgQDzjIVTej615LUCs67Z\n023NwVEM+c89S8h8o7cigj7qCpCEK/rLtykgPj1qLtIMZDx4xQcwQ/rIJl1o+Jhx\nUyEkP5DktXCZI1l2FiaQCCdOYsOSOxh/ghghIk5vgh0tE/mTdOF70nKmp4yI+ryp\nIKvjwF+mfsINuBxkRuEARH7kmQKBgQC/qKLqa68t6GLzqCjOmnpOhWJG3UlCTmdR\nBw2yiiRBFX99zJbmO3PSBztRtoB2JpXDce+ziHLLqP8Vrkg3zLKPAPVFprjZ3hH3\nsb33BlQ6eiyOqCYe6oCmdTUCnIxT18avA84jKI0G3xXd3+scMgItP/VSZOs6QiMO\nOuJ8MpwZNQKBgA+RMtB0Jt//f2Ztz8ZSklktex3GNe3oEyeMW19UTestw7D/EqfE\nzFcoQ0qvNXPfUFIz3dLC9ZungB7+jNfphVvIyF0mD81qCgTXQ52/N6v1+iQ1rMox\nqZMsmzDbczv3Y+N9/A+rEvL+EKiMxlRVJ0eGe1asEYFI/F+YfDdFKYs5AoGBAIqU\nifAMmucL3/ikP5Vb11HNWkk5Gg6KmGPbQMk234372GqCsx2YIV/dAMRNvMcxkRp3\n2MUsxSyDbqYjlW5bYUTLgY2yRnip/L3n1B64gdCipHMmHCJAl3NEzmasAT9ihvPn\nQXbkjExKpAoBLYP+mNpVI7JG7Fr8lVJlu3voMDx9AoGBAJt5BJfCiYZCZoQkxaNL\nk5nc95ZM8O+2Bk/FYhD3Pa72yGKB/bXwFnto0CrWfMSTyhsn2wEqtxkgojev9R20\nHPv8FGM0I/n+fTYZ+l/JV2B+XTDOsTyYH4aKVgYTYSHQN25GuVqXPbGTBmOSTkiv\nuFd4f2jLOsi9JrXdbCgjMJ6W\n-----END PRIVATE KEY-----\n",
      accessUrl: 'https://oauth2.googleapis.com/token'
    }

  });

  try {
    transporter.verify();
    const emailinfo =  await transporter.sendMail(emailOptions);
    console.log("emailinfo", emailinfo);
  } catch (error) {
    console.log("erratas", error)
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
    from: `Insider Hood <${process.env.NODEMAILER_AUTH_USER}>`,
    to: user.email,
    subject: 'Verify your email',
    html: html,
    text: "Hello, this email is for your email verification."
  };

  sendEmail(mailOptions);

}

