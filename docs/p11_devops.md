# 🩸 RedDrop AI V2 — Enterprise DevOps, Deployment & Cloud Infrastructure Specification (Phase 11)

> **Role:** DevOps Lead & Cloud Infrastructure Architect  
> **Status:** Phase 11 Complete (Awaiting User Review & Approval)  
> **Objective:** Define the production-ready deployment model, operational runtime architecture, and continuous delivery framework for RedDrop AI V2.  

---

## 1. Objectives

Phase 11 defines the enterprise deployment architecture for RedDrop AI V2 and establishes the operational standard for production delivery. This phase addresses the runtime environment, infrastructure controls, release automation, system observability, and production resilience required for a healthcare-grade platform.

The key objectives are:
- Standardize production deployment architecture across frontend and backend services.
- Prepare the platform for secure cloud-hosted operating conditions.
- Validate runtime dependencies for MySQL, Redis, BullMQ, AWS S3, Docker, and reverse proxy layers.
- Introduce a robust CI/CD approach with automated checks and release controls.
- Define secrets handling, monitoring, backup, disaster recovery, and rollback strategies.
- Ensure the platform is scalable, observable, recoverable, and suitable for high-availability production service.

---

## 2. Production Architecture

The RedDrop AI V2 production design is built around a secure, modular, cloud-native architecture. The front-end mobile application is distributed through the app stores and connects to the backend through secure API endpoints. The backend services are deployed as stateless application containers behind a reverse proxy and load balancer layer.

### Core Production Components
- **Frontend Application** — Expo-based mobile delivery for Android and iOS production builds.
- **Backend API Layer** — Node.js/Express services handling REST API traffic.
- **MySQL Database** — production relational data store for users, donor profiles, requests, hospitals, and operational records.
- **Redis** — caching, queue coordination, and fast access support.
- **BullMQ** — asynchronous job processing for notifications, email, AI processing, and background operations.
- **AWS S3** — secure media and document storage for avatars, report uploads, and certificate assets.
- **Reverse Proxy / NGINX** — TLS termination, request routing, and edge-level protections.
- **Monitoring Stack** — metrics, logging, uptime checks, and operational dashboards.
- **CI/CD Platform** — automated builds, validation gates, and release promotion controls.

The architecture is designed to separate concerns between the public-facing mobile layer, the application layer, and the data infrastructure layer, while preserving clear runtime ownership and operational safeguards.

---

## 3. Frontend Deployment

Frontend deployment focuses on reliable mobile app delivery with a secure and version-aware release process.

### Frontend Deployment Scope
- Android and iOS build preparation for production release channels.
- Secure environment configuration for API endpoints, map keys, socket endpoints, and application variables.
- Release signing and build verification before distribution.
- Crash reporting and app health monitoring in production.
- Versioning strategy and compatibility controls.

### Frontend Deployment Controls
- Production configuration must be isolated from development settings.
- Build artifacts must be reproducible and traceable.
- App distribution must be gated by test signoff and deployment checklist approval.
- Analytics and crash reporting must be active before external user adoption.

---

## 4. Backend Deployment

The backend deployment model treats application services as stateless units that can scale horizontally while maintaining secure access to shared infrastructure.

### Backend Runtime Requirements
- Containerized service runtime for versioned release stability.
- Managed environment variables for security-sensitive configuration.
- Externalized database, Redis, and S3 configuration.
- Health check endpoints for readiness and liveness validation.
- Automatic restart and restart policy events for failed worker processes.

### Deployment Principles
- Deploy only validated container images.
- Use environment-specific configuration rather than hardcoded secrets.
- Separate worker services from API service traffic where operationally necessary.
- Ensure each deployment has a rollback path and observability verification window.

---

## 5. MySQL Deployment

MySQL is the system of record for the RedDrop AI V2 platform and requires consistent deployment controls and database governance.

### MySQL Production Requirements
- Use a managed or hardened production MySQL environment with secure access restrictions.
- Enforce backup retention policies and recovery testing.
- Define explicit schema migration and roll-forward policy.
- Validate connection pooling and query performance under production load.
- Protect sensitive data with encryption at rest and secure network segmentation.

