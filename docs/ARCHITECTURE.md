# System Architecture

RedDrop AI employs a robust, scalable client-server architecture. Following the migration from MongoDB to MySQL, the backend now leverages a fully normalized relational database, ensuring ACID compliance, data integrity, and high-performance geospatial querying.

---

## 1. System Architecture Diagram

This diagram illustrates the high-level interaction between the mobile client, the REST API, the real-time server, and external services.

```mermaid
flowchart LR
  Mobile[React Native Mobile App] <-->|REST API| API[Express.js Backend]
  Mobile <-->|WebSockets| Realtime[Socket.io Server]
  API <-->|mysql2/promise| DB[(MySQL Database)]
  API --> Email[SMTP Email Service]
  API --> Cloudinary[Cloudinary Media Storage]
  Realtime --> API
```

---

## 2. Entity-Relationship (ER) & Database Relationship Diagram

The normalized MySQL database schema ensures structured relationships between users, donors, blood requests, and notifications.

```mermaid
erDiagram
    USERS ||--o| DONORS : "has profile"
    USERS ||--o{ BLOOD_REQUESTS : "creates"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ REQUEST_TIMELINES : "updates"
    
    DONORS ||--o{ ASSIGNED_DONORS : "participates in"
    BLOOD_REQUESTS ||--o{ ASSIGNED_DONORS : "has"
    BLOOD_REQUESTS ||--o{ REQUEST_TIMELINES : "tracks"
    
    USERS {
        int id PK
        string name
        string email
        string phone
        string password
        enum role
        boolean is_active
        datetime created_at
    }
    DONORS {
        int id PK
        int user_id FK
        boolean is_available
        decimal hemoglobin_level
        int total_donations
    }
    BLOOD_REQUESTS {
        int id PK
        int requester_id FK
        string patient_name
        enum blood_group
        enum status
        int units_required
    }
    ASSIGNED_DONORS {
        int id PK
        int request_id FK
        int donor_id FK
        enum status
        decimal distance
    }
    NOTIFICATIONS {
        int id PK
        int recipient_id FK
        string type
        string title
        string body
        boolean is_read
    }
    REQUEST_TIMELINES {
        int id PK
        int request_id FK
        string status
        string note
    }
```

---

## 3. Authentication Flow Diagram

This sequence details the secure registration and JWT-based authentication flow, including OTP verification via Email.

```mermaid
sequenceDiagram
    participant User
    participant MobileApp
    participant API
    participant MySQL
    participant Nodemailer
    
    User->>MobileApp: Fills Registration Form
    MobileApp->>API: POST /api/auth/register
    API->>MySQL: Check existing email/phone
    MySQL-->>API: Not found (Valid)
    API->>API: bcrypt.hash(password)
    API->>API: generateOTP()
    API->>MySQL: INSERT INTO users (pending verification)
    API->>Nodemailer: Send OTP Email
    Nodemailer-->>User: Delivers OTP Code
    API-->>MobileApp: Return JWT Token (unverified)
    
    User->>MobileApp: Enters OTP Code
    MobileApp->>API: POST /api/auth/verify-otp
    API->>MySQL: Verify OTP & set is_verified = TRUE
    API-->>MobileApp: Verification Success
```

---

## 4. Blood Request Sequence Diagram

This diagram visualizes the lifecycle of a blood request, from creation to finding and notifying nearby eligible donors using MySQL geospatial logic.

```mermaid
sequenceDiagram
    participant Requester
    participant API
    participant MySQL
    participant SocketServer
    participant Donor
    
    Requester->>API: POST /api/requests (Blood Group, Location)
    API->>MySQL: INSERT INTO blood_requests
    MySQL-->>API: Return Request ID
    
    Note over API,MySQL: Geospatial Matching (Haversine Formula)
    API->>MySQL: SELECT nearby available donors matching blood type
    MySQL-->>API: List of Eligible Donors
    
    loop For Each Eligible Donor
        API->>MySQL: INSERT INTO assigned_donors (status: pending)
        API->>MySQL: INSERT INTO notifications
        API->>SocketServer: Emit 'blood_request_nearby'
        SocketServer-->>Donor: Push Notification
    end
    
    Donor->>API: POST /api/requests/:id/respond (Accept)
    API->>MySQL: UPDATE assigned_donors (status: accepted)
    API->>MySQL: UPDATE blood_requests (status: donor_found)
    API->>SocketServer: Emit 'donor_accepted'
    SocketServer-->>Requester: Real-time Update Received
```

---

## Architecture Layers Overview

- **Mobile Client:** Built with React Native (Expo). Utilizes React Query for API state management and caching, and `socket.io-client` for real-time tracking.
- **API Gateway / Controllers:** Express.js handles incoming HTTP REST requests. Controllers execute business logic and interact directly with the database pool.
- **Database Layer:** `mysql2/promise` provides asynchronous database connectivity using a connection pool for efficiency.
- **Security:** `helmet`, `cors`, `express-rate-limit`, `bcryptjs`, and `jsonwebtoken` protect the API against common vulnerabilities.
