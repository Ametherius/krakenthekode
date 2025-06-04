require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 4000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    next();
});

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
    body('project_type').trim().isLength({ min: 2, max: 100 }),
    body('pages').trim().isLength({ min: 1, max: 50 }),
    body('domain').trim().isLength({ min: 2, max: 200 }),
    body('timeline').trim().isLength({ min: 2, max: 100 }),
    body('details').trim().isLength({ min: 10, max: 2000 }),
    // Honeypot validation - if these fields are filled, it's likely a bot
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
app.post('/submit-quote', limiter, validateQuoteRequest, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Log potential bot attempts
            if (errors.array().some(err => err.msg === 'Bot detected')) {
                console.log('Potential bot detected:', {
                    ip: req.ip,
                    headers: req.headers,
                    body: req.body
                });
            }
            return res.status(400).json({ errors: errors.array() });
        }

        // Log the request body for debugging
        console.log('Received form data:', req.body);

        const { email, project_type, pages, domain, timeline, details } = req.body;

        // Additional validation
        if (!email || !project_type || !pages || !domain || !timeline || !details) {
            console.log('Missing required fields:', { email, project_type, pages, domain, timeline, details });
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check for suspicious content
        const suspiciousPatterns = [
            /<script>/i,
            /javascript:/i,
            /on\w+=/i,
            /data:/i,
            /vbscript:/i,
            /expression/i
        ];

        const allFields = [email, project_type, pages, domain, timeline, details];
        for (const field of allFields) {
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(field)) {
                    return res.status(400).json({ error: 'Invalid input detected' });
                }
            }
        }

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
                        <h2 style="color:rgb(43, 0, 73); margin-bottom: 20px; text-align: center;">New Quote Request</h2>
                        
                        <div style="background-color: #2d2d2d; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            <p style="color:rgb(43, 0, 73); font-size: 14px; margin: 0 0 5px 0;">Email</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${email}</p>
                            
                            <p style="color:rgb(43, 0, 73); font-size: 14px; margin: 0 0 5px 0;">Project Type</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${project_type}</p>
                            
                            <p style="color:rgb(43, 0, 73); font-size: 14px; margin: 0 0 5px 0;">Number of Pages</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${pages}</p>
                            
                            <p style="color:rgb(43, 0, 73); font-size: 14px; margin: 0 0 5px 0;">Domain Requirements</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${domain}</p>
                            
                            <p style="color:rgb(43, 0, 73); font-size: 14px; margin: 0 0 5px 0;">Timeline</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">${timeline}</p>
                            
                            <p style="color:rgb(43, 0, 73); font-size: 14px; margin: 0 0 5px 0;">Project Details</p>
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0; white-space: pre-wrap;">${details}</p>
                        </div>
                        
                        <p style="text-align: center; margin-top: 20px; color:rgb(43, 0, 73); font-size: 12px;">
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
                        <h2 style="color: rgb(43, 0, 73); margin-bottom: 20px; text-align: center;">Thank You!</h2>
                        <div style="background-color: #2d2d2d; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0;">
                                Thank you for your quote request! We have received your information and will review it shortly.
                                Our team will get back to you as soon as possible with a detailed quote for your project.
                            </p>
                            <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                                If you have any additional questions or information to add, please don't hesitate to reply to this email.
                            </p>
                        </div>
                        <p style="text-align: center; margin-top: 20px; color: rgb(43, 0, 73); font-size: 12px;">
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
        res.status(500).json({ error: 'Error sending email' });
    }
});

// Serve static files for GET requests only
app.use((req, res, next) => {
    if (req.method === 'GET') {
        express.static(path.join(__dirname))(req, res, next);
    } else {
        next();
    }
});

// Add a catch-all route to serve the main HTML file
app.get('*', (req, res) => {
    if (req.path === '/thank-you') {
        res.sendFile(path.join(__dirname, 'thank-you.html'));
    } else {
        res.sendFile(path.join(__dirname, 'request-quote.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server with error handling
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please try a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
}); 