# API Documentation

This reference covers the endpoints that exist in the current codebase. Some route files, such as `hospitals` and `reports`, are currently placeholders and are not documented here as public APIs yet.

## Base URL

- Local development: `http://localhost:5000/api`

## Authentication

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Sign in and receive a JWT |
| POST | `/auth/verify-otp` | Verify OTP for registration or password reset |
| POST | `/auth/resend-otp` | Request a new OTP |
| POST | `/auth/forgot-password` | Send a password reset OTP |
| POST | `/auth/reset-password` | Reset the account password |
| GET | `/auth/me` | Return the current authenticated user |

## Donors

| Method | Path | Description |
| --- | --- | --- |
| GET | `/donors/nearby` | Find nearby donors by location and filters |
| GET | `/donors/search` | Search donors |
| GET | `/donors/profile` | Fetch the authenticated donor profile |
| PUT | `/donors/profile` | Update the authenticated donor profile |
| PUT | `/donors/availability` | Toggle donor availability |
| GET | `/donors/:id` | Fetch donor details by ID |

## Requests

| Method | Path | Description |
| --- | --- | --- |
| POST | `/requests` | Create a blood request |
| GET | `/requests` | List requests for the authenticated user |
| GET | `/requests/:id` | Fetch request details |
| POST | `/requests/:id/respond` | Allow a donor to respond to a request |
| PATCH | `/requests/:id/status` | Update request status |
| POST | `/requests/:id/upload-report` | Upload a medical report file |

## Tracking

| Method | Path | Description |
| --- | --- | --- |
| GET | `/tracking/:requestId` | Fetch request tracking details and timeline |

## Notifications

| Method | Path | Description |
| --- | --- | --- |
| GET | `/notifications` | Fetch user notifications |
| PATCH | `/notifications/read` | Mark selected notifications as read |
| PATCH | `/notifications/read-all` | Mark all notifications as read |

## User

| Method | Path | Description |
| --- | --- | --- |
| PUT | `/users/profile` | Update the authenticated user profile |
| POST | `/users/avatar` | Upload a profile avatar |
| PATCH | `/users/fcm-token` | Save the device FCM token |
| GET | `/users/stats` | Fetch user statistics |

## Health Check

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Service health and uptime check |

## Authentication Rules

- Protected routes expect a Bearer token in the `Authorization` header.
- Donor-only routes require the donor role.
- File upload endpoints expect `multipart/form-data`.
