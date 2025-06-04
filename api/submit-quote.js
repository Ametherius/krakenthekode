const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

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
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://krakenthekode.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Check if environment variables are set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Missing email configuration');
            throw new Error('Server configuration error');
        }

        // Parse request body
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        console.log('Received form submission:', { ...body, email: '[REDACTED]' });

        // Validate request body
        const errors = [];
        
        if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
            errors.push('Invalid email address');
        }
        if (!body.project_type) {
            errors.push('Project type is required');
        }
        if (!body.pages || isNaN(body.pages) || body.pages < 1) {
            errors.push('Number of pages must be at least 1');
        }
        if (!body.domain) {
            errors.push('Domain requirement is required');
        }
        if (!body.timeline) {
            errors.push('Timeline is required');
        }
        if (!body.details) {
            errors.push('Project details are required');
        }

        // Check honeypot fields
        if (body.website || body.phone || body.name) {
            console.log('Potential bot detected:', {
                ip: req.headers['x-forwarded-for'] || req.ip,
                headers: req.headers,
                body: { ...body, email: '[REDACTED]' }
            });
            errors.push('Invalid form submission');
        }

        if (errors.length > 0) {
            console.log('Validation errors:', errors);
            return res.status(400).json({ 
                error: 'Validation failed',
                details: errors
            });
        }

        const { email, project_type, pages, domain, timeline, details } = body;

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER, // Use configured email as sender
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
            from: process.env.EMAIL_USER, // Use configured email as sender
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

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            error: 'Error processing request',
            details: error.message
        });
    }
}; 