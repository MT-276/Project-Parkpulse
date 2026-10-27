import requests
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ParkPulseEmailService")

BREVO_API_KEY = ""
BREVO_URL = "https://api.brevo.com/v3/smtp/email"

def build_ml_email(title: str, greeting: str, message: str, details_dict: dict = None, footer_note: str = None, otp_code: str = None) -> str:
    """
    Generates a clean HTML email template with official ParkPulse branding.
    """
    details_html = ""
    if details_dict:
        rows_html = ""
        for key, val in details_dict.items():
            rows_html += f"""
            <tr>
              <td style="padding: 8px 0; color: #747f8d; font-size: 14px; font-weight: 500;">{key}:</td>
              <td style="padding: 8px 0; color: #2e3338; font-size: 14px; font-weight: 700; text-align: right;">{val}</td>
            </tr>
            """
        details_html = f"""
        <div style="background-color: #f8f9fa; border: 1px solid #e3e5e8; border-radius: 12px; padding: 18px 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            {rows_html}
          </table>
        </div>
        """

    otp_html = ""
    if otp_code:
        otp_html = f"""
        <div style="text-align: center; margin: 28px 0; padding: 24px 20px; background: linear-gradient(135deg, rgba(134, 47, 231, 0.08) 0%, rgba(226, 43, 164, 0.08) 100%); border: 1.5px dashed #862fe7; border-radius: 16px;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #862fe7; margin-bottom: 8px;">
            One-Time Verification Code
          </div>
          <div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #111827; margin: 6px 0;">
            {otp_code}
          </div>
          <div style="font-size: 13px; color: #6b7589; margin-top: 8px;">
            Valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </div>
        </div>
        """

    footer_text = footer_note or "Thank you for choosing ParkPulse Smart Parking System."

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f3f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; background-color: #f2f3f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Logo Header -->
        <div style="margin-bottom: 24px; text-align: center;">
          <img src="https://parkpulse.meitsant.dev/assets/ParkPlus-Logo-Transparent-WithText-B-sFhPkH.png" alt="ParkPulse" style="height: 120px; width: auto; display: inline-block; vertical-align: middle;" />
        </div>

        <!-- Main Card Container -->
        <div style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e3e5e8; padding: 36px 30px; text-align: left; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <h2 style="margin-top: 0; margin-bottom: 14px; font-size: 22px; font-weight: 700; color: #2e3338; letter-spacing: -0.01em;">
            {greeting}
          </h2>

          <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #4f5660;">
            {message}
          </p>

          {otp_html}

          {details_html}

          <p style="margin: 0; font-size: 14px; color: #4f5660; line-height: 1.5;">
            {footer_text}
          </p>

          <hr style="border: none; border-top: 1px solid #e3e5e8; margin: 28px 0 20px 0;" />

          <div style="font-size: 12px; color: #747f8d; line-height: 1.5;">
            Need help or have questions? Visit <a href="https://parkpulse.meitsant.dev" style="color: #862fe7; text-decoration: none; font-weight: 600;">parkpulse.meitsant.dev</a> or reply to this notification.
          </div>
        </div>

        <!-- Footer Note -->
        <div style="margin-top: 20px; font-size: 12px; color: #747f8d; text-align: center;">
          Sent by ParkPulse Smart Parking System &bull; <a href="https://parkpulse.meitsant.dev" style="color: #862fe7; text-decoration: none;">meitsant.dev</a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>"""

def send_email(to_email: str, subject: str, text_content: str, html_content: str = None) -> bool:
    """
    Dispatch an email directly to the recipient via Automated Email REST API.
    """
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
    }

    payload = {
        "sender": {
            "name": "ParkPulse",
            "email": "admin@meitsant.dev",
        },
        "to": [
            {
                "email": to_email.strip(),
            }
        ],
        "subject": subject,
        "textContent": text_content,
    }

    if html_content:
        payload["htmlContent"] = html_content

    try:
        response = requests.post(
            BREVO_URL,
            headers=headers,
            json=payload,
            timeout=15,
        )
        logger.info(f"Email API status: {response.status_code} for recipient: {to_email}")
        return response.status_code in [200, 201, 202]
    except Exception as e:
        logger.error(f"Failed to dispatch email to {to_email}: {e}")
        return False

# ============================================================
# TEMPLATE NOTIFICATIONS
# ============================================================

def send_otp_email(to_email: str, otp_code: str, purpose: str = "signin") -> bool:
    """
    Sends a 6-digit OTP verification email for signing in or registering.
    """
    is_signup = purpose.lower() == "signup"
    action_text = "sign up for your ParkPulse account" if is_signup else "sign in to ParkPulse"
    subject = f"ParkPulse | Your Verification Code: {otp_code}"
    greeting = "Security Verification"
    message = f"Use the 6-digit one-time passcode below to {action_text}. For your security, this code will expire in 10 minutes."
    
    details = {
        "Authentication Type": "Email OTP Verification",
        "Target Email": to_email,
        "Requested At": datetime.now().strftime("%b %d, %Y, %I:%M %p")
    }
    footer = "If you did not request this verification code, you can safely ignore this email."
    
    html = build_ml_email(subject, greeting, message, details, footer, otp_code=otp_code)
    return send_email(to_email, subject, f"Your ParkPulse verification code is: {otp_code}", html)

def send_registration_email(user_name: str, user_email: str):
    subject = "Welcome to ParkPulse Smart Parking!"
    greeting = f"Hey, {user_name}!"
    message = "Thank you for registering with ParkPulse! Your account is now active and ready for 1-tap RFID card check-ins and instant spot pre-booking."
    details = {
        "Account Status": "Active & Verified",
        "Email": user_email,
        "Registration Date": datetime.now().strftime("%b %d, %Y, %I:%M %p")
    }
    html = build_ml_email(subject, greeting, message, details)
    return send_email(user_email, subject, message, html)

def send_reservation_confirmation_email(user_name: str, user_email: str, spot_number: str, hold_expires_at: str):
    subject = f"ParkPulse | Reservation Confirmed - {spot_number}"
    greeting = f"Hey, {user_name}!"
    message = f"Your reservation for <strong>{spot_number}</strong> is locked! You have 10 minutes to arrive at the spot and tap your RFID card to complete check-in."
    details = {
        "Reserved Spot": spot_number,
        "Hold Expiration": hold_expires_at,
        "Status": "Locked (10-Min Hold)"
    }
    html = build_ml_email(subject, greeting, message, details)
    return send_email(user_email, subject, f"Reservation confirmed for {spot_number}.", html)

def send_reservation_cancelled_email(user_name: str, user_email: str, spot_number: str):
    subject = f"ParkPulse | Reservation Cancelled - {spot_number}"
    greeting = f"Hey, {user_name}!"
    message = f"Your reservation for <strong>{spot_number}</strong> has been cancelled and the spot has been returned to the available pool."
    details = {
        "Spot Location": spot_number,
        "Status": "Cancelled & Released",
        "Cancellation Time": datetime.now().strftime("%b %d, %Y, %I:%M %p")
    }
    footer = "If you still require a parking spot, you can pre-book any open bay on the dashboard."
    html = build_ml_email(subject, greeting, message, details, footer)
    return send_email(user_email, subject, f"Reservation cancelled for {spot_number}.", html)

def send_checkin_success_email(user_name: str, user_email: str, spot_number: str, rfid_uid: str):
    subject = f"ParkPulse | Check-In Confirmed - {spot_number}"
    greeting = f"Hey, {user_name}!"
    message = f"Vehicle arrival and check-in successfully verified at <strong>{spot_number}</strong>. Your physical RFID card scan has been authenticated."
    details = {
        "Spot Location": spot_number,
        "RFID Card UID": rfid_uid or "N/A",
        "Check-In Time": datetime.now().strftime("%b %d, %Y, %I:%M %p"),
        "Session Status": "Active & Verified"
    }
    footer = "Enjoy your stay! When you leave, your spot will be automatically released."
    html = build_ml_email(subject, greeting, message, details, footer)
    return send_email(user_email, subject, f"Check-in verified at {spot_number}.", html)

def send_checkout_completed_email(user_name: str, user_email: str, spot_number: str):
    subject = f"ParkPulse | Thank You for Parking! - {spot_number}"
    greeting = f"Hey, {user_name}!"
    message = f"Thank you for using ParkPulse! Your vehicle has departed from <strong>{spot_number}</strong> and your spot has been released."
    details = {
        "Spot Location": spot_number,
        "Departure Time": datetime.now().strftime("%b %d, %Y, %I:%M %p"),
        "Session Status": "Completed & Spot Released"
    }
    footer = "We hope you had a smooth parking experience! See you next time."
    html = build_ml_email(subject, greeting, message, details, footer)
    return send_email(user_email, subject, f"Thank you for parking at {spot_number}.", html)

def send_wrong_spot_alert_email(user_name: str, user_email: str, spot_number: str):
    subject = f"⚠️ ParkPulse Alert | Unauthorized Occupancy Warning - {spot_number}"
    greeting = f"Hey, {user_name}!"
    message = f"<strong>WARNING:</strong> An unauthorized vehicle or unverified card tap was detected at <strong>{spot_number}</strong>."
    details = {
        "Spot Location": spot_number,
        "Alert Type": "Unauthorized Occupancy",
        "Detection Time": datetime.now().strftime("%b %d, %Y, %I:%M %p")
    }
    footer = "If this was a mistake, please relocate your vehicle or tap your physical RFID card to verify."
    html = build_ml_email(subject, greeting, message, details, footer)
    return send_email(user_email, subject, f"Unauthorized occupancy warning at {spot_number}.", html)

def send_hold_expired_email(user_name: str, user_email: str, spot_number: str):
    subject = f"ParkPulse | Reservation Expired - {spot_number}"
    greeting = f"Hey, {user_name}!"
    message = f"Your 10-minute hold window for <strong>{spot_number}</strong> has expired. The spot has been released back into the public pool."
    details = {
        "Spot Location": spot_number,
        "Status": "Hold Expired & Released"
    }
    html = build_ml_email(subject, greeting, message, details)
    return send_email(user_email, subject, f"Reservation for {spot_number} expired.", html)

def send_test_notification_email(to_email: str):
    subject = "ParkPulse | Automated Notification Service Test"
    greeting = "Hello!"
    message = "This is an automated test notification from the ParkPulse Smart Parking System. All real-time email notification services are active and fully operational."
    details = {
        "Service Status": "Active & Operational",
        "Recipient Email": to_email,
        "Test Timestamp": datetime.now().strftime("%b %d, %Y, %I:%M %p")
    }
    footer = "You can safely ignore this automated system test."
    html = build_ml_email(subject, greeting, message, details, footer)
    return send_email(to_email, subject, "ParkPulse notification test.", html)
