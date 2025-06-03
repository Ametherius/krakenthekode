require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('./'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail app password
    }
});

// Handle form submission
app.post('/submit-quote', async (req, res) => {
    try {
        const { email, project_type, pages, domain, timeline, details } = req.body;

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

// Add a catch-all route to serve the main HTML file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'request-quote.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 