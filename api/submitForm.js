const nodemailer = require('nodemailer');
const formidable = require('formidable');

module.exports = async (req, res) => {
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

            const html = `New Quote Request from
                <br><br>
                <strong>Name:</strong> ${firstName} ${lastName}<br>
                <strong>Email:</strong> ${emailAddress}<br>
                <strong>Business Name:</strong> ${businessName}<br>
                <strong>Project Type:</strong> ${projectType}<br>
                <strong>Domain:</strong> ${domain}<br>
                <strong>Project Description:</strong> ${projectDescription}<br>
                <strong>Primary Color:</strong> ${primaryColor}<br>
                <strong>Secondary Color:</strong> ${secondaryColor}<br>`;

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
};


