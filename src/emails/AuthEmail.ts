import {transporter} from '../config/nodemailer';
interface InterfaceEmail {
  email: string;
  name: string;
  token: string;
}
export class AuthEmail {
  static sendConfirmationEmail = async (user: InterfaceEmail) => {
    const info = await transporter.sendMail({
      from: 'TaskManager <admin@taskmanager.com>',
      to: user.email,
      subject: 'Email confirmation',
      text: ``,
      html: `<p>
      Dear ${user.name}, you created an account with us, please click on the link to confirm your email:
      </p>
      <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm Account</a>
      <p>
        Type your code: <b> ${user.token}</b> to confirm your account
      </p> 
      `,
    });

    console.log('Message sent: %s', info.messageId);
  };

  //*send email to reset password
  static sendPasswordResetToken = async (user: InterfaceEmail) => {
    const info = await transporter.sendMail({
      from: 'TaskManager ',
      to: user.email,
      subject: 'TaskManager- Reset Password',
      text: `TaskManager- Reset Password`,
      html: `<p>
      Dear ${user.name}, you requested to reset your password, please click on the link to reset your password:
      </p>
      <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset Password</a>
      <p>
        Type your code: <b> ${user.token}</b> to reset your password
      </p> 
      `,
    });
  };
}
