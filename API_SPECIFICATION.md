# API Specification for Backend Integration

**Document Version**: 1.0
**Status**: Recommended Implementation Plan

---

## Overview

This document specifies the RESTful API needed to replace the current frontend-only CMS with a proper backend system. The API will handle content management, user authentication, and media storage.

---

## 1. AUTHENTICATION API

### POST /auth/register
Register a new admin user

**Request**:
```json
{
  "email": "admin@example.com",
  "password": "secure_password",
  "name": "Admin Name"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "admin",
  "created_at": "2025-02-15T10:00:00Z"
}
```

**Errors**:
- 400: Invalid email or password
- 409: Email already exists

---

### POST /auth/login
Authenticate and receive tokens

**Request**:
```json
{
  "email": "admin@example.com",
  "password": "secure_password"
}
```

**Response** (200 OK):
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Errors**:
- 401: Invalid credentials
- 429: Too many login attempts

---

### POST /auth/refresh
Refresh access token

**Request**:
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response** (200 OK):
```json
{
  "access_token": "new_jwt_token",
  "expires_in": 3600
}
```

**Errors**:
- 401: Invalid refresh token
- 401: Token expired

---

### POST /auth/logout
Invalidate tokens

**Headers**: `Authorization: Bearer {access_token}`

**Response** (204 No Content):
```
No body
```

---

## 2. SECTIONS API (CMS Core)

### GET /api/sections
Fetch all sections with pagination

**Query Parameters**:
- `page` (int, default: 1)
- `limit` (int, default: 20, max: 100)
- `sort` (string, default: "display_order")
- `order` (string, "asc" or "desc", default: "asc")

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Section Title",
      "text_block_1": "Content here...",
      "text_block_2": "Additional content...",
      "video": "/videos/blurteam.mp4",
      "display_order": 1,
      "created_at": "2025-02-15T10:00:00Z",
      "updated_at": "2025-02-15T10:00:00Z",
      "created_by": {
        "id": "uuid",
        "name": "John Doe"
      },
      "embedded_pages_count": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### GET /api/sections/:id
Fetch single section

**Response** (200 OK):
```json
{
  "id": "uuid",
  "title": "Preface",
  "text_block_1": "Lorem ipsum...",
  "text_block_2": null,
  "video": "/videos/blurteam.mp4",
  "display_order": 1,
  "created_at": "2025-02-15T10:00:00Z",
  "updated_at": "2025-02-15T10:00:00Z",
  "created_by": {
    "id": "uuid",
    "name": "John Doe"
  },
  "updated_by": {
    "id": "uuid",
    "name": "Jane Smith"
  },
  "embedded_pages": [
    {
      "slug": "Planning_Your_Initiative",
      "label": "Planning Your Initiative",
      "gitbook_url": "https://docs.neoflix.care/...",
      "route": "/Toolbox-Planning_Your_Initiative"
    }
  ]
}
```

**Errors**:
- 404: Section not found

---

### POST /api/sections
Create new section

**Headers**: `Authorization: Bearer {access_token}` (admin only)

**Request**:
```json
{
  "title": "New Section",
  "text_block_1": "Content here...",
  "text_block_2": null,
  "video": "/videos/blurperspectives.mp4",
  "display_order": 8
}
```

**Response** (201 Created):
```json
{
  "id": "new-uuid",
  "title": "New Section",
  "text_block_1": "Content here...",
  "text_block_2": null,
  "video": "/videos/blurperspectives.mp4",
  "display_order": 8,
  "created_at": "2025-02-15T11:00:00Z",
  "updated_at": "2025-02-15T11:00:00Z",
  "created_by": {
    "id": "uuid",
    "name": "Admin User"
  }
}
```

**Errors**:
- 400: Missing required fields
- 401: Unauthorized
- 403: Insufficient permissions
- 413: Content too large

---

### PUT /api/sections/:id
Update section

**Headers**: `Authorization: Bearer {access_token}` (admin/creator)

**Request**:
```json
{
  "title": "Updated Title",
  "text_block_1": "Updated content...",
  "text_block_2": "More content...",
  "video": "/videos/blurfocus.mp4"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "text_block_1": "Updated content...",
  "text_block_2": "More content...",
  "video": "/videos/blurfocus.mp4",
  "display_order": 1,
  "created_at": "2025-02-15T10:00:00Z",
  "updated_at": "2025-02-15T11:30:00Z",
  "created_by": { "id": "uuid", "name": "Original Author" },
  "updated_by": { "id": "uuid", "name": "Editor Name" }
}
```

**Errors**:
- 400: Invalid input
- 401: Unauthorized
- 403: Insufficient permissions
- 404: Section not found
- 409: Concurrent edit conflict

---

### DELETE /api/sections/:id
Delete section (soft delete recommended)

