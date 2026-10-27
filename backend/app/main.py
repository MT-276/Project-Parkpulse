from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, timezone
import json
import logging
import secrets
import random

from app.database import get_db_connection, init_db
from app.schemas import (
    UserCreate, UserResponse,
    SpotResponse,
    ReservationCreate, ReservationResponse,
    HardwareUpdatePayload, HardwareLogResponse,
    TestEmailPayload,
    SendOtpPayload, VerifyOtpPayload, AuthStatusResponse
)
from app.email_service import (
    send_email,
    send_otp_email,
    send_registration_email,
    send_reservation_confirmation_email,
    send_reservation_cancelled_email,
    send_checkin_success_email,
    send_checkout_completed_email,
    send_wrong_spot_alert_email,
    send_hold_expired_email,
    send_test_notification_email
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ParkPulseBackend")

# Pin all timestamps to IST (UTC+5:30) so behavior is identical
# whether running locally in India or on a UTC VPS.
IST = timezone(timedelta(hours=5, minutes=30))

app = FastAPI(
    title="ParkPulse Backend API",
    description="Smart Parking Reservation System FastAPI Server with Session & OTP Auth",
    version="2.0.0"
)

# Enable CORS with credentials for local Vite and production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1147",
        "http://127.0.0.1:1147",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://parkpulse.meitsant.dev"
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    logger.info("ParkPulse database initialized and server ready.")

# ============================================================================
# AUTHENTICATION & SESSION HELPERS
# ============================================================================

ADMIN_EMAILS = {"meitsant@gmail.com", "admin@meitsant.dev"}

def get_current_user_optional(request: Request):
    """
    Extracts the authenticated user from the session_id cookie or Authorization header.
    Returns user dict if valid session found, else None.
    Retrieves the user from the session cookie without raising an exception if unauthenticated.
    """
    session_id = request.cookies.get("session_id")
    if not session_id:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_id = auth_header.split(" ")[1]

    if not session_id:
        return None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.*, s.role as session_role
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_id = ? AND s.expires_at > CURRENT_TIMESTAMP;
    """, (session_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    user_dict = dict(row)
    # Check if user is a designated ParkPulse Admin
    if user_dict.get("email") in ADMIN_EMAILS:
        user_dict["role"] = "admin"
    else:
        user_dict["role"] = user_dict.get("role") or user_dict.get("session_role") or "user"
    return user_dict

def get_current_user(request: Request):
    """
    Requires an active authenticated session.
    """
    user = get_current_user_optional(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in."
        )
    return user

def require_admin(request: Request):
    """
    Requires admin privileges.
    """
    user = get_current_user(request)
    if user.get("role") != "admin" and user.get("email") not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to access developer controls."
        )
    return user

def expire_overdue_holds(conn):
    """Auto-expire 10-minute hold reservations past their expiration timestamp."""
    cursor = conn.cursor()
    now_str = datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        SELECT r.id as res_id, r.user_id, r.spot_id, u.name as user_name, u.email as user_email, s.spot_number
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN spots s ON r.spot_id = s.id
        WHERE r.status = 'HOLD' AND r.hold_expires_at < ?;
    """, (now_str,))

    overdue = cursor.fetchall()
    for row in overdue:
        res_id = row['res_id']
        spot_id = row['spot_id']
        user_name = row['user_name']
        user_email = row['user_email']
        spot_number = row['spot_number']

        # Update reservation status to EXPIRED
        cursor.execute("UPDATE reservations SET status = 'EXPIRED' WHERE id = ?;", (res_id,))
        # Reset spot status if it was still in HOLD
        cursor.execute("UPDATE spots SET status = 'AVAILABLE' WHERE id = ? AND status = 'HOLD';", (spot_id,))
        # Log event
        cursor.execute(
            "INSERT INTO hardware_logs (spot_id, event_type, payload) VALUES (?, ?, ?);",
            (spot_id, "HOLD_EXPIRED", json.dumps({"reservation_id": res_id, "user_email": user_email}))
        )
        conn.commit()

        # Dispatch notification email
        try:
            send_hold_expired_email(user_name, user_email, spot_number)
        except Exception as e:
            logger.error(f"Failed to send expiration email: {e}")

