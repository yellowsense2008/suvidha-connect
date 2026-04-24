# API Design Document
## SUVIDHA Connect – Backend Integration Specification
**Version:** 1.0 | **Date:** 2026 

---

## 1. Overview

This document defines the REST API contracts for SUVIDHA Connect's future backend integration. The frontend TypeScript interfaces in `src/lib/mockData.ts` are designed to mirror these schemas exactly, enabling zero-UI-change migration from mock to live APIs.

**Base URL:** `https://api.suvidha-connect.gov.in/v1`  
**Auth:** Bearer token (JWT) in `Authorization` header  
**Format:** JSON  

---

## 2. Authentication APIs

### POST /auth/otp/request
Request OTP for mobile login.
```json
Request:  { "mobile": "9876543210" }
Response: { "success": true, "expiresIn": 300 }
```

### POST /auth/otp/verify
```json
Request:  { "mobile": "9876543210", "otp": "123456" }
Response: { "token": "<jwt>", "citizen": { "id": "C001", "name": "<name>", "mobile": "98XXXXX210" } }
```

### POST /auth/consumer/login
```json
Request:  { "consumerId": "ELEC2024001", "pin": "1234" }
Response: { "token": "<jwt>", "citizen": { "id": "C001", "name": "<name>", "consumerId": "ELEC2024001" } }
```

### POST /auth/admin/login
```json
Request:  { "username": "admin", "password": "<password>" }
Response: { "token": "<jwt>", "role": "admin" }
```

### POST /auth/logout
```json
Request:  {} (Bearer token in header)
Response: { "success": true }
```

---

## 3. Bill Payment APIs

### GET /bills/{serviceType}
Fetch current bill. `serviceType`: `electricity` | `gas` | `water`
```json
Response: {
  "billId": "BILL-2024-001",
  "consumerId": "ELEC2024001",
  "serviceType": "electricity",
  "amount": 1250.00,
  "dueDate": "2026-04-15",
  "units": 320,
  "history": [
    { "month": "Jan", "units": 290, "amount": 1100 },
    { "month": "Feb", "units": 310, "amount": 1180 }
  ]
}
```

### POST /bills/{billId}/pay
```json
Request:  { "paymentMethod": "UPI", "upiId": "<upi-id>" }
Response: {
  "receiptId": "RCP-2024-001",
  "transactionId": "TXN-ABC123",
  "amount": 1250.00,
  "timestamp": "2026-03-24T10:30:00Z",
  "integrityHash": "sha256:<hash>",
  "receiptUrl": "/receipts/RCP-2024-001.pdf"
}
```

### GET /receipts/{receiptId}
Returns PDF receipt as binary stream.

---

## 4. Complaint APIs

### POST /complaints
```json
Request: {
  "serviceType": "electricity",
  "category": "power_outage",
  "description": "No power since 6 hours",
  "location": { "address": "<address>", "pincode": "781001" },
  "isEmergency": false
}
Response: {
  "referenceId": "COMP-2024-001",
  "status": "registered",
  "estimatedResolution": "2026-03-26",
  "integrityHash": "sha256:<hash>"
}
```

### GET /complaints/{referenceId}
```json
Response: {
  "referenceId": "COMP-2024-001",
  "status": "in_progress",
  "timeline": [
    { "status": "registered", "timestamp": "2026-03-24T10:00:00Z" },
    { "status": "assigned", "timestamp": "2026-03-24T11:00:00Z" },
    { "status": "in_progress", "timestamp": "2026-03-24T14:00:00Z" }
  ]
}
```

---

## 5. New Connection APIs

### POST /connections/apply
```json
Request: {
  "serviceType": "electricity",
  "applicantName": "<name>",
  "address": "<address>",
  "documents": ["<base64-doc1>", "<base64-doc2>"]
}
Response: {
  "applicationId": "APP-2024-001",
  "status": "submitted",
  "estimatedDays": 15
}
```

### GET /connections/{applicationId}
Returns application status and timeline.

---

## 6. Admin APIs

### GET /admin/analytics
```json
Response: {
  "totalTransactions": 1240,
  "totalComplaints": 89,
  "resolvedComplaints": 72,
  "activeKiosks": 12,
  "serviceBreakdown": {
    "electricity": 540, "gas": 320, "water": 280, "municipal": 100
  }
}
```

### GET /admin/audit-logs
Query params: `?page=1&limit=50&kioskId=KIOSK-001`
```json
Response: {
  "logs": [
    { "id": "LOG-001", "action": "bill_payment", "kioskId": "KIOSK-001", "timestamp": "...", "hash": "sha256:<hash>" }
  ],
  "total": 500
}
```

### POST /admin/alerts
```json
Request:  { "title": "Water supply disruption", "message": "...", "severity": "high", "expiresAt": "2026-03-25" }
Response: { "alertId": "ALERT-001", "success": true }
```

### GET /admin/threats
```json
Response: {
  "threats": [
    { "type": "brute_force", "kioskId": "KIOSK-003", "attempts": 8, "timestamp": "...", "severity": "high" }
  ]
}
```

---

## 7. Integrity Ledger API

### GET /ledger
```json
Response: {
  "entries": [
    {
      "id": "LED-001",
      "type": "payment",
      "referenceId": "RCP-2024-001",
      "hash": "sha256:<hash>",
      "previousHash": "sha256:<prev-hash>",
      "timestamp": "2026-03-24T10:30:00Z"
    }
  ]
}
```

---

## 8. Error Response Format

All errors follow a consistent format:
```json
{
  "error": {
    "code": "AUTH_INVALID_OTP",
    "message": "The OTP entered is incorrect or has expired.",
    "timestamp": "2026-03-24T10:30:00Z"
  }
}
```

### Standard Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_INVALID_OTP | 401 | OTP mismatch or expired |
| AUTH_INVALID_CREDENTIALS | 401 | Wrong Consumer ID or PIN |
| AUTH_SESSION_EXPIRED | 401 | JWT expired |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| VALIDATION_ERROR | 400 | Invalid request body |
| NOT_FOUND | 404 | Resource not found |
| SERVER_ERROR | 500 | Internal server error |
