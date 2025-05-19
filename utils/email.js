const nodemailer = require('nodemailer');


const sendEmail = async (option) => {

    //Create Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });



    //DEFINE EMAIL OPTIONS
    const emailOptions = {
        from: 'Hospite support<support@hospite.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;