# ============================================================================
# ROOT & HEALTH
# ============================================================================

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "ParkPulse Smart Parking Backend",
        "version": "2.0.0",
        "endpoints": {
            "docs": "/docs",
            "auth_me": "/api/auth/me",
            "spots": "/api/spots",
            "hardware_update": "/api/hardware/update"
        }
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now(IST).isoformat()}

# ============================================================================
# AUTHENTICATION & OTP ENDPOINTS
# ============================================================================

@app.post("/api/auth/send-otp")
def send_otp(payload: SendOtpPayload):
    """
    Generate and dispatch a 6-digit numeric OTP code to the requested email.
    Supports 'signin' and 'signup' flows.
    """
    email = payload.email.strip().lower()
    purpose = payload.purpose.strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    if purpose == "signin":
        # Check if user exists (or is admin)
        cursor.execute("SELECT id FROM users WHERE email = ?;", (email,))
        user = cursor.fetchone()
        if not user and email not in ADMIN_EMAILS:
            conn.close()
            raise HTTPException(
                status_code=404,
                detail="No registered account found with this email. Please sign up first."
            )
    elif purpose == "signup":
        # Check if email is already taken
        cursor.execute("SELECT id FROM users WHERE email = ?;", (email,))
        if cursor.fetchone():
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="An account with this email address already exists. Please sign in instead."
            )

    # Generate secure 6-digit OTP code
    otp_code = str(random.randint(100000, 999999))
    expires_at = (datetime.now(IST) + timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S")

    # Invalidate previous OTPs for this email & purpose
    cursor.execute("DELETE FROM otps WHERE email = ? AND purpose = ?;", (email, purpose))

    # Save signup payload data if provided
    signup_data = None
    if purpose == "signup":
        signup_data = json.dumps({
            "name": payload.name or "User",
            "phone": payload.phone or "",
            "rfid_uid": payload.rfid_uid.strip().upper() if payload.rfid_uid else f"RFID_{secrets.token_hex(4).upper()}"
        })

    cursor.execute("""
        INSERT INTO otps (email, otp_code, purpose, payload, expires_at)
        VALUES (?, ?, ?, ?, ?);
    """, (email, otp_code, purpose, signup_data, expires_at))
    conn.commit()
    conn.close()

    # Dispatch email
    sent = send_otp_email(email, otp_code, purpose)
    if not sent:
        raise HTTPException(
            status_code=500,
            detail="Failed to dispatch OTP email. Please verify your email address or try again."
        )

    return {
        "status": "success",
        "message": f"A 6-digit verification code has been dispatched to {email}."
    }

@app.post("/api/auth/verify-otp")
def verify_otp(payload: VerifyOtpPayload, response: Response):
    """
    Verify 6-digit OTP code, create user account (if signup), establish database session,
    and attach HttpOnly session cookie.
    """
    email = payload.email.strip().lower()
    otp_code = payload.otp_code.strip()
    purpose = payload.purpose.strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        SELECT * FROM otps
        WHERE email = ? AND otp_code = ? AND purpose = ? AND expires_at > ?
        ORDER BY id DESC LIMIT 1;
    """, (email, otp_code, purpose, now_str))

    otp_record = cursor.fetchone()
    if not otp_record:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code. Please request a new OTP."
        )

    # If signup, create the user in the database
    if purpose == "signup":
        signup_meta = {}
        if otp_record["payload"]:
            try:
                signup_meta = json.loads(otp_record["payload"])
            except Exception:
                signup_meta = {}

        name = payload.name or signup_meta.get("name") or "New User."
        phone = payload.phone or signup_meta.get("phone") or ""
        rfid_uid = (payload.rfid_uid or signup_meta.get("rfid_uid") or f"RFID_{secrets.token_hex(4).upper()}").strip().upper()
        role = "admin" if email in ADMIN_EMAILS else "user"

        cursor.execute("SELECT id FROM users WHERE email = ?;", (email,))
        existing = cursor.fetchone()
        if not existing:
            cursor.execute("""
                INSERT INTO users (name, email, phone, rfid_uid, role)
                VALUES (?, ?, ?, ?, ?);
            """, (name, email, phone, rfid_uid, role))
            conn.commit()

    # Retrieve user record
    cursor.execute("SELECT * FROM users WHERE email = ?;", (email,))
    user_row = cursor.fetchone()

    # If user doesn't exist yet (e.g. admin logging in for the first time)
    if not user_row and email in ADMIN_EMAILS:
        cursor.execute("""
            INSERT INTO users (name, email, phone, rfid_uid, role)
            VALUES (?, ?, ?, ?, ?);
        """, ("ParkPulse Admin", email, "+919876543210", "NULL", "admin"))
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE email = ?;", (email,))
        user_row = cursor.fetchone()

    if not user_row:
        conn.close()
        raise HTTPException(status_code=404, detail="User record not found.")

    user_dict = dict(user_row)
    user_id = user_dict["id"]
    user_role = "admin" if email in ADMIN_EMAILS else (user_dict.get("role") or "user")

    # Create Session in DB (Valid for 7 days)
    session_id = secrets.token_hex(32)
    session_expires = (datetime.now(IST) + timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO sessions (session_id, user_id, role, expires_at)
        VALUES (?, ?, ?, ?);
    """, (session_id, user_id, user_role, session_expires))

    # Consume / clean up the used OTP
    cursor.execute("DELETE FROM otps WHERE email = ?;", (email,))
    conn.commit()
    conn.close()

    # Set HttpOnly Session Cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        samesite="lax",
        max_age=604800, # 7 days
        path="/"
    )

    user_dict["role"] = user_role
    return {
        "status": "success",
        "message": "Successfully authenticated.",
        "session_id": session_id,
        "user": {
            "id": user_dict["id"],
            "name": user_dict["name"],
            "email": user_dict["email"],
            "phone": user_dict.get("phone"),
            "rfid_uid": user_dict["rfid_uid"],
            "role": user_role,
            "strikes": user_dict.get("strikes", 0),
            "created_at": str(user_dict.get("created_at"))
        }
    }

