# System Architecture & Data Flow

---

## 1. CURRENT ARCHITECTURE (Frontend-Only)

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER / CLIENT                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐                                       │
│  │   React App      │                                       │
│  │  (React 18)      │                                       │
│  └────────┬─────────┘                                       │
│           │                                                 │
│           ├─────┬──────────┬───────────┬──────────┐         │
│           │     │          │           │          │         │
│      ┌────▼──┐ ┌─▼──────┐ ┌─▼──────┐ ┌─▼──────┐ ┌─▼────┐  │
│      │ Home  │ │ Blog   │ │Neoflix │ │Toolbox │ │Admin │  │
│      │ Page  │ │ Page   │ │ Page   │ │ Page   │ │ CMS  │  │
│      └───┬──┘ └────────┘ └────────┘ └────────┘ └───┬──┘  │
│          │                                          │      │
│          └──────────────────┬──────────────────────┘      │
│                             │                             │
│  ┌──────────────────────────▼──────────────────────────┐  │
│  │            LocalStorage                            │  │
│  │  (neoflix-cms-sections)                            │  │
│  │                                                    │  │
│  │  [{                                                │  │
│  │    id: "preface",                                  │  │
│  │    title: "Preface",                               │  │
│  │    text_block_1: "...",                            │  │
│  │    video: "/videos/blurteam.mp4",                  │  │
│  │    text_block_2: null                              │  │
│  │  }, ...]                                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │       Static Data Files (Fallbacks)              │  │
│  │  - src/data/neoflix.js                           │  │
│  │  - src/data/blog.js                              │  │
│  │  - src/data/contact.js                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │       Assets (Netlify CDN)                       │  │
│  │  - /public/videos/*.mp4                          │  │
│  │  - /public/worldmap.svg                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT (Netlify)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   dist/ (Built React App + Assets)                │    │
│  │   - index.html (entry point)                       │    │
│  │   - assets/*.js (bundled components)               │    │
│  │   - assets/*.css (tailwind styles)                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Netlify Functions (Optional - Future)            │    │
│  │   - Authentication                                 │    │
│  │   - Backend operations                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. PROPOSED ARCHITECTURE (With Backend CMS)

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER / CLIENT                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   React App + Auth Token Management               │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │   Public Pages (Home, Blog, Neoflix)         │ │   │
│  │  │   ↓ Fetch /api/sections                      │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │   Admin CMS Interface                        │ │   │
│  │  │   ↓ POST/PUT/DELETE /api/sections             │ │   │
│  │  │   ↓ Upload /api/videos                        │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │   Local Cache (Optional)                     │ │   │
│  │  │   - Recently fetched sections               │ │   │
│  │  │   - Auth tokens                             │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  └──────────────────────┬───────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │     HTTPS/REST     │
                 └──────────┬──────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              BACKEND API SERVER                              │
│  (Node/Express, Python/Django, Go, etc.)                    │
├───────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   API Routes                                       │    │
│  │   ├─ POST /auth/login                              │    │
│  │   ├─ POST /auth/refresh                            │    │
│  │   ├─ GET /api/sections                             │    │
│  │   ├─ POST /api/sections                            │    │
│  │   ├─ PUT /api/sections/:id                         │    │
│  │   ├─ DELETE /api/sections/:id                      │    │
│  │   ├─ GET /api/videos                               │    │
│  │   ├─ POST /api/videos/upload                       │    │
│  │   ├─ GET /api/export                               │    │
│  │   └─ POST /api/search                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Middleware                                       │    │
│  │   ├─ Authentication (JWT)                          │    │
│  │   ├─ Authorization (Role-based)                    │    │
│  │   ├─ Input Validation                              │    │
│  │   ├─ Error Handling                                │    │
│  │   ├─ Logging & Monitoring                          │    │
│  │   └─ Rate Limiting                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Business Logic Layer                            │    │
│  │   ├─ Content Management                            │    │
│  │   ├─ User Management                               │    │
│  │   ├─ File Upload Handling                          │    │
│  │   ├─ Link Extraction (GitBook)                     │    │
│  │   └─ Full-Text Search                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Data Access Layer                               │    │
│  │   ├─ ORM/Query Builder (TypeORM, Sequelize, etc.) │    │
│  │   ├─ Query Optimization                           │    │
│  │   └─ Transaction Management                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└────────────────────┬──────────────────┬───────────────────┘
                     │                  │
        ┌────────────┴────┐      ┌──────┴─────────┐
        │                 │      │                │
┌───────▼─────────┐  ┌────▼────┐  ┌──────▼────────┐
│  PostgreSQL DB  │  │  Redis  │  │  S3 / Cloud   │
│                 │  │ (Cache) │  │  Storage      │
│ ┌─────────────┐ │  │         │  │  (Videos)     │
│ │ users       │ │  └─────────┘  └───────────────┘
│ │ sections    │ │
│ │ section_    │ │
│ │ versions    │ │
│ │ videos      │ │
│ │ audit_logs  │ │
│ │ embedded_   │ │
│ │ pages       │ │
│ └─────────────┘ │
└─────────────────┘
```

---

## 3. DATA FLOW DIAGRAMS

### User Flow: Creating/Editing Content

```
┌─────────────┐
│  Admin User │
└──────┬──────┘
       │
       ├─→ Navigate to /admin
       │   └─→ Check Auth Token (JWT)
       │       └─→ Valid? → Load Admin Interface
       │           Invalid? → Redirect to Login
       │
       ├─→ Click "Add Section"
       │   └─→ POST /api/sections
       │       ├─ Authorization Header: Bearer {token}
       │       ├─ Body: { title, text_block_1, video, ... }
       │       └─ Server Response:
       │           ├─ 201 Created: New section object
       │           └─ Save to sections table + version table
       │
       ├─→ Edit Text Blocks
       │   └─→ Can use formatting:
       │       ├─ **bold**
       │       ├─ *italic*
       │       └─ [link text](url)
       │
       ├─→ Select Video
       │   └─→ Dropdown: GET /api/videos
       │       └─→ List available videos
       │
       ├─→ Click "Save"
       │   └─→ PUT /api/sections/:id
       │       ├─ Server validates input
       │       ├─ Extracts GitBook links
       │       ├─ Updates section in DB
       │       ├─ Creates version history entry
       │       ├─ Creates audit log entry
       │       ├─ Invalidates cache
       │       └─ Webhooks: section.updated
       │
       ├─→ Admin sees confirmation
       │   └─→ Section updated successfully
       │
       └─→ Publish (Optional trigger)
           └─→ POST /api/sections/:id/publish
               ├─ Invalidate CDN cache
               ├─ Trigger site rebuild
               └─ Notify via webhook
```

### User Flow: Viewing Content

```
┌──────────────┐
│ Public Visitor│
└──────┬───────┘
       │
       ├─→ Visit https://bashtest.com/
       │   └─→ Download index.html + React bundle
       │       └─→ React initializes in browser
       │
       ├─→ Load Home Page
       │   └─→ Render HeroSection (eager)
       │   └─→ Lazy load remaining sections
       │
       ├─→ Navigate to /neoflix
       │   └─→ GET /api/sections (no auth required)
       │       ├─ Server returns: [section1, section2, ...]
       │       └─ Browser caches in React state
       │           └─ Process content:
       │               ├─ Render markdown
       │               ├─ Extract GitBook links
       │               └─ Create embedded page routes
       │
       ├─→ Click GitBook link: [Planning Guide](docs.neoflix.care/...)
       │   └─→ Navigate to /Toolbox-Planning_Guide
       │       ├─ Fetch embedded page: GET /api/embedded-pages/Planning_Guide
       │       └─ Display in iframe or content window
       │
       └─→ View video sections
           └─→ Stream from CDN: /videos/blurteam.mp4
               └─→ Cached for 1 year
```

### Content Extraction Flow: GitBook Links

```
Admin saves section content:
┌─────────────────────────────────────────┐
│ "[Check Planning Docs](docs.neoflix...)" │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌──────────────────┐
        │  Link Extraction │
        │  (Backend/Admin) │
        └────────┬─────────┘
                 │
        Pattern: /docs.neoflix.care/ ?
        │ YES
        ▼
┌──────────────────────────────┐
│ Extract URL Path             │
│ "level-1/2.-planning"       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Generate Slug                │
│ "Planning" → "Planning_Guide"│
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Create Embedded Page Entry   │
│ - slug: "Planning_Guide"     │
│ - route: "/Toolbox-..."      │
│ - label: "Check Planning..." │
│ - gitbook_url: full URL      │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Store in Database            │
│ - embedded_pages table       │
│ - link to section_id         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Frontend Auto-Generates      │
│ Route: /Toolbox-Planning_...│
│ Click → Opens embedded page  │
└──────────────────────────────┘
```

---

## 4. COMPONENT RELATIONSHIP MAP

```
App (Router)
│
├── Navbar (public pages only)
│
└── AppShell
    │
    ├── Route: /
    │   └── Home
    │       └── ScrollSnap
    │           └── SectionManager
    │               ├── HeroSection (eager)
    │               ├── LazySection → MedicalSectionV2
    │               ├── LazySection → MedicalSectionV3
    │               ├── LazySection → WorldMapSection
    │               └── LazySection → ContactSection
    │
    ├── Route: /blog
    │   └── Blog
    │       └── Sidebar
    │           └── Blog-specific sections
    │
    ├── Route: /neoflix
    │   └── Sidebar
    │       └── CMS-driven content sections
    │
    ├── Route: /admin
    │   └── CMSAdmin
    │       ├── Section List (Sidebar)
    │       ├── Text Editor
    │       │   └── Preview/Edit modes
    │       ├── Video Selector
    │       └── Export Modal
    │
    ├── Route: /toolbox
    │   └── Toolbox
    │
    ├── Route: /map-editor
    │   └── WorldMapEditor
    │       └── WorldMapViewport
    │
    ├── Route: /Toolbox-:slug
    │   └── ToolboxEmbed
    │
    └── FPSCounter (dev only)
```

---

## 5. DATABASE SCHEMA

### Core Tables

```sql
-- Users
users
├─ id (UUID, PK)
├─ email (VARCHAR, UNIQUE)
├─ password_hash (VARCHAR)
├─ name (VARCHAR)
├─ role (ENUM: admin, editor, viewer)
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
└─ last_login (TIMESTAMP)

-- Sections (Main Content)
sections
├─ id (UUID, PK)
├─ title (VARCHAR)
├─ text_block_1 (TEXT)
├─ text_block_2 (TEXT)
├─ video (VARCHAR, path)
├─ display_order (INT)
├─ created_by (UUID, FK → users)
├─ updated_by (UUID, FK → users)
├─ created_at (TIMESTAMP)
├─ updated_at (TIMESTAMP)
├─ is_deleted (BOOLEAN)
└─ slug (VARCHAR, optional)

-- Section Versions (History)
section_versions
├─ id (UUID, PK)
├─ section_id (UUID, FK → sections)
├─ version_number (INT)
├─ title (VARCHAR)
├─ text_block_1 (TEXT)
├─ text_block_2 (TEXT)
├─ video (VARCHAR)
├─ display_order (INT)
├─ changed_by (UUID, FK → users)
├─ change_description (VARCHAR)
├─ created_at (TIMESTAMP)
└─ diff_json (JSON, optional)

-- Videos
videos
├─ id (UUID, PK)
├─ filename (VARCHAR, UNIQUE)
├─ label (VARCHAR)
├─ description (TEXT)
├─ file_size_bytes (INT)
├─ mime_type (VARCHAR)
├─ duration_seconds (INT)
├─ storage_path (VARCHAR)
├─ uploaded_by (UUID, FK → users)
├─ uploaded_at (TIMESTAMP)
└─ is_active (BOOLEAN)

-- Embedded Pages (GitBook Links)
embedded_pages
├─ id (UUID, PK)
├─ slug (VARCHAR, UNIQUE)
├─ label (VARCHAR)
├─ gitbook_url (VARCHAR)
├─ section_id (UUID, FK → sections)
├─ extracted_at (TIMESTAMP)
├─ cached_content (TEXT, optional)
└─ cache_valid_until (TIMESTAMP)

-- Audit Log
audit_logs
├─ id (UUID, PK)
├─ user_id (UUID, FK → users)
├─ action (ENUM: create, read, update, delete)
├─ resource_type (VARCHAR)
├─ resource_id (UUID)
├─ resource_title (VARCHAR)
├─ changes_json (JSON)
├─ ip_address (VARCHAR)
├─ user_agent (VARCHAR)
└─ created_at (TIMESTAMP)
```

---

## 6. AUTHENTICATION FLOW

```
┌──────────────────┐
│  Login Request   │
└────────┬─────────┘
         │
         ▼
    POST /auth/login
    Body: { email, password }
         │
         ▼
┌──────────────────────────┐
│  Server validates        │
│  - Email exists?         │
│  - Password hash match?  │
└────────┬─────────────────┘
         │
         ├─ INVALID ──→ 401 Unauthorized
         │
         └─ VALID
             │
             ▼
    ┌───────────────────────────────────────┐
    │ Generate JWT Tokens:                  │
    │ ├─ access_token (15 min expiry)       │
    │ ├─ refresh_token (7 days expiry)      │
    │ └─ Include user.id, user.role, iat    │
    └───────────┬───────────────────────────┘
                │
                ▼
        ┌──────────────────┐
        │ Return to Client │
        │ {                │
        │   access_token,  │
        │   refresh_token, │
        │   expires_in     │
        │ }                │
        └────────┬─────────┘
                 │
                 ▼
    ┌─────────────────────────────────────┐
    │ Client stores in:                   │
    │ - Memory (preferred)                │
    │ - sessionStorage (if needed)        │
    │ NOT localStorage (XSS risk)         │
    └─────────────────────────────────────┘

All subsequent requests:
┌──────────────────────────────┐
│ Header:                      │
│ Authorization: Bearer <token>│
└──────────┬───────────────────┘
           │
           ▼
    ┌─────────────────┐
    │ Middleware:     │
    │ 1. Extract JWT  │
    │ 2. Verify sig   │
    │ 3. Check exp    │
    │ 4. Load user    │
    └────────┬────────┘
             │
      ┌──────┴────────┐
      │               │
    VALID         EXPIRED
      │               │
      ▼               ▼
  Continue      Reject OR
  Request       Auto-refresh
                using refresh_token
```

---

## 7. CACHING STRATEGY

```
┌────────────────────────────────────────────────┐
│              Three-Layer Cache                 │
└────────────────────────────────────────────────┘

Layer 1: Browser Cache
├─ assets/* → 1 year (immutable)
├─ /videos/* → 1 year (immutable)
└─ HTML → No-cache (always fresh)

Layer 2: Redis (Server-side)
├─ Sections list → 5 minutes
├─ Single section → 10 minutes
├─ Video metadata → 1 hour
├─ Embedded pages → 24 hours
└─ Search results → 2 hours

Layer 3: Database
├─ Query optimization
├─ Indexes on:
│  ├─ sections.display_order
│  ├─ sections.updated_at
│  ├─ embedded_pages.section_id
│  ├─ audit_logs.created_at
│  └─ users.email
└─ Query caching at ORM level

Cache Invalidation:
├─ On section.update → Clear section cache
├─ On section.delete → Clear list cache
├─ On video.upload → Clear video list
└─ On import → Clear all caches
```

---

## 8. SECURITY LAYERS

```
┌────────────────────────────────────────────┐
│         Security Architecture              │
└────────────────────────────────────────────┘

Transport Layer:
├─ HTTPS/TLS 1.3 (enforced)
├─ HSTS header
└─ Certificate pinning (optional)

Application Layer:
├─ Input Validation
│  ├─ Whitelist allowed characters
│  ├─ Markdown sanitization (DOMPurify)
│  └─ SQL injection prevention (prepared statements)
│
├─ Authentication
│  ├─ JWT tokens (HS256 or RS256)
│  ├─ Refresh token rotation
│  └─ Token blacklisting
│
├─ Authorization
│  ├─ Role-based access control (RBAC)
│  ├─ Resource ownership verification
│  └─ Scope validation
│
├─ Rate Limiting
│  ├─ IP-based limits (public)
│  ├─ User-based limits (auth)
│  └─ Endpoint-specific limits
│
├─ Logging & Monitoring
│  ├─ Access logs
│  ├─ Audit logs
│  ├─ Error tracking
│  └─ Intrusion detection
│
└─ Data Protection
   ├─ Password hashing (bcrypt, argon2)
   ├─ Encryption at rest (PII)
   ├─ Encryption in transit
   └─ Regular backups

Content Security Policy (CSP):
├─ default-src 'self'
├─ script-src 'self'
├─ style-src 'self' 'unsafe-inline'
├─ img-src 'self' https:
└─ frame-ancestors 'none'
```

---

## 9. DEPLOYMENT FLOW

```
Developer commits code
        │
        ▼
Git push to feature branch
        │
        ▼
GitHub Actions / CI/CD Pipeline
├─ Lint & Format Check
├─ Unit Tests
├─ Build Tests
├─ Security Scan
└─ Code Coverage Report
        │
        ├─ FAILS → Notify developer
        │
        └─ PASSES
            │
            ▼
    Create Pull Request
            │
            ▼
    Code Review & Approval
            │
            ▼
    Merge to main branch
            │
            ▼
    Netlify / Deploy Hook Triggered
├─ Build: npm run build
├─ Tests: npm run test
├─ Artifacts: dist/ folder
└─ Deploy to production
            │
            ├─ Blue-green deployment (optional)
            │
            └─ Cache invalidation
                ├─ HTML (no-cache)
                ├─ Assets (immutable)
                └─ CDN purge
                    │
                    ▼
            Production Live
```

---

## 10. MONITORING & OBSERVABILITY

```
Metrics to Track:
├─ Application
│  ├─ API response times (p50, p95, p99)
│  ├─ Error rates by endpoint
│  ├─ Cache hit rates
│  ├─ Database query times
│  └─ Active user sessions
│
├─ Infrastructure
│  ├─ Server CPU/Memory usage
│  ├─ Database connections
│  ├─ Disk I/O
│  └─ Network bandwidth
│
├─ Business
│  ├─ CMS edits per day
│  ├─ Content views
│  ├─ User engagement
│  └─ Conversion rates
│
└─ Security
   ├─ Failed login attempts
   ├─ Rate limit violations
   ├─ Suspicious patterns
   └─ Audit log activity

Tools:
├─ Logging: ELK Stack / Datadog / CloudWatch
├─ Monitoring: Prometheus / Grafana
├─ APM: New Relic / Datadog / Jaeger
├─ Error Tracking: Sentry
├─ Security: Snyk / OWASP ZAP
└─ Uptime: Statuspage.io
```

---

## 11. SCALE CONSIDERATIONS

### Horizontal Scaling Strategy

```
Load Balancer (HAProxy / AWS ALB)
        │
    ┌───┼───┬───┐
    │   │   │   │
  API1 API2 API3 APIx
    │   │   │   │
    └───┼───┴───┘
        │
    Shared Resources:
    ├─ PostgreSQL (Read replicas)
    ├─ Redis Cluster (caching)
    ├─ S3 / Cloud Storage (media)
    └─ CDN (static assets)
```

### Database Optimization

- Connection pooling (pgBouncer)
- Query optimization & caching
- Index strategy
- Partition large tables
- Archive old audit logs
- Read replicas for reporting

### Content Delivery

- Global CDN (CloudFront / Cloudflare)
- Edge caching
- Adaptive bitrate for videos
- Image optimization
- Compression (gzip/brotli)

---

**Architecture Version**: 2.0 (with Backend)
**Last Updated**: February 2025
**Status**: Recommended Implementation Pattern
