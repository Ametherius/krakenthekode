const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// For Vercel serverless functions
module.exports = async (req, res) => {
    console.log('Received request:', {
        method: req.method,
        headers: req.headers,
        body: req.body
    });

    // Only allow POST requests
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        res.status(405).send('Method not allowed');
        return;
    }

    try {
        // Check if environment variables are set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Missing email configuration');
            res.status(500).send('Server configuration error');
            return;
        }

        // Parse form data
        let formData;
        try {
            if (req.headers['content-type']?.includes('application/json')) {
                formData = req.body;
            } else {
                // Handle URL-encoded form data
                formData = req.body;
            }
            console.log('Parsed form data:', { ...formData, email: '[REDACTED]' });
        } catch (error) {
            console.error('Error parsing form data:', error);
            res.status(400).send('Invalid form data');
            return;
        }

        const { email, project_type, pages, domain, timeline, details } = formData;

        // Basic validation
        if (!email || !project_type || !pages || !domain || !timeline || !details) {
            console.log('Validation failed:', { 
                email: !!email, 
                project_type: !!project_type, 
                pages: !!pages, 
                domain: !!domain, 
                timeline: !!timeline, 
                details: !!details 
            });
            res.status(400).send('All fields are required');
            return;
        }

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info.krakenthekode@gmail.com',
            subject: 'New Quote Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; border-radius: 8px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; z-index: 0;">
                        <img src="https://krakenthekode.com/images/background.png" alt="Kraken The Kode" style="width: 400px; height: auto;">
                    </div>
                    <div style="position: relative; z-index: 1;">
                        <h2 style="color: #2b0049; margin-bottom: 20px; text-align: center;">New Quote Request</h2>
                        
                        <div style="background-color: #2d2d2d; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Email</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${email}</p>
                            
                            <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Project Type</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${project_type}</p>
                            
                            <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Number of Pages</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${pages}</p>
                            
                            <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Domain Requirements</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${domain}</p>
                            
                            <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Timeline</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${timeline}</p>
                            
                            <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Project Details</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0; white-space: pre-wrap;">${details}</p>
                        </div>
                        
                        <p style="text-align: center; margin-top: 20px; color: #2b0049; font-size: 12px;">
                            This email was sent from the Kraken The Kode quote request form.
                        </p>
                    </div>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('Admin notification email sent successfully');

        // Send auto-response to the user
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for your quote request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; border-radius: 8px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; z-index: 0;">
                        <img src="https://krakenthekode.com/images/brandlogo.png" alt="Kraken The Kode" style="width: 400px; height: auto;">
                    </div>
                    <div style="position: relative; z-index: 1;">
                        <h2 style="color: #2b0049; margin-bottom: 20px; text-align: center;">Thank You!</h2>
                        <div style="background-color: #2d2d2d; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0;">
                                Thank you for your quote request! We have received your information and will review it shortly.
                                Our team will get back to you as soon as possible with a detailed quote for your project.
                            </p>
                            <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                                If you have any additional questions or information to add, please don't hesitate to reply to this email.
                            </p>
                        </div>
                        <p style="text-align: center; margin-top: 20px; color: #2b0049; font-size: 12px;">
                            Kraken The Kode
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(userMailOptions);
        console.log('User confirmation email sent successfully');

        // Send success response
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Error processing request' });
    }
}; 