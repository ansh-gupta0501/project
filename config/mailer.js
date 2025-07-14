import nodemailer from 'nodemailer'
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMPT_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (toMail,subject,body)=>{
    const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL, // sender address
    to: toMail,
    subject: subject,
    html: body
  });

  console.log("Message sent:", info.messageId);
}