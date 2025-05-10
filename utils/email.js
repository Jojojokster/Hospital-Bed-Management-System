const nodemailer =  require('nodemailer')


const sendEmail = async (option) => {

    //Create Transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD
        }
    })


    //DEFINE EMAIL OPTIONS
    const emailOptions = {
        from: 'Hospite support<support@hospite.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transporter.sendEmail(emailOptions);
}

module.exports = sendEmail;