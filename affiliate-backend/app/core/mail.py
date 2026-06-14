import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_otp_email(to_email: str, full_name: str, otp_code: str) -> bool:
    # Log the OTP code to console/logs for easy debugging and testing in local environment
    print(f"[MAIL] OTP code generated for {to_email}: {otp_code}")
    
    try:
        msg = MIMEMultipart()
        msg['From'] = f'"{settings.MAIL_FROM_NAME}" <{settings.MAIL_FROM_ADDRESS}>'
        msg['To'] = to_email
        msg['Subject'] = f"{otp_code} is your BHE Uni Verification Code"

        body = f"""Dear {full_name},

Thank you for your interest in joining the BHE Uni Ambassador & Rewards Programme.

Please use the following 6-digit One-Time Password (OTP) to verify your email address and complete your registration:

{otp_code}

This code is valid for 10 minutes. If you did not request this code, please ignore this email.

Best regards,
The BHE Uni Team
"""
        msg.attach(MIMEText(body, 'plain'))

        # Standard SMTP connection
        server = smtplib.SMTP(settings.MAIL_HOST, settings.MAIL_PORT, timeout=10)
        
        # Start TLS if encryption is set to tls
        if settings.MAIL_ENCRYPTION.lower() == "tls":
            server.starttls()
            
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.sendmail(settings.MAIL_FROM_ADDRESS, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        # Gracefully handle sending failures so it does not crash backend API
        print(f"[MAIL ERROR] Failed to send OTP email to {to_email}: {str(e)}")
        return False
