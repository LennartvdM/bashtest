# Backend Setup & Implementation Guide

**Target Audience**: Backend developers implementing the CMS API
**Status**: Implementation Guide
**Version**: 1.0

---

## Quick Start: Choose Your Stack

### Option 1: Node.js + Express (Recommended for JS ecosystem alignment)

```bash
# Create project
mkdir bashtest-api && cd bashtest-api
npm init -y

# Install dependencies
npm install express cors dotenv jsonwebtoken bcryptjs pg
npm install -D nodemon typescript @types/express @types/node

# Install ORM
npm install typeorm reflect-metadata pg
```

**Recommended**: NestJS for larger teams (full-featured, opinionated)
```bash
npm install -g @nestjs/cli
nest new bashtest-api
```

### Option 2: Python + FastAPI

```bash
python -m venv venv
source venv/bin/activate

pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose python-dotenv
pip install alembic  # Database migrations
```

### Option 3: Go + Gin

```bash
go mod init github.com/yourusername/bashtest-api
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm gorm.io/driver/postgres
```

---

## Phase 1: MVP Setup (1-2 weeks)

### 1. Environment Setup

Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bashtest_cms
DB_NAME=bashtest_cms
DB_USER=cms_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE_IN=15m
REFRESH_TOKEN_EXPIRE_IN=7d

# Server
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000

# CORS
FRONTEND_URL=http://localhost:5173
```

### 2. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL
# macOS: brew install postgresql@15
# Ubuntu: sudo apt-get install postgresql postgresql-contrib
# Windows: Download from https://www.postgresql.org/download/windows/

# Create database and user
psql postgres

CREATE DATABASE bashtest_cms;
CREATE USER cms_user WITH PASSWORD 'secure_password';
ALTER ROLE cms_user SET client_encoding TO 'utf8';
ALTER ROLE cms_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE cms_user SET default_transaction_deferrable TO on;
ALTER ROLE cms_user SET default_transaction_deferrable TO on;
ALTER ROLE cms_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bashtest_cms TO cms_user;

\q
```

### 3. Initial Schema (Node.js + TypeORM Example)

Create `src/entities/User.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Section } from './Section';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  name: string;

  @Column({ default: 'viewer' })
  role: 'admin' | 'editor' | 'viewer';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  last_login: Date;

  @OneToMany(() => Section, (section) => section.created_by)
  created_sections: Section[];
}
```

Create `src/entities/Section.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { SectionVersion } from './SectionVersion';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  text_block_1: string;

  @Column('text', { nullable: true })
  text_block_2: string;

  @Column({ nullable: true })
  video: string;

  @Column()
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: false })
  is_deleted: boolean;

  @ManyToOne(() => User)
  created_by: User;

  @ManyToOne(() => User)
  updated_by: User;

  @OneToMany(() => SectionVersion, (version) => version.section)
  versions: SectionVersion[];
}
```

### 4. Basic Authentication

Create `src/services/auth.service.ts`:
```typescript
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from '../entities/User';

export class AuthService {
  constructor(private userRepository: Repository<User>) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRE_IN || '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
```

### 5. Authentication Routes

Create `src/routes/auth.routes.ts`:
```typescript
import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/register', (req: Request, res: Response) =>
  authController.register(req, res)
);

router.post('/login', (req: Request, res: Response) =>
  authController.login(req, res)
);

router.post('/refresh', (req: Request, res: Response) =>
  authController.refreshToken(req, res)
);

router.post('/logout', (req: Request, res: Response) =>
  authController.logout(req, res)
);

export default router;
```

### 6. Middleware: Authentication Check

Create `src/middleware/auth.middleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token' } });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload as any;
    next();
  } catch (error) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin only' } });
  }
  next();
};
```

### 7. Sections Controller (CRUD Operations)

