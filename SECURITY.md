# Security Policy - Utsav AI

## Overview
Security is an integral design principle of Utsav AI. This project implements enterprise-grade security controls across both the client-side presentation layer and the server-side API processing layer.

## Implemented Security Controls

### 1. HTTP Security Headers
- Enforced via **Helmet.js** with customized Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, X-Frame-Options, and Referrer-Policy.
- All static assets and external fonts are strictly whitelisted.

### 2. Rate Limiting & Denial-of-Service (DoS) Mitigation
- Express rate limiting (`express-rate-limit`) limits API requests per IP window (100 requests per 15 minutes).
- Payload body size capped at `25kb` to prevent buffer overflow and memory exhaustion attacks.
- HTTP Parameter Pollution prevention via `hpp` middleware.

### 3. Prompt Injection Defense
- Strict input sanitization layer parses and cleanses all user-provided strings before LLM ingestion.
- Explicit regex guards block common prompt-injection vectors (e.g., `ignore previous instructions`, `system prompt`, delimiter breakouts).
- Model parameters use strict output types (`responseMimeType: "application/json"`) preventing prompt leak or jailbreak formatting.

### 4. CORS Policy
- Explicit origin validation supporting designated production deployment domains and secure local environments.
- Wildcard cross-origin reflection is strictly disallowed.

### 5. Secret Management
- API tokens (`GEMINI_API_KEY`) are exclusively maintained in isolated server-side environment variables and are never transmitted to client browsers.
- Repository `.gitignore` prevents unintentional commits of local credentials.

## Reporting a Vulnerability
To report a security vulnerability, please open a private GitHub advisory or email `security@utsav-ai.app`. All reports receive a response within 48 hours.