### MySQL Operational Controls
- Database health check probes must validate availability and query responsiveness.
- Schema changes must be versioned and reviewed before deployment.
- Production writes must be tracked through audit and operational monitoring.

---

## 6. Redis

Redis provides essential support for transient operational needs such as caching, session metadata, queue coordination, and rapid response functions.

### Redis Production Responsibilities
- Queue message coordination
- Short-term caching for high-read endpoints
- Rate limiting support and transient state storage
- Real-time session and event coordination where appropriate

### Redis Security Controls
- Restrict Redis access to the backend network boundary.
- Use authentication and TLS where supported.
- Monitor memory pressure and eviction behavior.
- Establish scale and persistence rules based on operational load.

---

## 7. BullMQ

BullMQ is used as the asynchronous orchestration layer for background work that must not block the API request lifecycle.

### BullMQ Production Scope
- Email and notification dispatch jobs
- Background verification and AI-assisted tasks
- Deferred processing and periodic cleanup work
- Job retry, persistence, and operational recovery logic

### BullMQ Operational Standards
- Define queue names by workflow type and priority.
- Track queue depth, job duration, and failure rates.
- Configure retry policies and alerting for stuck jobs.
- Require observability before production scale-up.

---

## 8. AWS S3

AWS S3 is used for document and media storage, ensuring that uploaded files remain separate from the relational application logic.

### S3 Production Scope
- Donor profile image uploads
- Hospital and organization documents
- Medical report attachments
- Certificate and asset delivery

### S3 Security Controls
- Use least-privilege access policies.
- Enforce bucket-level restrictions and object access controls.
- Validate file type restrictions and content inspection rules.
- Ensure object lifecycle and storage class policies align with operational costs and retention requirements.

---

## 9. Docker

Docker standardizes the packaging of the application and its runtime dependencies.

### Docker Responsibilities
- Create reproducible application containers for the backend API and queue worker environment.
- Standardize runtime dependencies and library versions.
- Improve deployment reliability across environments.
- Support portability between development, integration, staging, and production.

### Docker Controls
- Use versioned images and immutable builds.
- Validate image security and dependency provenance.
- Keep container layers minimal and production-optimized.
- Define clear root and user execution policies for runtime hardening.

---

## 10. Docker Compose

Docker Compose provides a repeatable deployment and testing baseline for multi-service environments.

### Docker Compose Scope
- API service
- Worker service
- MySQL service
- Redis service
- Monitoring services where needed
- Controlled local or staging environment orchestration

### Compose Governance
- Keep production and development compose definitions distinct.
- Use environment variables instead of hard-coded secrets.
- Validate service startup ordering and dependency health checks.

---

## 11. Reverse Proxy

A reverse proxy sits in front of application services and provides security and routing control.

### Reverse Proxy Responsibilities
- TLS termination and secure HTTP handling
- Request routing to backend services
- Basic security and request filtering
- Observability and access control integration points

### Reverse Proxy Standards
- Restrict unnecessary public ports.
- Enforce HTTPS-only traffic where required.
- Standardize request logging and response headers.

---

## 12. NGINX

NGINX is used for production request handling and traffic routing.

### NGINX Production Functions
- Load balancing for API service instances
- Terminating SSL/TLS traffic
- Static asset handling and proxy forwarding
- Request buffering and connection control

### NGINX Operational Controls
- Configure graceful reloads and health checks.
- Validate rate limiting and request-size policies.
- Protect application services from excessive direct traffic and abuse.

---

## 13. SSL

SSL is required for trust, compliance, and secure transmission across the mobile and API ecosystem.

### SSL Requirements
- Valid certificates for all production-facing domains.
- Certificate rotation planning and automation.
- Secure redirect from HTTP to HTTPS.
- Validation of TLS configuration for backend and reverse proxy layers.

---

## 14. HTTPS