Create `src/controllers/sections.controller.ts`:
```typescript
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Section } from '../entities/Section';
import { AuthRequest } from '../middleware/auth.middleware';

export class SectionsController {
  constructor(private sectionsRepository: Repository<Section>) {}

  async getAllSections(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [sections, total] = await this.sectionsRepository.findAndCount({
        where: { is_deleted: false },
        order: { display_order: 'ASC' },
        skip,
        take: limit,
        relations: ['created_by', 'updated_by'],
      });

      res.json({
        data: sections,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  async getSectionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const section = await this.sectionsRepository.findOne({
        where: { id },
        relations: ['created_by', 'updated_by', 'versions'],
      });

      if (!section) {
        return res.status(404).json({ error: { code: 'NOT_FOUND' } });
      }

      res.json(section);
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }

  async createSection(req: AuthRequest, res: Response) {
    try {
      const { title, text_block_1, text_block_2, video, display_order } = req.body;

      // Validate required fields
      if (!title || display_order === undefined) {
        return res.status(400).json({ error: { code: 'INVALID_REQUEST' } });
      }

      const section = this.sectionsRepository.create({
        title,
        text_block_1,
        text_block_2,
        video,
        display_order,
        created_by: { id: req.user!.id } as any,
      });

      const saved = await this.sectionsRepository.save(section);
      res.status(201).json(saved);
    } catch (error) {
      res.status(400).json({ error: { code: 'INVALID_REQUEST', message: error.message } });
    }
  }

  async updateSection(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, text_block_1, text_block_2, video } = req.body;

      const section = await this.sectionsRepository.findOne({ where: { id } });
      if (!section) {
        return res.status(404).json({ error: { code: 'NOT_FOUND' } });
      }

      // Update fields
      section.title = title || section.title;
      section.text_block_1 = text_block_1 !== undefined ? text_block_1 : section.text_block_1;
      section.text_block_2 = text_block_2 !== undefined ? text_block_2 : section.text_block_2;
      section.video = video !== undefined ? video : section.video;
      section.updated_by = { id: req.user!.id } as any;

      const updated = await this.sectionsRepository.save(section);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: { code: 'INVALID_REQUEST', message: error.message } });
    }
  }

  async deleteSection(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const section = await this.sectionsRepository.findOne({ where: { id } });

      if (!section) {
        return res.status(404).json({ error: { code: 'NOT_FOUND' } });
      }

      section.is_deleted = true;
      await this.sectionsRepository.save(section);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  }
}
```

---

## Phase 2: Advanced Features (2-3 weeks)

### 1. Version History

```typescript
@Entity('section_versions')
export class SectionVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Section)
  section: Section;

  @Column()
  version_number: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  text_block_1: string;

  @Column('text', { nullable: true })
  text_block_2: string;

  @Column({ nullable: true })
  video: string;

  @Column()
  display_order: number;

  @ManyToOne(() => User)
  changed_by: User;

  @Column({ nullable: true })
  change_description: string;

  @Column('jsonb', { nullable: true })
  diff_json: any;

  @CreateDateColumn()
  created_at: Date;
}
```

### 2. GitBook Link Extraction

```typescript
// Service to extract links
export class LinkExtractionService {
  extractGitbookLinks(text: string): Array<{ label: string; url: string; slug: string }> {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const gitbookPattern = /docs\.neoflix\.care/i;
    const links = [];

    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      const [, label, url] = match;
      if (gitbookPattern.test(url)) {
        const slug = this.generateSlug(url);
        links.push({ label, url, slug });
      }
    }

    return links;
  }

  private generateSlug(url: string): string {
    const pathParts = url.replace(/^https?:\/\/docs\.neoflix\.care\/?/, '').split('/');
    const lastPart = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];

    return lastPart
      .replace(/^\d+\.-?/, '')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('_');
  }
}
```

### 3. Search Implementation

```typescript
// Full-text search with PostgreSQL
async search(query: string, limit: number = 20): Promise<any[]> {
  const results = await this.sectionsRepository.query(
    `
    SELECT id, title, 'section' as type,
           ts_rank(to_tsvector('english', text_block_1),
                   plainto_tsquery('english', $1)) as rank
    FROM sections
    WHERE to_tsvector('english', text_block_1) @@ plainto_tsquery('english', $1)
    AND is_deleted = false
    ORDER BY rank DESC
    LIMIT $2
    `,
    [query, limit]
  );

  return results;
}
```

