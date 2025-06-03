# Kraken The Kode Website

A professional website for Kraken The Kode, featuring a quote request form with email notifications.

## Features

- Responsive design
- Quote request form
- Email notifications using Nodemailer
- Auto-response emails
- Modern UI with Bootstrap

## Setup

1. Clone the repository
```bash
git clone [your-repo-url]
cd kraken-the-kode
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your email credentials:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

Note: For Gmail, you'll need to use an App Password. To get one:
1. Enable 2-Step Verification in your Google Account
2. Go to Security → App passwords
3. Generate a new app password for "Mail"

4. Start the server
```bash
npm start
```

The server will run on port 3000 by default.

## Development

To run the server in development mode with auto-reload:
```bash
npm run dev
```

## Technologies Used

- Node.js
- Express
- Nodemailer
- Bootstrap 5
- HTML5/CSS3 