**Headers**: `Authorization: Bearer {access_token}` (admin only)

**Response** (204 No Content):
```
No body
```

**Errors**:
- 401: Unauthorized
- 403: Insufficient permissions
- 404: Section not found

---

### POST /api/sections/:id/reorder
Reorder section position

**Headers**: `Authorization: Bearer {access_token}` (admin)

**Request**:
```json
{
  "display_order": 3
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "display_order": 3,
  "updated_at": "2025-02-15T11:35:00Z"
}
```

**Errors**:
- 400: Invalid position
- 401: Unauthorized
- 404: Section not found

---

## 3. VERSION HISTORY API

### GET /api/sections/:id/versions
Fetch version history for section

**Query Parameters**:
- `limit` (int, default: 10)
- `offset` (int, default: 0)

**Response** (200 OK):
```json
{
  "data": [
    {
      "version": 5,
      "created_at": "2025-02-15T11:30:00Z",
      "changed_by": {
        "id": "uuid",
        "name": "Jane Smith"
      },
      "change_description": "Updated video reference",
      "diff": {
        "video": {
          "from": "/videos/blurteam.mp4",
          "to": "/videos/blurfocus.mp4"
        }
      }
    }
  ],
  "current_version": 5
}
```

---

### GET /api/sections/:id/versions/:version
Fetch specific version

**Response** (200 OK):
```json
{
  "version": 3,
  "title": "Old Title",
  "text_block_1": "Old content...",
  "text_block_2": null,
  "video": "/videos/blurteam.mp4",
  "created_at": "2025-02-12T10:00:00Z"
}
```

---

### POST /api/sections/:id/restore
Restore section to previous version

**Headers**: `Authorization: Bearer {access_token}` (admin)

**Request**:
```json
{
  "version": 3,
  "reason": "Revert to last good state"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "version": 6,
  "title": "Old Title (restored)",
  "restored_from_version": 3,
  "restored_at": "2025-02-15T11:45:00Z"
}
```

---

## 4. EMBEDDED PAGES API

### GET /api/embedded-pages
List all automatically detected embedded pages

**Query Parameters**:
- `section_id` (uuid, optional - filter by section)
- `search` (string, optional - search by label/slug)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "Planning_Your_Initiative",
      "label": "Planning Your Initiative",
      "gitbook_url": "https://docs.neoflix.care/...",
      "route": "/Toolbox-Planning_Your_Initiative",
      "found_in_sections": [
        { "id": "uuid", "title": "Preface" }
      ],
      "extracted_at": "2025-02-15T10:00:00Z"
    }
  ],
  "total": 42
}
```

---

### GET /api/embedded-pages/:slug
Fetch embedded page content

**Response** (200 OK):
```json
{
  "id": "uuid",
  "slug": "Planning_Your_Initiative",
  "label": "Planning Your Initiative",
  "gitbook_url": "https://docs.neoflix.care/...",
  "route": "/Toolbox-Planning_Your_Initiative",
  "cached_content": "<h1>...</h1>",
  "cache_valid_until": "2025-02-20T10:00:00Z"
}
```

**Errors**:
- 404: Embedded page not found

---

## 5. VIDEOS API

### GET /api/videos
List available videos

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "filename": "blurteam.mp4",
      "label": "Team - Collaboration & Teamwork",
      "file_size_bytes": 45678900,
      "mime_type": "video/mp4",
      "duration_seconds": 45,
      "url": "/videos/blurteam.mp4",
      "uploaded_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/videos/upload
Upload new video

**Headers**:
- `Authorization: Bearer {access_token}` (admin)
- `Content-Type: multipart/form-data`

**Form Data**:
- `file` (binary) - Video file
- `label` (string) - Display label
- `description` (string, optional)

**Response** (201 Created):
```json
{
  "id": "uuid",
  "filename": "newvideo.mp4",
  "label": "New Video",
  "file_size_bytes": 67890123,
  "url": "/videos/newvideo.mp4",
  "upload_completed_at": "2025-02-15T12:00:00Z"
}
```

**Errors**:
- 400: Invalid file
- 413: File too large
- 415: Unsupported media type
- 429: Upload quota exceeded

---

### DELETE /api/videos/:id
Delete video

**Headers**: `Authorization: Bearer {access_token}` (admin)

**Response** (204 No Content)

**Errors**:
- 409: Video still in use by sections

---

## 6. EXPORT/IMPORT API

### GET /api/export
Export all content as JSON

**Query Parameters**:
- `include` (string, comma-separated: "sections,videos,history", default: "sections")

**Response** (200 OK):
```json
{
  "export_version": "1.0",
  "exported_at": "2025-02-15T12:30:00Z",
  "exported_by": "admin@example.com",
  "sections": [...],
  "embedded_pages": [...],
  "videos": [...]
}
```

---

### POST /api/import
Import content from JSON

**Headers**:
- `Authorization: Bearer {access_token}` (admin)
- `Content-Type: application/json`

**Request**:
```json
{
  "import_mode": "merge|replace|append",
  "sections": [...]
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "imported_sections": 7,
  "skipped": 0,
  "errors": [],
  "import_id": "uuid"
}
```

**Errors**:
- 400: Invalid import data
- 409: Conflict with existing data
- 413: Import too large

---

## 7. SEARCH API

### GET /api/search
Full-text search across sections

**Query Parameters**:
- `q` (string, required) - Search query
- `type` (string: "sections|pages|all", default: "all")
- `limit` (int, default: 20)

**Response** (200 OK):
```json
{
  "query": "medical procedures",
  "results": [
    {
      "type": "section",
      "id": "uuid",
      "title": "Medical Procedures",
      "excerpt": "...discusses key medical procedures...",
      "score": 0.95
    },
    {
      "type": "embedded_page",
      "slug": "Advanced_Procedures",
      "label": "Advanced Procedures",
      "excerpt": "...advanced procedure guidelines...",
      "score": 0.87
    }
  ],
  "total": 2
}
```

---

## 8. USER MANAGEMENT API

### GET /api/users
List all users (admin only)

**Headers**: `Authorization: Bearer {access_token}` (admin)

**Query Parameters**:
- `role` (string: "admin|editor|viewer", optional)
- `page` (int, default: 1)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "last_login": "2025-02-15T10:30:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### PUT /api/users/:id/role
Change user role

**Headers**: `Authorization: Bearer {access_token}` (admin)

**Request**:
```json
{
  "role": "editor"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "editor",
  "updated_at": "2025-02-15T12:45:00Z"
}
```

---

## 9. AUDIT LOG API

### GET /api/audit-logs
Fetch audit trail

**Headers**: `Authorization: Bearer {access_token}` (admin)

**Query Parameters**:
- `resource_type` (string: "section|video|user")
- `resource_id` (uuid, optional)
- `action` (string: "create|update|delete")
- `limit` (int, default: 50)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "timestamp": "2025-02-15T11:30:00Z",
      "user": {
        "id": "uuid",
        "email": "editor@example.com"
      },
      "action": "update",
      "resource_type": "section",
      "resource_id": "uuid",
      "resource_title": "Preface",
      "changes": {
        "video": {
          "from": "/videos/blurteam.mp4",
          "to": "/videos/blurfocus.mp4"
        }
      }
    }
  ]
}
```

