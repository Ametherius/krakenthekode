require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
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
            from: process.env.EMAIL_USER,
            to: 'info.krakenthekode@gmail.com',
            subject: 'New Quote Request',
            html: `
                <h2>New Quote Request</h2>
                <table border="1" cellpadding="5" cellspacing="0">
                    <tr>
                        <th>Field</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>${email}</td>
                    </tr>
                    <tr>
                        <td>Project Type</td>
                        <td>${project_type}</td>
                    </tr>
                    <tr>
                        <td>Number of Pages</td>
                        <td>${pages}</td>
                    </tr>
                    <tr>
                        <td>Domain Requirements</td>
                        <td>${domain}</td>
                    </tr>
                    <tr>
                        <td>Timeline</td>
                        <td>${timeline}</td>
                    </tr>
                    <tr>
                        <td>Project Details</td>
                        <td>${details}</td>
                    </tr>
                </table>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Send auto-response to the user
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for your quote request',
            text: 'Thank you for your quote request! We will review your information and get back to you shortly.'
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