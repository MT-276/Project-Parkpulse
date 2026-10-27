from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    rfid_uid: str
    role: Optional[str] = "user"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    rfid_uid: str
    role: str = "user"
    strikes: int = 0
    created_at: str

# Auth & OTP Schemas
class SendOtpPayload(BaseModel):
    email: str
    purpose: str = "signin" # "signin" or "signup"
    name: Optional[str] = None
    phone: Optional[str] = None
    rfid_uid: Optional[str] = None

class VerifyOtpPayload(BaseModel):
    email: str
    otp_code: str
    purpose: str = "signin" # "signin" or "signup"
    name: Optional[str] = None
    phone: Optional[str] = None
    rfid_uid: Optional[str] = None

class AuthStatusResponse(BaseModel):
    authenticated: bool
    user: Optional[UserResponse] = None

# Spot Schemas
class SpotResponse(BaseModel):
    id: int
    spot_number: str
    status: str  # AVAILABLE, HOLD, OCCUPIED, WRONG_SPOT
    is_occupied: bool
    current_rfid_uid: Optional[str] = None
    distance_cm: float
    last_updated: str
    active_reservation: Optional[dict] = None

# Reservation Schemas
class ReservationCreate(BaseModel):
    user_id: Optional[int] = None # Inferred from session if not provided
    spot_id: int
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_hours: Optional[float] = 1.0
    amount_paid: Optional[float] = 20.0

class ReservationResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    spot_id: int
    spot_number: str
    status: str  # HOLD, ACTIVE, COMPLETED, CANCELLED, EXPIRED
    hold_expires_at: str
    checkin_time: Optional[str] = None
    checkout_time: Optional[str] = None
    created_at: str

# Hardware Ingestion Payload (sent by Arduino R4 WiFi)
class HardwareUpdatePayload(BaseModel):
    spot_id: int
    distance_cm: float
    is_occupied: bool
    rfid_uid: Optional[str] = None

# Hardware Log Entry Schema
class HardwareLogResponse(BaseModel):
    id: int
    spot_id: Optional[int] = None
    event_type: str
    payload: str
    timestamp: str

# Email Test Request
class TestEmailPayload(BaseModel):
    email: str