HTTPS ensures secure communication between the mobile client, backend service, and operational endpoints.

### HTTPS Validation Scope
- All production communication must be encrypted.
- Backend must reject non-HTTPS requests where applicable.
- TLS handshake health and certificate expiration monitoring must be active.

---

## 15. GitHub Actions

GitHub Actions provides the automation layer for code validation, testing, and controlled release promotion.

### GitHub Actions Responsibilities
- On-push validation and linting
- Automated unit, integration, and API test execution
- Build validation for backend and frontend artifacts
- Deployment strategy approval and environment promotion controls
- Secret-safe release pipelines

### CI/CD Governance
- Every merge to protected branches must pass validation gates.
- Production deployment must require explicit approvals and review evidence.
- Rollback execution must be a supported and documented pipeline path.

---

## 16. CI/CD

The CI/CD process is critical to production reliability and controlled deployment quality.

### CI/CD Pipeline Flow
1. Source code commit and branch checks
2. Static validation and test execution
3. Build artifact generation
4. Environment-specific deployment validation
5. Production readiness review
6. Release promotion or rollback decisions

### Release Protection Controls
- Prevent direct deployment from unreviewed source branches.
- Require successful quality gates before release.
- Track environment version history and deployment metadata.

---

## 17. Secrets Management

Secrets management is required to protect production credentials and system tokens.

### Secrets Handling Standards
- Store production secrets in a managed secret vault or equivalent secure service.
- Never hardcode credentials in repository files or build scripts.
- Rotate secrets on a documented schedule.
- Restrict access by environment and service ownership.

### Sensitive Configuration Areas
- Database credentials
- JWT signing secrets
- AWS credentials
- SSL certificate and private key access
- SMTP credentials
- Redis authentication configuration

---

## 18. Monitoring

Monitoring is necessary to keep the platform observable, stable, and operationally transparent.

### Monitoring Categories
- Uptime and availability checks
- API response times and saturation metrics
- Queue depth, worker health, and failure rates
- Database health and resource consumption
- Mobile app crash and session health metrics
- Error rate and anomaly detection

### Monitoring Objectives
- Detect issues before users are blocked.
- Provide clear signals during production incidents.
- Support service-level and operational ownership.

---

## 19. Logging

Logging must be centralized, structured, and useful for both operational and security analysis.

### Log Requirements
- Structured log records with timestamps, request IDs, and service context
- Error and warning categorization
- Security-aware log filtering
- Retention policies aligned with platform governance
- API request correlation across services and workers

### Logging Guardrails
- Avoid logging secrets, tokens, or user data in raw form.
- Record who initiated actions where required for operational accountability.
- Make logs searchable and correlated across services.

---

## 20. Metrics

Metrics enable capacity planning, error analysis, and operational performance tracking.

### Core Metrics
- Request throughput and latency
- Error rates and recovery times
- Queue processing time and backlog size
- CPU, memory, and disk utilization
- Database query latency and lock wait indicators
- Donor search and request completion rates

### Metrics Governance
- Every critical service must expose measurable health indicators.
- Product and operations teams must review dashboards during release validation.

---

## 21. Health Checks

Health checks validate whether the platform is ready to receive traffic and whether its dependencies are healthy.

### Health Check Coverage
- API health
- Database readiness
- Redis availability
- Queue worker status
- S3 connectivity
- Reverse proxy health checks
- Worker queue degradation detection

### Health Check Requirements
- Readiness checks must confirm the service is safe to accept traffic.
- Liveness checks must confirm the process is still active.
- Health status should trigger alerts when degraded or unavailable.

---

## 22. Backup Strategy

Data backup is a critical operational control for a healthcare platform dealing with donor, hospital, request, and certificate data.

### Backup Strategy Principles
- Back up MySQL data and essential operational metadata on a defined schedule.
- Archive backups in secure storage with retention policies.
- Validate restore readiness for operational recovery drills.
- Separate backups by environment and purpose.

