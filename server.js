require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: ['http://localhost:4000', 'https://krakenthekode.com'],
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

// Handle form submission
app.post('/submit-quote', async (req, res) => {
    try {
        // Log the request body for debugging
        console.log('Received form data:', req.body);

        const { email, project_type, pages, domain, timeline, details } = req.body;

        if (!email || !project_type || !pages || !domain || !timeline || !details) {
            console.log('Missing required fields:', { email, project_type, pages, domain, timeline, details });
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Email content
        const mailOptions = {
            from: email,
            to: 'info.krakenthekode@gmail.com',
            subject: 'New Quote Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; border-radius: 8px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; z-index: 0;">
                        <img src="https://krakenthekode.com/images/logo.png" alt="Kraken The Kode" style="width: 400px; height: auto;">
                    </div>
                    <div style="position: relative; z-index: 1;">
                        <h2 style="color: #8A2BE2; margin-bottom: 20px; text-align: center;">New Quote Request</h2>
                        
                        <div style="background-color: #2d2d2d; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; color: #8A2BE2; font-size: 14px; margin-bottom: 5px;">Email</label>
                                <div style="color: #ffffff; font-size: 16px;">${email}</div>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; color: #8A2BE2; font-size: 14px; margin-bottom: 5px;">Project Type</label>
                                <div style="color: #ffffff; font-size: 16px;">${project_type}</div>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; color: #8A2BE2; font-size: 14px; margin-bottom: 5px;">Number of Pages</label>
                                <div style="color: #ffffff; font-size: 16px;">${pages}</div>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; color: #8A2BE2; font-size: 14px; margin-bottom: 5px;">Domain Requirements</label>
                                <div style="color: #ffffff; font-size: 16px;">${domain}</div>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; color: #8A2BE2; font-size: 14px; margin-bottom: 5px;">Timeline</label>
                                <div style="color: #ffffff; font-size: 16px;">${timeline}</div>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; color: #8A2BE2; font-size: 14px; margin-bottom: 5px;">Project Details</label>
                                <div style="color: #ffffff; font-size: 16px; white-space: pre-wrap;">${details}</div>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #8A2BE2; font-size: 12px;">
                            This email was sent from the Kraken The Kode quote request form.
                        </div>
                    </div>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Send auto-response to the user
        const userMailOptions = {
            from: `"Kraken The Kode" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Thank you for your quote request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; border-radius: 8px; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; z-index: 0;">
                        <img src="https://krakenthekode.com/images/logo.png" alt="Kraken The Kode" style="width: 400px; height: auto;">
                    </div>
                    <div style="position: relative; z-index: 1;">
                        <h2 style="color: #8A2BE2; margin-bottom: 20px; text-align: center;">Thank You!</h2>
                        <div style="background-color: #2d2d2d; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
                                Thank you for your quote request! We have received your information and will review it shortly.
                                Our team will get back to you as soon as possible with a detailed quote for your project.
                            </p>
                            <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin-top: 20px;">
                                If you have any additional questions or information to add, please don't hesitate to reply to this email.
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 20px; color: #8A2BE2; font-size: 12px;">
                            Kraken The Kode - Your Digital Solutions Partner
                        </div>
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
    res.sendFile(path.join(__dirname, 'request-quote.html'));
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