# Bashtest Site Documentation

**Version**: 0.0.1
**Last Updated**: February 2025
**Build Tool**: Vite
**Deployment**: Netlify

---

## 1. SITE OVERVIEW

### Purpose
A multi-section showcase website featuring medical/healthcare content with integrated CMS capabilities. The site serves as both a public-facing portfolio/marketing site and an internal content management interface.

### Core Technology Stack
- **Frontend Framework**: React 18.2.0
- **Routing**: React Router DOM 6.30.0
- **Build Tool**: Vite 4.2.0
- **Styling**: Tailwind CSS 3.3.2
- **Animation**: Framer Motion 10.12.16
- **Icons**: Lucide React 0.536.0
- **Node Version**: 18 (Netlify build)

### Key Features
- Multi-section scroll-snap interface
- Video-driven content delivery
- Real-time CMS for content management
- GitBook integration for embedded documentation pages
- Responsive design with tablet optimizations
- Performance monitoring (FPS counter)
- World map interactive editor

---

## 2. SITE STRUCTURE & ROUTES

### Main Routes (SPA)

| Route | Component | Purpose | Status |
|-------|-----------|---------|--------|
| `/` | Home | Main landing page with scroll-snap sections | Public |
| `/blog` | Blog | Blog/content section with sidebar navigation | Public |
| `/neoflix` | Sidebar (Neoflix) | Neoflix content showcase with scroll effects | Public |
| `/toolbox` | Toolbox | Tool/resource showcase page | Public |
| `/map-editor` | WorldMapEditor | Interactive world map editor | Public |
| `/admin` | CMSAdmin | **Admin CMS for Neoflix content** | Protected* |
| `/Toolbox-*` | ToolboxEmbed | Dynamic embedded toolbox pages from GitBook links | Public |

*Admin route currently has no authentication - frontend only

### Special Route Features
- **Dynamic Toolbox Routes**: `/Toolbox-{slug}` - auto-generated from GitBook links found in CMS content
- **Map Editor Mode**: Triggered by `?editor=true` query parameter
- **Navbar Hidden**: On admin, toolbox-embed, and map-editor routes

---

## 3. SITEMAP & PAGE STRUCTURE

### Home Page (`/`)
**Components**: ScrollSnap → SectionManager → Multiple Sections

**Sections** (lazy-loaded):
1. **HeroSection** (eager-loaded)
   - Initial landing content
   - Immediate viewport visibility

2. **MedicalSectionV2** (lazy)
   - Medical content area
   - Fallback: dark background div

3. **MedicalSectionV3** (lazy)
   - Alternative medical content layout

4. **WorldMapSection** (lazy)
   - Interactive world map
   - Location markers

5. **ContactSection** (lazy)
   - Contact form and information
   - Fallback loading state

### Blog Page (`/blog`)
**Route**: `/blog`
**Data Source**: `src/data/blog.js`
**Structure**:
- Multiple blog sections with Gibson-style cyberpunk theme
- Section IDs: `init`, `matrix`, `cyber`, `console`, `protocol`, `datastream`, `collective`
- Animation timings defined per section
- Sidebar navigation with scroll-spy

### Neoflix Page (`/neoflix`)
**Route**: `/neoflix`
**Data Source**: Local CMS (localStorage) with fallbacks to `src/data/neoflix.js`
**Structure**:
- 7 main sections (default):
  1. Preface
  2. Narrative Review
  3. Provider's Perspective
  4. Record, Reflect, Refine
  5. Practical Guidance
  6. Driving Research
  7. International Collaboration

**Content Model**:
```javascript
{
  id: string,           // Unique identifier
  title: string,        // Section title
  textBlock1: string,   // Main markdown text
  video: string,        // Video file path (optional)
  textBlock2: string    // Additional text (optional)
}
```

### Toolbox Page (`/toolbox`)
**Route**: `/toolbox`
**Purpose**: Tool/resource showcase

### Admin CMS (`/admin`)
**Route**: `/admin`
**Component**: CMSAdmin
**Purpose**: Content management for Neoflix sections

---

## 4. DATA MODELS & CONTENT TYPES

### Section Model (Neoflix CMS)

