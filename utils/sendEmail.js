import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create transporter
  let transporter;

  if (process.env.EMAIL_SERVICE === 'gmail') {
    // Gmail configuration
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App password, not regular password
      }
    });
  } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
    // SendGrid configuration
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Development - Ethereal (fake SMTP)
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  // Email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  // Log preview URL for development (Ethereal)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVICE) {
    console.log('📧 Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  return info;
};

export default sendEmail;