@app.get("/api/auth/me")
def get_auth_profile(request: Request):
    """
    Returns the currently logged-in user profile from the session cookie.
    """
    user = get_current_user_optional(request)
    if not user:
        return {"authenticated": False, "user": None}

    return {
        "authenticated": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user.get("phone"),
            "rfid_uid": user["rfid_uid"],
            "role": user.get("role", "user"),
            "strikes": user.get("strikes", 0),
            "created_at": str(user.get("created_at"))
        }
    }

@app.post("/api/auth/logout")
def logout_user(request: Request, response: Response):
    """
    Terminates the session and deletes the session cookie.
    """
    session_id = request.cookies.get("session_id")
    if session_id:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE session_id = ?;", (session_id,))
        conn.commit()
        conn.close()

    response.delete_cookie(key="session_id", path="/")
    return {"status": "success", "message": "Logged out successfully."}

# ============================================================================
# SPOTS & RESERVATIONS
# ============================================================================

@app.get("/api/spots")
def list_spots():
    conn = get_db_connection()
    expire_overdue_holds(conn)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM spots ORDER BY id ASC;")
    rows = cursor.fetchall()

    result = []
    for row in rows:
        spot_dict = dict(row)
        spot_dict['is_occupied'] = bool(spot_dict['is_occupied'])

        # Attach active reservation details if present
        cursor.execute("""
            SELECT r.id, r.user_id, r.status as reservation_status, r.hold_expires_at, r.checkin_time, u.name as user_name, u.email as user_email
            FROM reservations r
            JOIN users u ON r.user_id = u.id
            WHERE r.spot_id = ? AND r.status IN ('HOLD', 'ACTIVE')
            ORDER BY r.id DESC LIMIT 1;
        """, (spot_dict['id'],))

        res = cursor.fetchone()
        if res:
            spot_dict['active_reservation'] = dict(res)
        else:
            spot_dict['active_reservation'] = None

        result.append(spot_dict)

    conn.close()
    return result