```javascript
Section {
  id: string                    // Unique identifier (e.g., "preface", "section-{timestamp}")
  title: string                 // Display title
  textBlock1: string            // Markdown-formatted main content
  video: string | null          // Video file path from VIDEO_OPTIONS
  textBlock2: string | null     // Optional additional content
}
```

### Video Options Available

Located in CMSAdmin component:
```javascript
[
  '/videos/blurteam.mp4' → 'Team - Collaboration & Teamwork'
  '/videos/blururgency.mp4' → 'Urgency - Critical Care'
  '/videos/blursskills.mp4' → 'Skills - Professional Development'
  '/videos/blurperspectives.mp4' → 'Perspectives - Multiple Views'
  '/videos/blurfocus.mp4' → 'Focus - Research & Analysis'
  '/videos/blurcoordination.mp4' → 'Coordination - Working Together'
]
```

### Markdown Support

Content supports basic markdown:
- `**text**` → Bold
- `*text*` → Italic
- `[text](url)` → Links (with special GitBook handling)

### GitBook Link Integration

**Pattern Match**: `docs.neoflix.care` URLs
**Behavior**:
- URLs matching `docs.neoflix.care/*` create embedded toolbox pages
- Extracted to `/Toolbox-{slug}` routes
- Slug generation: URL path → Title_Case with underscores
- Non-GitBook links open in new tab

**Example Processing**:
```
URL: https://docs.neoflix.care/level-1-fundamentals/2.-planning-your-initiative
↓
Slug: "Planning_Your_Initiative"
↓
Route: /Toolbox-Planning_Your_Initiative
```

---

## 5. CURRENT CMS IMPLEMENTATION

### Frontend CMS (CMSAdmin Component)

**Storage**: localStorage key `neoflix-cms-sections`

**Features**:
- ✅ Create/Edit/Delete sections
- ✅ Reorder sections (up/down buttons)
- ✅ Rich text editor with formatting tools
- ✅ Video selection dropdown
- ✅ Live preview of markdown
- ✅ Export/Download JSON
- ✅ Copy to clipboard
- ✅ Reset to defaults
- ✅ Auto-detect embedded pages from GitBook links

**Limitations**:
- ❌ No backend persistence
- ❌ No authentication/authorization
- ❌ Single browser/device only (localStorage)
- ❌ No version history
- ❌ No multi-user support
- ❌ No media management (videos pre-uploaded)
- ❌ No API integration

**Export Format**:
```json
{
  "sections": [Section],
  "embeddedPages": [
    {
      "label": string,      // Link text
      "url": string,        // Full GitBook URL
      "slug": string,       // Toolbox slug
      "route": string       // /Toolbox-{slug}
    }
  ],
  "exportedAt": "ISO-8601"
}
```

---

## 6. ASSET MANAGEMENT

### Video Assets

**Location**: `/public/videos/`
**Cache Policy**: 1 year immutable (Netlify headers)

**Available Videos**:
- `blurteam.mp4` (Team/Collaboration theme)
- `blururgency.mp4` (Urgency/Critical Care)
- `blursskills.mp4` (Skills/Professional Development)
- `blurperspectives.mp4` (Perspectives/Multiple Views)
- `blurfocus.mp4` (Focus/Research)
- `blurcoordination.mp4` (Coordination/Working Together)
- Unblurred variants also available

### Static Assets
- `worldmap.svg` (for world map editor)

### Cache Headers (Netlify Configuration)

```toml
# Assets: 1 year immutable
/assets/* → Cache-Control: public, max-age=31536000, immutable

# Videos: 1 year immutable
/videos/* → Cache-Control: public, max-age=31536000, immutable

# HTML: Never cache (for SPA routing)
/*.html → Cache-Control: no-cache, no-store, must-revalidate
```

---

## 7. COMPONENT HIERARCHY

### Layout Components
- `Navbar` - Navigation bar (hidden on admin/embed routes)
- `ViewTransition` - Wraps entire app for view transitions
- `ScrollSnap` - Snap scrolling container for home page
- `SectionManager` - Orchestrates section rendering with lazy loading

