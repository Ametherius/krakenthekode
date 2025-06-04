const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Validation middleware
const validateQuoteRequest = [
    body('email').isEmail().normalizeEmail(),
    body('project_type').trim().notEmpty(),
    body('pages').isInt({ min: 1 }).toInt(),
    body('domain').trim().notEmpty(),
    body('timeline').trim().notEmpty(),
    body('details').trim().notEmpty(),
    // Honeypot validation
    body('website').custom(value => {
        if (value && value.length > 0) {
            throw new Error('Bot detected');
        }
        return true;
    }),
    body('phone').custom(value => {
        if (value && value.length > 0) {
            throw new Error('Bot detected');
        }
        return true;
    }),
    body('name').custom(value => {
        if (value && value.length > 0) {
            throw new Error('Bot detected');
        }
        return true;
    })
];

// Handle form submission
app.post('/api/submit-quote', validateQuoteRequest, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (errors.array().some(err => err.msg === 'Bot detected')) {
                console.log('Potential bot detected:', {
                    ip: req.ip,
                    headers: req.headers,
                    body: req.body
                });
            }
            return res.status(400).json({ 
                error: 'Validation failed',
                details: errors.array().map(err => err.msg)
            });
        }

        const { email, project_type, pages, domain, timeline, details } = req.body;

        // Email content
        const mailOptions = {
            from: email,
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

        // Send auto-response to the user
        const userMailOptions = {
            from: email,
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

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            error: 'Error sending email',
            details: error.message
        });
    }
});

// For Vercel serverless functions
module.exports = app;

// Force redeploy for Vercel troubleshooting 