---

## 10. ERROR RESPONSES

### Standard Error Format

All error responses follow this format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested section does not exist",
    "status": 404,
    "timestamp": "2025-02-15T12:50:00Z",
    "request_id": "req_abc123def456"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_REQUEST | 400 | Malformed request |
| UNAUTHORIZED | 401 | Missing/invalid auth |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict |
| UNPROCESSABLE_ENTITY | 422 | Validation failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## 11. PAGINATION STANDARD

All list endpoints support:

**Query Parameters**:
- `page` (int, default: 1)
- `limit` (int, default: 20, max: 100)
- `sort` (string, field name)
- `order` (string: "asc"|"desc", default: "asc")

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## 12. RATE LIMITING

**Public Endpoints**:
- 100 requests per minute per IP

**Authenticated Endpoints**:
- 1000 requests per minute per user

**Upload Endpoints**:
- 10 requests per hour per user
- Max 5GB per month per user

**Headers in Response**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1645024800
```

---

## 13. WEBHOOKS (Optional)

### Webhook Events

```
section.created
section.updated
section.deleted
video.uploaded
video.deleted
content.published
import.completed
```

### Webhook Payload

```json
{
  "event": "section.updated",
  "timestamp": "2025-02-15T12:00:00Z",
  "data": {
    "id": "uuid",
    "title": "Section Title",
    "changed_fields": ["video", "text_block_1"]
  },
  "attempt": 1
}
```

---

## 14. SECURITY HEADERS

**Required on all responses**:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## 15. CORS CONFIGURATION

**Allowed Origins**:
- https://bashtest.com
- https://*.bashtest.com
- http://localhost:5173 (dev)

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers**: Content-Type, Authorization

**Credentials**: Include

---

## Frontend Integration Example

```javascript
// Using the API in React
const fetchSections = async (token) => {
  const response = await fetch('/api/sections?page=1&limit=20', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

---

## Implementation Priority

1. **Phase 1** (MVP): Auth + Sections CRUD + Basic Export
2. **Phase 2**: Version History + Audit Logs
3. **Phase 3**: Video Management + Search
4. **Phase 4**: User Management + Webhooks
5. **Phase 5**: Advanced Features + Analytics

---

**Last Updated**: February 2025
**Status**: Recommended Specification
