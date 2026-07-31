# 🩸 RedDrop AI V2 — Enterprise API Standards Specification (Phase 4)

> **Role:** Lead Backend Architect & API Designer  
> **Status:** Phase 4 Complete (Awaiting User Review & Approval)  
> **Standards Compliance:** RESTful, OpenAPI 3.0, RFC 7807 Error Details, DTO/Mapper Layer  

---

## 1. Core API Philosophy & REST Guidelines

All V2 APIs strictly adhere to REST principles:
- **Nouns over Verbs:** URLs represent resources in plural format (e.g., `/api/v2/requests`, `/api/v2/donors`, `/api/v2/camps`).
- **Standard HTTP Verbs:**
  - `GET`: Idempotent resource fetching (zero side-effects).
  - `POST`: Resource creation or action triggers.
  - `PUT`: Complete resource replacement.
  - `PATCH`: Partial resource updates.
  - `DELETE`: Resource removal.
- **Versioning Strategy:** `/api/v2/` namespace for all V2 endpoints while preserving non-breaking backward compatibility with `/api/` for V1 endpoints.

---

## 2. Standard Response & Error Envelope Contracts

### Success Response Envelope
All successful HTTP responses (HTTP 200, 201) output a unified JSON envelope:

```json
{
  "success": true,
  "code": 200,
  "message": "Nearby donors retrieved successfully.",
  "data": {
    "donors": []
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "meta": {
    "timestamp": "2026-07-31T15:12:00.000Z",
    "requestId": "req_9f8e7d6c"
  }
}
```

### Error Response Envelope (RFC 7807 Details)
All error responses (HTTP 4xx, 5xx) return a structured error payload:

```json
{
  "success": false,
  "code": 400,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid request parameters.",
    "details": [
      {
        "field": "phone",
        "message": "Valid 10-digit mobile number required."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-31T15:12:00.000Z",
    "requestId": "req_9f8e7d6c"
  }
}
```

#### Standard Error Types Table
| HTTP Status | Error Type | Description |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body or query failed validation |
| 401 | `UNAUTHORIZED` | Invalid or missing JWT Bearer token |
| 403 | `FORBIDDEN` | Insufficient role permissions |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Resource collision (e.g., email already registered) |
| 429 | `TOO_MANY_REQUESTS` | Rate limit threshold exceeded |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server failure |

---

## 3. Query Standards: Pagination, Filtering & Sorting

### 1. Pagination Standard
Query parameters: `?page=1&limit=20` (Default: `page=1`, `limit=20`, Max Limit: `100`).

### 2. Filtering Standard
Query parameters use direct keys or field indexing:
- `?bloodGroup=O+`
- `?emergencyLevel=critical`
- `?city=Delhi`

### 3. Sorting Standard
Query parameter: `?sort=-created_at,emergency_level` (`-` prefix indicates descending order).

---

## 4. Authentication, Authorization & Security Standards

### Authentication Header
```http
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Access Control (RBAC Middleware)
Routes declare strict role guards:
```javascript
router.post('/v2/camps', authenticate, authorize('organization', 'hospital', 'admin'), createCampController);
```

### Rate Limiting Standards
- **General APIs:** 100 requests per 15-minute window per IP.
- **Auth APIs (`/login`, `/register`, `/verify-otp`):** 5 requests per 15-minute window per IP.

---

## 5. DTO & Mapper Architectural Pattern

To guarantee zero internal SQL column leakage (e.g., hiding `otp_code_hash`, internal auto-increment IDs), all controllers utilize explicit **Data Transfer Objects (DTOs)** and **Response Mappers**.

```
Request ──> Input Validator ──> Request DTO ──> Controller/Service ──> Response Mapper ──> JSON Response
```

### Example: User Response Mapper (`mappers/user.mapper.js`)
```javascript
class UserMapper {
  toResponse(user, profile = {}, roles = []) {
    return {
      id: user.id,
      email: user.email,
      emailVerified: Boolean(user.email_verified),
      name: profile.name || null,
      phone: profile.phone || null,
      bloodGroup: profile.blood_group || null,
      avatarUrl: profile.avatar_url || null,
      roles: roles,
      isActive: Boolean(user.is_active),
      createdAt: user.created_at
    };
  }
}
```

---

## 6. OpenAPI 3.0 Specification Structure

All API routes generate OpenAPI documentation accessible at `/api-docs` via `swagger-ui-express`.

```yaml
openapi: 3.0.0
info:
  title: RedDrop AI Enterprise API
  version: 2.0.0
  description: Emergency Blood Donation Platform API
paths:
  /api/v2/requests:
    post:
      summary: Create Emergency Blood Request
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRequestDTO'
```

---

## Phase 4 Architecture Review, Risks & Approval

### Architecture Review
The V2 API Standards enforce uniform JSON envelopes, RFC 7807 error codes, mandatory DTO validation, and Response Mappers to prevent sensitive internal database column leakage.

### Identified Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Breaking legacy V1 mobile app clients | Coexist `/api/v1/` routes alongside clean `/api/v2/` endpoints |
| Unhandled controller exceptions leaking stack traces | Global Express Error Middleware wrapping all async handlers |

---

## Phase 4 Approval Checklist

- [x] Standard Success & Error Envelopes Outlined
- [x] Pagination, Filtering & Sorting Parameters Defined
- [x] Authentication & RBAC Middleware Standards Established
- [x] Rate Limiting Rules Assigned
- [x] DTO & Mapper Architecture Specified
- [x] OpenAPI 3.0 Guidelines Documented
- [x] Architecture Review & Risk Audit Completed

*Phase 4 is complete and ready for review. Pending approval to proceed to Phase 5 (Folder Structure).*
