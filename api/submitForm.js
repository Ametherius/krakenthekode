import nodemailer from 'nodemailer';
import formidable from 'formidable';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end('Method Not Allowed');
    }

    const form = formidable({ multiples: false, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Form parse error:', err);
            return res.status(400).json({ message: 'Invalid form data' });
        }

        const firstName = fields.firstName || '';
        const lastName = fields.lastName || '';
        const emailAddress = fields.emailAddress || '';
        const businessName = fields.businessName || '';
        const projectType = fields.projectType || '';
        const domain = fields.domain || '';
        const projectDescription = fields.projectDescription || '';
        const primaryColor = fields.primaryColor || '';
        const secondaryColor = fields.secondaryColor || '';
        const logo = files.logoUpload;

        try {
            // Check if environment variables are set
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.error('Missing email credentials');
                return res.status(500).json({ message: 'Email service not configured' });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const html = 
    `<div class="container" style="display: flex; flex-direction: column; background-color: #b4b4b4; padding: 10px; border-radius: 10px;">
        <h1 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 24px; text-align: center; font-weight: bold; text-decoration: underline;">New Quote Request</h1>
        <div style="display: flex; flex-direction: column; justify-content: start; align-items: start; margin-bottom: 15px; border-bottom: 3px solid #34004e; padding-bottom: 10px;">
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; margin-bottom: 5px;">Name:</p>
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${firstName} ${lastName}</p>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: start; align-items: start; margin-bottom: 15px; border-bottom: 3px solid #34004e; padding-bottom: 10px;">
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; margin-bottom: 5px;">Email:</p>
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${emailAddress}</p>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: start; align-items: start; margin-bottom: 15px; border-bottom: 3px solid #34004e; padding-bottom: 10px;">
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; margin-bottom: 5px;">Business Name:</p>
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${businessName}</p>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: start; align-items: start; margin-bottom: 15px; border-bottom: 3px solid #34004e; padding-bottom: 10px;">
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; margin-bottom: 5px;">Project Type:</p>
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${projectType}</p>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: start; align-items: start; margin-bottom: 15px; border-bottom: 3px solid #34004e; padding-bottom: 10px;">
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; margin-bottom: 5px;">Domain:</p>
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${domain}</p>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: start; align-items: start; margin-bottom: 15px; border-bottom: 3px solid #34004e; padding-bottom: 10px;">
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; margin-bottom: 5px;">Project Description:</p>
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${projectDescription}</p>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: start; align-items: start; margin-bottom: 15px; border-bottom: 3px solid #34004e; padding-bottom: 10px;">
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; margin-bottom: 5px;">Primary Color:</p>
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${primaryColor}</p>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: start; align-items: start; margin-bottom: 15px; border-bottom: 3px solid #34004e; padding-bottom: 10px;">
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; margin-bottom: 5px;">Secondary Color:</p>
            <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${secondaryColor}</p>
        </div>
    </div>`;

            const mailOptions = {
                from: `Kraken The Kode <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: 'New Quote Request',
                html,
                attachments: logo && logo.filepath ? [
                    {
                        filename: logo.originalFilename || 'logo',
                        path: logo.filepath,
                        contentType: logo.mimetype || 'application/octet-stream'
                    }
                ] : []
            };

            await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: 'Email sent successfully' });
        } catch (e) {
            console.error('Email send error:', e);
            return res.status(500).json({ message: 'Error sending email' });
        }
    });
}