@app.post("/api/spots/reserve")
def reserve_spot(payload: ReservationCreate, request: Request):
    """
    Reserve an available parking spot on a 10-minute hold window.
    Binds automatically to the authenticated user.
    """
    current_user = get_current_user(request)
    target_user_id = current_user["id"]

    # If admin explicitly specifies a user_id, permit it; otherwise use authenticated user
    if payload.user_id and current_user.get("role") == "admin":
        target_user_id = payload.user_id

    conn = get_db_connection()
    expire_overdue_holds(conn)
    cursor = conn.cursor()

    # 1. Verify User exists
    cursor.execute("SELECT * FROM users WHERE id = ?;", (target_user_id,))
    user_row = cursor.fetchone()
    if not user_row:
        conn.close()
        raise HTTPException(status_code=404, detail="User account not found.")

    user = dict(user_row)

    # 2. Check if user already holds an active reservation or is parked
    cursor.execute("""
        SELECT r.id, s.spot_number FROM reservations r
        JOIN spots s ON r.spot_id = s.id
        WHERE (r.user_id = ? AND r.status IN ('HOLD', 'ACTIVE'))
           OR (s.current_rfid_uid = ? AND s.status = 'OCCUPIED');
    """, (target_user_id, user.get("rfid_uid")))
    existing_res = cursor.fetchone()
    if existing_res:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"You already have an active reservation or parking session on {existing_res['spot_number']}. You cannot reserve more than one spot simultaneously."
        )

    # 3. Check Spot availability
    cursor.execute("SELECT * FROM spots WHERE id = ?;", (payload.spot_id,))
    spot_row = cursor.fetchone()
    if not spot_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Spot not found.")

    spot = dict(spot_row)
    if spot['status'] != 'AVAILABLE' or spot['is_occupied']:
        conn.close()
        raise HTTPException(
            status_code=409,
            detail=f"{spot['spot_number']} is currently {spot['status']} and cannot be reserved."
        )

    # 4. Lock spot for 10 minutes
    now = datetime.now(IST)
    hold_expires = now + timedelta(minutes=10)
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    hold_expires_str = hold_expires.strftime("%Y-%m-%d %H:%M:%S")

    start_time = payload.start_time or now_str
    duration_hours = float(payload.duration_hours or 1.0)
    end_time = payload.end_time or (now + timedelta(hours=duration_hours)).strftime("%Y-%m-%d %H:%M:%S")
    amount_paid = float(payload.amount_paid or (20.0 + max(0.0, duration_hours - 1.0) * 5.0))

    cursor.execute("""
        INSERT INTO reservations (user_id, spot_id, status, hold_expires_at, start_time, end_time, duration_hours, amount_paid, created_at)
        VALUES (?, ?, 'HOLD', ?, ?, ?, ?, ?, ?);
    """, (target_user_id, payload.spot_id, hold_expires_str, start_time, end_time, duration_hours, amount_paid, now_str))
    res_id = cursor.lastrowid

    cursor.execute("UPDATE spots SET status = 'HOLD', last_updated = ? WHERE id = ?;", (now_str, payload.spot_id))

    cursor.execute(
        "INSERT INTO hardware_logs (spot_id, event_type, payload) VALUES (?, ?, ?);",
        (payload.spot_id, "RESERVATION_HOLD_LOCKED", json.dumps({
            "reservation_id": res_id,
            "user_id": target_user_id,
            "user_email": user['email'],
            "hold_expires_at": hold_expires_str,
            "duration_hours": duration_hours,
            "amount_paid": amount_paid
        }))
    )
    conn.commit()
    conn.close()

    # 5. Dispatch confirmation email
    try:
        send_reservation_confirmation_email(user['name'], user['email'], spot['spot_number'], hold_expires_str)
    except Exception as e:
        logger.error(f"Failed to send confirmation email: {e}")

    return {
        "id": res_id,
        "user_id": target_user_id,
        "user_name": user['name'],
        "user_email": user['email'],
        "spot_id": spot['id'],
        "spot_number": spot['spot_number'],
        "status": "HOLD",
        "hold_expires_at": hold_expires_str,
        "start_time": start_time,
        "end_time": end_time,
        "duration_hours": duration_hours,
        "amount_paid": amount_paid,
        "created_at": now_str
    }