### Section Components
- `HeroSection` (eager-loaded)
- `MedicalSectionV2` (lazy)
- `MedicalSectionV3` (lazy)
- `WorldMapSection` (lazy)
- `ContactSection` (lazy)

### UI Components
- `Section` - Generic section wrapper
- `ScrollSection` - Scrollable section
- `ContentSection` - Content container
- `Table` (TypeScript) - Data table

### Specialized Components
- `WorldMapEditor` / `WorldMapViewport` - Interactive map
- `MedicalCarousel` / `TabletMedicalCarousel` - Image carousel
- `VideoManager` - Video playback
- `ToolboxEmbed` - Embedded page container
- `MobileNav` / `Sidebar` - Navigation components

### Data/State Management
- Custom Hooks: `useScrollSpy`, `useSectionLifecycle`, `useViewport`, `useTabletLayout`, `useDebounce`
- Data Files: `blog.js`, `neoflix.js`, `contact.js`

---

## 8. BACKEND REQUIREMENTS FOR FULL CMS

### Authentication & Authorization
```
REQUIREMENTS:
- User authentication (JWT or Session-based)
- Role-based access control (Admin, Editor, Viewer)
- Protect /admin route with middleware
- Rate limiting for API endpoints
```

### API Endpoints (Recommended Structure)

#### Content Endpoints
```
GET    /api/sections              # Fetch all sections
GET    /api/sections/:id          # Fetch single section
POST   /api/sections              # Create section
PUT    /api/sections/:id          # Update section
DELETE /api/sections/:id          # Delete section
POST   /api/sections/:id/reorder  # Reorder sections

GET    /api/sections/export       # Export all content
POST   /api/sections/import       # Import from JSON
```

#### Video Management (Optional)
```
GET    /api/videos                # List available videos
POST   /api/videos/upload         # Upload new video
DELETE /api/videos/:id            # Delete video
```

#### Embedded Pages
```
GET    /api/embedded-pages        # Auto-detected from CMS
GET    /api/embedded-pages/:slug  # Get specific page content
```