### 4. File Upload (Videos)

```typescript
import * as multer from 'multer';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

async uploadVideo(req: AuthRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `videos/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {
    const result = await s3.upload(params).promise();
    res.json({ url: result.Location });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
}
```

---

## Phase 3: Testing & Deployment (1-2 weeks)

### Unit Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

describe('SectionsController', () => {
  let controller: SectionsController;
  let service: SectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectionsController],
      providers: [
        {
          provide: SectionsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SectionsController>(SectionsController);
    service = module.get<SectionsService>(SectionsService);
  });

  it('should return all sections', async () => {
    const mockSections = [{ id: '1', title: 'Test' }];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockSections);

    const result = await controller.getAllSections({} as any, {} as any);
    expect(result).toEqual(mockSections);
  });
});
```

### Docker Setup

`Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bashtest_cms
      POSTGRES_USER: cms_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    environment:
      DATABASE_URL: postgresql://cms_user:secure_password@db:5432/bashtest_cms
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  postgres_data:
```

### Deployment to Heroku/Railway

```bash
# Heroku
heroku create bashtest-cms-api
heroku config:set JWT_SECRET=your_secret
heroku addons:create heroku-postgresql:standard-0
git push heroku main

# Railway
railway link
railway variables set JWT_SECRET=your_secret
railway deploy
```

---

## Frontend Integration

### Update frontend to use API

In `src/pages/CMSAdmin.jsx`, replace localStorage with API calls:

```javascript
// Before: localStorage
const saved = localStorage.getItem(STORAGE_KEY);

// After: API calls
const fetchSections = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('https://api.bashtest.com/api/sections', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

useEffect(() => {
  fetchSections().then(data => setSections(data.data));
}, []);

const updateSection = async (id, field, value) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`https://api.bashtest.com/api/sections/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ [field]: value })
  });
  return response.json();
};
```

---

## Testing Your API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password","name":"Admin"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get sections
curl -X GET http://localhost:3000/api/sections \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create section
curl -X POST http://localhost:3000/api/sections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"New Section",
    "text_block_1":"Content here",
    "video":"/videos/blurteam.mp4",
    "display_order":8
  }'
```

### Using Postman

1. Import the API specification
2. Set up environment variables:
   - `{{base_url}}` → `http://localhost:3000`
   - `{{token}}` → Copy from login response
3. Run collection tests

---

## Checklist: MVP Completion

- [ ] Database setup and migrations
- [ ] User authentication (register/login)
- [ ] JWT token generation and validation
- [ ] GET /api/sections (list)
- [ ] GET /api/sections/:id (get)
- [ ] POST /api/sections (create, admin only)
- [ ] PUT /api/sections/:id (update, admin only)
- [ ] DELETE /api/sections/:id (delete, admin only)
- [ ] Error handling with standard format
- [ ] CORS configured for frontend
- [ ] Rate limiting implemented
- [ ] Request logging
- [ ] Basic monitoring/alerts
- [ ] Database backups
- [ ] Deployment to staging
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation complete

---

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql postgresql://cms_user:password@localhost:5432/bashtest_cms

# Check logs
docker logs bashtest-db
```

### JWT Token Errors
- Verify JWT_SECRET matches in `.env`
- Check token expiration time
- Ensure `Authorization: Bearer TOKEN` format is correct

### CORS Issues
- Add frontend URL to CORS whitelist
- Include credentials in fetch: `credentials: 'include'`

---

## Next Steps

1. Choose backend framework and start Phase 1
2. Set up GitHub Actions for CI/CD
3. Configure monitoring (Sentry, Datadog)
4. Plan database backup strategy
5. Document API in Swagger/OpenAPI
6. Set up staging environment
7. Plan data migration from localStorage

---

**Last Updated**: February 2025
**Status**: Ready for Implementation
