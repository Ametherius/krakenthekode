from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import json

app = Flask(__name__)

def send_email(to_email, subject, html_content):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = os.environ.get('EMAIL_USER')
    msg['To'] = to_email
    
    html_part = MIMEText(html_content, 'html')
    msg.attach(html_part)
    
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(os.environ.get('EMAIL_USER'), os.environ.get('EMAIL_PASS'))
        server.send_message(msg)

@app.route('/api/submit-quote', methods=['POST', 'OPTIONS'])
def submit_quote():
    # Set CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    # Handle preflight request
    if request.method == 'OPTIONS':
        return ('', 204, headers)
    
    print('Received request:', {
        'method': request.method,
        'headers': dict(request.headers),
        'body': request.get_json()
    })
    
    # Only allow POST requests
    if request.method != 'POST':
        print('Method not allowed:', request.method)
        return jsonify({'error': 'Method not allowed'}), 405, headers
    
    try:
        # Check if environment variables are set
        if not os.environ.get('EMAIL_USER') or not os.environ.get('EMAIL_PASS'):
            print('Missing email configuration')
            return jsonify({'error': 'Server configuration error'}), 500, headers
        
        # Parse form data
        try:
            form_data = request.get_json()
            print('Parsed form data:', {**form_data, 'email': '[REDACTED]'})
        except Exception as e:
            print('Error parsing form data:', str(e))
            return jsonify({'error': 'Invalid form data'}), 400, headers
        
        email = form_data.get('email')
        project_type = form_data.get('project_type')
        pages = form_data.get('pages')
        domain = form_data.get('domain')
        timeline = form_data.get('timeline')
        details = form_data.get('details')
        
        # Basic validation
        if not all([email, project_type, pages, domain, timeline, details]):
            print('Validation failed:', {
                'email': bool(email),
                'project_type': bool(project_type),
                'pages': bool(pages),
                'domain': bool(domain),
                'timeline': bool(timeline),
                'details': bool(details)
            })
            return jsonify({'error': 'All fields are required'}), 400, headers
        
        # Admin notification email
        admin_html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; border-radius: 8px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; z-index: 0;">
                    <img src="https://krakenthekode.com/images/background.png" alt="Kraken The Kode" style="width: 400px; height: auto;">
                </div>
                <div style="position: relative; z-index: 1;">
                    <h2 style="color: #2b0049; margin-bottom: 20px; text-align: center;">New Quote Request</h2>
                    
                    <div style="background-color: #2d2d2d; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Email</p>
                        <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">{email}</p>
                        
                        <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Project Type</p>
                        <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">{project_type}</p>
                        
                        <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Number of Pages</p>
                        <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">{pages}</p>
                        
                        <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Domain Requirements</p>
                        <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">{domain}</p>
                        
                        <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Timeline</p>
                        <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0;">{timeline}</p>
                        
                        <p style="color: #2b0049; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;">Project Details</p>
                        <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px 0; white-space: pre-wrap;">{details}</p>
                    </div>
                    
                    <p style="text-align: center; margin-top: 20px; color: #2b0049; font-size: 12px;">
                        This email was sent from the Kraken The Kode quote request form.
                    </p>
                </div>
            </div>
        """
        
        # Send admin notification
        send_email('info.krakenthekode@gmail.com', 'New Quote Request', admin_html)
        print('Admin notification email sent successfully')
        
        # User confirmation email
        user_html = f"""
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
        """
        
        # Send user confirmation
        send_email(email, 'Thank you for your quote request', user_html)
        print('User confirmation email sent successfully')
        
        return jsonify({'success': True}), 200, headers
        
    except Exception as e:
        print('Error processing request:', str(e))
        return jsonify({'error': 'Error processing request'}), 500, headers

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080))) 