### Database Schema (PostgreSQL Recommended)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sections Table
CREATE TABLE sections (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  text_block_1 TEXT,
  video_path VARCHAR,
  text_block_2 TEXT,
  display_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Version History (Optional)
CREATE TABLE section_versions (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  text_block_1 TEXT,
  video_path VARCHAR,
  text_block_2 TEXT,
  version_number INT,
  changed_by UUID REFERENCES users(id),
  change_description VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Videos Table (If managing uploads)
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  filename VARCHAR UNIQUE NOT NULL,
  label VARCHAR NOT NULL,
  file_size_bytes INT,
  mime_type VARCHAR,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Embedded Pages Cache (Optional)
CREATE TABLE embedded_pages (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE NOT NULL,
  label VARCHAR NOT NULL,
  gitbook_url VARCHAR,
  section_id UUID REFERENCES sections(id),
  last_extracted_at TIMESTAMP
);
```

### Backend Recommendations

**Framework Options**:
- Node.js (Express, Fastify, NestJS) - JavaScript ecosystem alignment
- Python (Django, FastAPI) - Rapid development
- Go (Gin, Echo) - Performance
- Ruby on Rails - Convention over configuration

**Key Features**:
1. **Authentication**: JWT + refresh tokens
2. **Validation**: Input sanitization + markdown validation
3. **Logging**: API request/response logging
4. **Monitoring**: Error tracking (Sentry, DataDog)
5. **Search**: Full-text search on section content
6. **Media Storage**: S3/CloudFront for videos
7. **Database**: PostgreSQL with backups
8. **Webhooks**: Trigger rebuilds on content changes

---

## 9. DEPLOYMENT & BUILD

### Build Process
```bash
npm run build
# Output: dist/ directory
# Build script: vite build
# Prebuild: git rev-parse --short HEAD > src/version.txt
```

### Netlify Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18
- **SPA Redirect**: All routes redirect to `/index.html` (status 200)
- **Cache Headers**: Configured per asset type

### Environment Variables Needed
```
REACT_APP_API_URL=https://api.example.com
REACT_APP_GITBOOK_DOMAIN=docs.neoflix.care
# Add authentication tokens if needed
```

### Deployment Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "watch": "vite build --watch",
  "deploy:netlify": "npx netlify deploy --prod"
}
```

---

## 10. PERFORMANCE CONSIDERATIONS

### Current Optimizations
- ✅ Lazy loading of sections (home page)
- ✅ Code splitting with React Router
- ✅ Aggressive asset caching (1 year)
- ✅ FPS counter for monitoring
- ✅ Tablet-specific optimizations
- ✅ Suspense boundaries for lazy components

### Recommended Improvements
- 📋 Image optimization (WebP, responsive)
- 📋 Video optimization (adaptive bitrate)
- 📋 Database query optimization
- 📋 CDN for static assets
- 📋 Pagination for long content lists
- 📋 Compression middleware (gzip/brotli)

---

## 11. CONTENT MIGRATION PLAN

### Current State
- Content stored in localStorage (frontend only)
- Fallback to hardcoded defaults in data files

### Migration Steps
1. **Phase 1**: Add API layer with database
2. **Phase 2**: Migrate localStorage data to DB
3. **Phase 3**: Update frontend to use API
4. **Phase 4**: Add authentication
5. **Phase 5**: Implement version history + audit logs

### Data Export/Import
**Current Export Format**: JSON from admin page
**Recommended**: JSON with section versions and timestamps

---

## 12. DEVELOPMENT NOTES

### Important Files
- `src/App.jsx` - Main routing logic
- `src/pages/CMSAdmin.jsx` - CMS implementation (2000+ lines)
- `src/pages/Home.jsx` - Home page with lazy loading
- `src/data/neoflix.js` - Default neoflix content
- `src/data/blog.js` - Default blog content
- `netlify.toml` - Deployment configuration
- `vite.config.js` - Vite bundler config

### Hooks & Utilities
- `useScrollSpy()` - Track scroll position for sidebar
- `useSectionLifecycle()` - Manage section lifecycle events
- `useViewport()` - Track viewport dimensions
- `useTabletLayout()` - Tablet-specific responsive logic
- `useDebounce()` - Debounce function calls

### Testing/Development
- FPS Counter component for performance testing (shows in bottom-left)
- TaskMaster integration for build management
- Watch mode available: `npm run watch`

---

## 13. QUICK REFERENCE

### Adding a New Section
1. Create section component in `src/components/sections/`
2. Add to sections array in page component
3. Wrap in Suspense if lazy-loading
4. Update CMS if content should be editable

### Linking Content
```markdown
[Text](https://docs.neoflix.care/path) → Creates embedded toolbox page
[Text](https://other-url.com) → Opens in new tab
```

### Content Storage Flow
```
Admin CMS Input → Markdown Processing → localStorage
                ↓
          Rendered on /neoflix
                ↓
       Auto-generates embedded pages from GitBook links
```

### Environment Setup
```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

---

## 14. SECURITY CONSIDERATIONS

### Current Gaps
- ❌ No authentication on `/admin` route
- ❌ All content stored in unencrypted localStorage
- ❌ No CSRF protection
- ❌ No rate limiting
- ❌ XSS risk with `dangerouslySetInnerHTML` (markdown rendering)

### Recommended Security Measures
1. Add authentication middleware to `/admin`
2. Sanitize markdown output (DOMPurify)
3. Validate all inputs server-side
4. Use HTTPS only
5. Implement CORS properly
6. Add CSP headers
7. Regular security audits
8. Rotate API keys/secrets

---

## 15. ANALYTICS & MONITORING

### Current
- FPS Counter component (bottom-left in dev)

### Recommended
- Pageview tracking (Google Analytics, Plausible)
- Custom event tracking (CMS updates, section views)
- Error tracking (Sentry)
- Performance monitoring (Core Web Vitals)
- User behavior analytics (Hotjar, Clarity)

---

## Contact & Maintenance

**Tech Stack**: React 18, Vite, Tailwind, React Router
**Deployment**: Netlify
**Storage**: localStorage (frontend) → Backend DB (future)
**Admin Interface**: `/admin` route

For backend integration, prioritize:
1. Authentication & authorization
2. Database for content persistence
3. API layer for CMS
4. Media management
5. Version history & audit logs