@app.post("/api/spots/cancel")
def cancel_reservation(spot_id: int, request: Request):
    """
    Cancel an active hold reservation and release the bay.
    Normal Users can only cancel their own reservations. Admins can cancel any.
    """
    current_user = get_current_user(request)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT r.*, u.name as user_name, u.email as user_email, s.spot_number
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN spots s ON r.spot_id = s.id
        WHERE r.spot_id = ? AND r.status = 'HOLD'
        ORDER BY r.id DESC LIMIT 1;
    """, (spot_id,))

    res = cursor.fetchone()
    if not res:
        conn.close()
        raise HTTPException(status_code=404, detail="No active hold reservation found for this spot.")

    res_dict = dict(res)

    # Authorization Check
    if current_user.get("role") != "admin" and res_dict["user_id"] != current_user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="You can only cancel your own reservation.")

    now_str = datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("UPDATE reservations SET status = 'CANCELLED' WHERE id = ?;", (res_dict['id'],))
    cursor.execute("UPDATE spots SET status = 'AVAILABLE', last_updated = ? WHERE id = ?;", (now_str, spot_id))
    cursor.execute(
        "INSERT INTO hardware_logs (spot_id, event_type, payload) VALUES (?, ?, ?);",
        (spot_id, "RESERVATION_CANCELLED", json.dumps({"reservation_id": res_dict['id'], "user_email": res_dict['user_email']}))
    )
    conn.commit()
    conn.close()

    # Dispatch cancellation email
    try:
        send_reservation_cancelled_email(res_dict['user_name'], res_dict['user_email'], res_dict['spot_number'])
    except Exception as e:
        logger.error(f"Failed to dispatch cancellation email: {e}")

    return {"status": "success", "message": f"Hold reservation on {res_dict['spot_number']} cancelled."}

# ============================================================================
# HARDWARE INGESTION (Arduino R4 WiFi & Sensor Edge)
# ============================================================================

@app.post("/api/hardware/update")
def hardware_update(payload: HardwareUpdatePayload):
    """
    Ingest ultrasonic distance readings & RFID scans from the Arduino R4 gateway.
    """
    conn = get_db_connection()
    expire_overdue_holds(conn)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM spots WHERE id = ?;", (payload.spot_id,))
    spot_row = cursor.fetchone()
    if not spot_row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Spot #{payload.spot_id} not found.")

    spot = dict(spot_row)
    now_str = datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")

    prev_status = spot['status']
    prev_occupied = bool(spot['is_occupied'])
    new_occupied = payload.is_occupied
    rfid_uid = payload.rfid_uid.strip().upper() if payload.rfid_uid else None

    new_status = prev_status

    # Fetch active reservation
    cursor.execute("""
        SELECT r.*, u.name as user_name, u.email as user_email, u.rfid_uid as user_rfid
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        WHERE r.spot_id = ? AND r.status IN ('HOLD', 'ACTIVE')
        ORDER BY r.id DESC LIMIT 1;
    """, (payload.spot_id,))
    active_res = cursor.fetchone()

    # State Machine Logic
    if new_occupied:
        if active_res:
            res_dict = dict(active_res)
            if rfid_uid and rfid_uid == res_dict['user_rfid']:
                new_status = 'OCCUPIED'
                if res_dict['status'] == 'HOLD':
                    cursor.execute("""
                        UPDATE reservations
                        SET status = 'ACTIVE', checkin_time = ?
                        WHERE id = ?;
                    """, (now_str, res_dict['id']))

                    cursor.execute(
                        "INSERT INTO hardware_logs (spot_id, event_type, payload) VALUES (?, ?, ?);",
                        (payload.spot_id, "CHECKIN_SUCCESS", json.dumps({
                            "user": res_dict['user_name'],
                            "email": res_dict['user_email'],
                            "rfid_uid": rfid_uid
                        }))
                    )
                    try:
                        send_checkin_success_email(res_dict['user_name'], res_dict['user_email'], spot['spot_number'], rfid_uid)
                    except Exception as e:
                        logger.error(f"Failed to dispatch checkin email: {e}")
            elif rfid_uid and rfid_uid != res_dict['user_rfid']:
                new_status = 'WRONG_SPOT'
                cursor.execute(
                    "INSERT INTO hardware_logs (spot_id, event_type, payload) VALUES (?, ?, ?);",
                    (payload.spot_id, "WRONG_SPOT_DETECTED", json.dumps({
                        "expected_rfid": res_dict['user_rfid'],
                        "scanned_rfid": rfid_uid
                    }))
                )
                try:
                    send_wrong_spot_alert_email(res_dict['user_name'], res_dict['user_email'], spot['spot_number'])
                except Exception as e:
                    logger.error(f"Failed to send wrong spot alert: {e}")
            else:
                if prev_status == 'HOLD':
                    new_status = 'HOLD'
        else:
            if rfid_uid:
                new_status = 'WRONG_SPOT'
                cursor.execute(
                    "INSERT INTO hardware_logs (spot_id, event_type, payload) VALUES (?, ?, ?);",
                    (payload.spot_id, "UNAUTHORIZED_OCCUPANCY", json.dumps({"scanned_rfid": rfid_uid}))
                )
            else:
                new_status = 'WRONG_SPOT'
                cursor.execute(
                    "INSERT INTO hardware_logs (spot_id, event_type, payload) VALUES (?, ?, ?);",
                    (payload.spot_id, "UNAUTHORIZED_OCCUPANCY_NO_RFID", "Vehicle detected with no reservation.")
                )
    else:
        # Car departed
        if prev_occupied or prev_status in ['OCCUPIED', 'WRONG_SPOT']:
            new_status = 'AVAILABLE'
            if active_res:
                res_dict = dict(active_res)
                cursor.execute("""
                    UPDATE reservations
                    SET status = 'COMPLETED', checkout_time = ?
                    WHERE id = ?;
                """, (now_str, res_dict['id']))

                cursor.execute(
                    "INSERT INTO hardware_logs (spot_id, event_type, payload) VALUES (?, ?, ?);",
                    (payload.spot_id, "CHECKOUT_COMPLETED", json.dumps({
                        "user": res_dict['user_name'],
                        "email": res_dict['user_email']
                    }))
                )
                try:
                    send_checkout_completed_email(res_dict['user_name'], res_dict['user_email'], spot['spot_number'])
                except Exception as e:
                    logger.error(f"Failed to dispatch checkout email: {e}")
        elif prev_status == 'HOLD':
            new_status = 'HOLD'
        else:
            new_status = 'AVAILABLE'

    # Update Spot Record
    cursor.execute("""
        UPDATE spots
        SET status = ?, is_occupied = ?, current_rfid_uid = ?, distance_cm = ?, last_updated = ?
        WHERE id = ?;
    """, (new_status, 1 if new_occupied else 0, rfid_uid, payload.distance_cm, now_str, payload.spot_id))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "spot_id": payload.spot_id,
        "new_status": new_status,
        "is_occupied": new_occupied,
        "distance_cm": payload.distance_cm,
        "rfid_uid": rfid_uid
    }

# ============================================================================
# USERS & Users
# ============================================================================

@app.get("/api/users", response_model=list[UserResponse])
def list_users(request: Request):
    """
    List all users. Requires authenticated user.
    """
    get_current_user(request)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY id ASC;")
    users = [dict(u) for u in cursor.fetchall()]
    conn.close()
    return users

@app.post("/api/users")
def create_user(payload: UserCreate, request: Request):
    """
    Register a new user account.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO users (name, email, phone, rfid_uid, role)
            VALUES (?, ?, ?, ?, ?);
        """, (payload.name, payload.email.strip().lower(), payload.phone, payload.rfid_uid.strip().upper(), payload.role or "user"))
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()
        try:
            send_registration_email(payload.name, payload.email)
        except Exception:
            pass
        return {"id": new_id, "message": f"User {payload.name} created successfully."}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Failed to create user: {str(e)}")

# ============================================================================
# DEVELOPER & ADMIN CONTROLS (Protected)
# ============================================================================

@app.get("/api/logs")
def list_logs(request: Request):
    """
    Real-time database event logs stream.
    ADMIN ONLY — Standard users receive 403 Forbidden.
    """
    require_admin(request)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hardware_logs ORDER BY id DESC LIMIT 50;")
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return logs

@app.post("/api/admin/reset")
def reset_all_spots(request: Request):
    """
    Reset all 3 spots back to AVAILABLE.
    ADMIN ONLY.
    """
    require_admin(request)
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("UPDATE spots SET status = 'AVAILABLE', is_occupied = 0, current_rfid_uid = NULL, distance_cm = 0.0, last_updated = ?;", (now_str,))
    cursor.execute("UPDATE reservations SET status = 'CANCELLED' WHERE status IN ('HOLD', 'ACTIVE');")
    cursor.execute("INSERT INTO hardware_logs (event_type, payload) VALUES ('ADMIN_RESET', 'All spots reset to AVAILABLE.');")
    conn.commit()
    conn.close()
    return {"message": "All 3 spots reset to AVAILABLE successfully."}

@app.post("/api/test-email")
def test_email(payload: TestEmailPayload, request: Request):
    """
    Dispatches a sample notification email receipt.
    ADMIN ONLY.
    """
    require_admin(request)
    success = send_test_notification_email(payload.email)
    if success:
        return {"status": "success", "message": f"Test notification email dispatched to {payload.email}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test notification email.")
