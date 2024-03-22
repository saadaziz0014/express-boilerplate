const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const OAuth2_client = new OAuth2(process.env.MAIL_CLIENT_ID, process.env.MAIL_CLIENT_SECRET);
OAuth2_client.setCredentials({ refresh_token: process.env.MAIL_REFRESH_TOKEN });


const sendEMessage = (subject, body, email) => {
    return new Promise((resolve, reject) => {
        // ********************* For Simple Auth gmail ***************************
        // var transporter = nodemailer.createTransport({
        //     host: process.env.MAIL_HOST,
        //     port: 465,
        //     pool: true,
        //     secure: true,
        //     auth: {
        //         user: process.env.MAIL_SENDER_EMAIL,
        //         pass: process.env.MAIL_PASSWORD,
        //     },
        //     tls: {
        //         rejectUnauthorized: false
        //     }
        // });
        // *********************** For OAuth2 gmail ****************************
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.MAIL_SENDER_EMAIL,
                clientId: process.env.MAIL_CLIENT_ID,
                clientSecret: process.env.MAIL_CLIENT_SECRET,
                refreshToken: process.env.MAIL_REFRESH_TOKEN,
                accessToken: process.env.MAIL_ACCESS_TOKEN
            }
        });
        var mailOptions = {
            from: `${process.env.MAIL_SENDER_NAME} <${process.env.MAIL_SENDER_EMAIL}>`,
            to: email,
            subject: subject,
            html: body
        };
        return transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error, 'error in mail')
                return Promise.reject(error);
            } else {
                return resolve({ sent: true });
            }
        });

    });
};


module.exports = {
    sendEMessage
}