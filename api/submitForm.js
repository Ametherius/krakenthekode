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

        // Extract first value from arrays (formidable v3 returns arrays)
        const firstName = Array.isArray(fields.firstName) ? fields.firstName[0] : fields.firstName || '';
        const lastName = Array.isArray(fields.lastName) ? fields.lastName[0] : fields.lastName || '';
        const emailAddress = Array.isArray(fields.emailAddress) ? fields.emailAddress[0] : fields.emailAddress || '';
        const businessName = Array.isArray(fields.businessName) ? fields.businessName[0] : fields.businessName || '';
        const projectType = Array.isArray(fields.projectType) ? fields.projectType[0] : fields.projectType || '';
        const domain = Array.isArray(fields.domain) ? fields.domain[0] : fields.domain || '';
        const projectDescription = Array.isArray(fields.projectDescription) ? fields.projectDescription[0] : fields.projectDescription || '';
        const primaryColor = Array.isArray(fields.primaryColor) ? fields.primaryColor[0] : fields.primaryColor || '';
        const secondaryColor = Array.isArray(fields.secondaryColor) ? fields.secondaryColor[0] : fields.secondaryColor || '';
        const logo = files.logoUpload ? (Array.isArray(files.logoUpload) ? files.logoUpload[0] : files.logoUpload) : null;

        console.log('Parsed form data:', { firstName, lastName, emailAddress, businessName });

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
    `<table width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <!-- Outer Container -->
                <table width="600px" cellspacing="0" cellpadding="0" border="2" style="background-color: #b4b4b4; border-radius: 10px; overflow: hidden;">
                    <!-- header -->
                    <tr>
                        <td align="center">
                            <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center">
                                        <h1 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 24px; font-weight: bold; text-decoration: underline; padding: 10px;">New Quote Request</h1>
                                    </td>
                                </tr>
                                <!-- Body -->
                                 <tr>
                                    <td style="padding: 20px; border-bottom: 2px solid #34004e;">
                                        <h3 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase;">NAME:</h3>
                                        <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${firstName} ${lastName}</p>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td style="padding: 20px; border-bottom: 2px solid #34004e;">
                                        <h3 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase;">EMAIL:</h3>
                                        <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${emailAddress}</p>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td style="padding: 20px; border-bottom: 2px solid #34004e;">
                                        <h3 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase;">BUSINESS NAME:</h3>
                                        <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${businessName}</p>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td style="padding: 20px; border-bottom: 2px solid #34004e;">
                                        <h3 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase;">PROJECT TYPE:</h3>
                                        <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${projectType}</p>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td style="padding: 20px; border-bottom: 2px solid #34004e;">
                                        <h3 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase;">DOMAIN:</h3>
                                        <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${domain}</p>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td style="padding: 20px; border-bottom: 2px solid #34004e;">
                                        <h3 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase;">PROJECT DESCRIPTION:</h3>
                                        <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${projectDescription}</p>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td style="padding: 20px; border-bottom: 2px solid #34004e;">
                                        <h3 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase;">PRIMARY COLOR:</h3>
                                        <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${primaryColor}</p>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; text-transform: uppercase;">SECONDARY COLOR:</h3>
                                        <p style="font-family: 'Arial', sans-serif; color: #34004e; font-size: 16px; font-weight: bold; margin: 0;">${secondaryColor}</p>
                                    </td>
                                 </tr>
                            </table>
        </td>
    </tr>
  </table>`;

            console.log('Logo file info:', logo ? { 
                hasFile: !!logo, 
                filepath: logo.filepath, 
                filename: logo.originalFilename,
                mimetype: logo.mimetype 
            } : 'No logo uploaded');

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

            console.log('Mail options prepared:', {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject,
                hasAttachments: mailOptions.attachments.length > 0
            });

            console.log('Attempting to send email...');
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return res.status(200).json({ message: 'Email sent successfully' });
        } catch (e) {
            console.error('Email send error:', e);
            console.error('Error details:', {
                message: e.message,
                code: e.code,
                command: e.command
            });
            return res.status(500).json({ 
                message: 'Error sending email', 
                error: e.message,
                details: process.env.NODE_ENV === 'development' ? e.toString() : undefined
            });
        }
    });
}


