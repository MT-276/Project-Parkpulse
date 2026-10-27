import sqlite3
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "parkpulse.db")

def get_db_connection():
    """Establish connection to SQLite3 database with WAL mode and row factory enabled."""
    conn = sqlite3.connect(DB_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def init_db():
    """Initialize database tables and seed default 3-spot lot, OTPs, sessions, and user accounts."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Table 1: Users (Non-unique RFID allowed for testing/multiple accounts)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        rfid_uid TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        strikes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Ensure users table does NOT enforce unique rfid_uid
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users';")
    row = cursor.fetchone()
    if row and "rfid_uid TEXT UNIQUE" in row["sql"]:
        cursor.execute("PRAGMA foreign_keys = OFF;")
        cursor.execute("DROP TABLE IF EXISTS users_temp;")
        cursor.execute("CREATE TABLE users_temp AS SELECT * FROM users;")
        cursor.execute("DROP TABLE users;")
        cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            rfid_uid TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            strikes INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        cursor.execute("""
        INSERT INTO users (id, name, email, phone, rfid_uid, role, strikes, created_at)
        SELECT id, name, email, phone, rfid_uid, role, strikes, created_at FROM users_temp;
        """)
        cursor.execute("DROP TABLE users_temp;")
        cursor.execute("PRAGMA foreign_keys = ON;")
        conn.commit()

    # Check and add role column if missing in existing table
    cursor.execute("PRAGMA table_info(users);")
    columns = [r["name"] for r in cursor.fetchall()]
    if "role" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';")

    # Table 2: Spots (3 physical spots)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS spots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spot_number TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        is_occupied INTEGER DEFAULT 0,
        current_rfid_uid TEXT,
        distance_cm REAL DEFAULT 0.0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Table 3: Reservations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        spot_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'HOLD',
        hold_expires_at TIMESTAMP NOT NULL,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        duration_hours REAL DEFAULT 1.0,
        amount_paid REAL DEFAULT 20.0,
        checkin_time TIMESTAMP,
        checkout_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(spot_id) REFERENCES spots(id)
    );
    """)

    # Migration checks for reservations table
    cursor.execute("PRAGMA table_info(reservations);")
    res_columns = [row[1] for row in cursor.fetchall()]
    if 'start_time' not in res_columns:
        cursor.execute("ALTER TABLE reservations ADD COLUMN start_time TIMESTAMP;")
    if 'end_time' not in res_columns:
        cursor.execute("ALTER TABLE reservations ADD COLUMN end_time TIMESTAMP;")
    if 'duration_hours' not in res_columns:
        cursor.execute("ALTER TABLE reservations ADD COLUMN duration_hours REAL DEFAULT 1.0;")
    if 'amount_paid' not in res_columns:
        cursor.execute("ALTER TABLE reservations ADD COLUMN amount_paid REAL DEFAULT 20.0;")

    # Table 4: Hardware Logs / Audit Trail
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hardware_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spot_id INTEGER,
        event_type TEXT NOT NULL,
        payload TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Table 5: OTP Verifications
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        purpose TEXT NOT NULL,
        payload TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Table 6: User Sessions (Cookie-Based)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
    """)

    conn.commit()

    # Seed Default Users & Ensure Admin Role for admin@meitsant.dev and meitsant@gmail.com
    default_users = [
        ("ParkPulse Admin", "admin@meitsant.dev", "+919876543210", "NULL", "admin"),
        ("ParkPulse Admin", "meitsant@gmail.com", "+919876543210", "7EF53EA9", "admin"),
        ("Aarush Vardhan", "aarushvardhan0@gmail.com", "+919876543211", "0CEFF28F", "user"),
        ("Goutham Krishna", "goutham.krishna2024@vitstudent.ac.in", "+919876543212", "F3C291A8", "user")
    ]

    for name, email, phone, rfid_uid, role in default_users:
        cursor.execute("SELECT id, role FROM users WHERE email = ?;", (email,))
        existing = cursor.fetchone()
        if not existing:
            cursor.execute(
                "INSERT INTO users (name, email, phone, rfid_uid, role) VALUES (?, ?, ?, ?, ?);",
                (name, email, phone, rfid_uid, role)
            )
        else:
            if role == "admin" and existing["role"] != "admin":
                cursor.execute("UPDATE users SET role = 'admin', name = 'ParkPulse Admin' WHERE email = ?;", (email,))
    conn.commit()

    # Seed Default 3 Spots if empty
    cursor.execute("SELECT COUNT(*) FROM spots;")
    if cursor.fetchone()[0] == 0:
        default_spots = [
            ("Spot 1", "AVAILABLE", 0, 0.0),
            ("Spot 2", "AVAILABLE", 0, 0.0),
            ("Spot 3", "AVAILABLE", 0, 0.0)
        ]
        cursor.executemany(
            "INSERT INTO spots (spot_number, status, is_occupied, distance_cm) VALUES (?, ?, ?, ?);",
            default_spots
        )
        conn.commit()

    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