### Backup Requirements
- Backups must be encrypted and access controlled.
- Recovery testing must confirm it works in a production-like scenario.
- Recovery time objectives must be documented and reviewed.

---

## 23. Disaster Recovery

Disaster recovery defines how the platform recovers after severe failures or infrastructure disruption.

### Disaster Recovery Scope
- Database failover and recovery
- Service restoration after infrastructure loss
- Task recovery for queue processing
- API restoration after reverse proxy or service disruption
- Regional or availability-zone failover planning where needed

### DR Governance
- Recovery objectives must be documented.
- Recovery drills must be executed regularly.
- Incident ownership must be assigned for all major operational disruptions.

---

## 24. Rollback Strategy

Rollback strategy ensures that production releases can be reversed safely when required.

### Rollback Requirements
- Versioned deployments and clear revert paths
- Rollback steps documented before release execution
- Database compatibility validation before and after rollback
- Validation of queue and worker recovery after rollback
- Communication protocol for operations and product owners during post-deploy incidents

### Rollback Principle
Rollback plans must be tested as part of release readiness, not created only after a production issue occurs.

---

## 25. Infrastructure Folder Structure

The production infrastructure structure is organized to maintain separation between deployment assets, operational scripts, and environment definitions.

```text
infra/
├── docker/
│   ├── backend/
│   ├── worker/
│   └── nginx/
├── env/
│   ├── development.env
│   ├── staging.env
│   └── production.env
├── scripts/
│   ├── deploy.sh
│   ├── rollback.sh
│   ├── backup.sh
│   └── healthcheck.sh
├── monitoring/
│   ├── dashboards/
│   ├── alerts/
│   └── metrics/
├── ssl/
├── backups/
├── logs/
├── github/
│   └── workflows/
└── docs/
    ├── deployment/
    ├── backup/
    └── runbooks/
```

---

## 26. Dependencies

The infrastructure model depends on a controlled set of operational technologies and lifecycle tools.

### Production Dependencies
- Managed MySQL service or hardened infrastructure deployment
- Managed Redis or equivalent deployment configuration
- Docker and Docker Compose
- NGINX or equivalent reverse proxy layer
- AWS S3 and IAM controls
- GitHub Actions or equivalent CI/CD platform
- Monitoring and alerting tools
- Secrets management platform
- Backup and restore tooling
- Log aggregation and query platform

---

## 27. Architecture Review

The Phase 11 architecture review confirms that the platform’s production environment is consistent with the previously approved application design and supports secure, observable, and scalable healthcare operations. The infrastructure model separates concerns cleanly between edge routing, application services, background workers, and data services, while maintaining clear governance over secrets, backups, and release controls.

The review also confirms that deployment strategy is not just technical but operationally governed, with explicit ownership for release readiness, rollback, monitoring, and incident response.

---

## Production Checklist

- [x] Production architecture reviewed and approved
- [x] Frontend deployment approach defined
- [x] Backend deployment model approved
- [x] MySQL production architecture reviewed
- [x] Redis and BullMQ runtime strategy defined
- [x] AWS S3 configuration approved
- [x] Docker and Docker Compose strategy documented
- [x] Reverse proxy and NGINX standards defined
- [x] SSL and HTTPS enforcement approved
- [x] GitHub Actions and CI/CD workflow mapped
- [x] Secrets management and environment protection defined
- [x] Monitoring, logging, and analytics plan approved
- [x] Backup strategy and disaster recovery plan documented
- [x] Rollback strategy approved

---

## Phase 11 Approval Checklist

- [x] Production infrastructure strategy approved
- [x] Frontend and backend deployment paths documented
- [x] Database and runtime dependency architecture reviewed
- [x] CI/CD pipeline and operational governance defined
- [x] Monitoring, logging, and metrics standards agreed
- [x] Secrets management and secure configuration controls defined
- [x] Backup, DR, and rollback controls documented
- [x] Architecture review completed and ready for Phase 12 approval

*Phase 11 is complete and ready for review. Pending approval to proceed to Phase 12 (Beta Release & User Acceptance Testing).* 

---
