# Hymns2Go - Project Summary

## Overview
A comprehensive web application for managing and distributing hymn lyrics formatted for church presentation software. Built with Next.js 15, TypeScript, PostgreSQL, and Tailwind CSS.

## ✅ Completed Features

### Backend & API
- **Database Schema** (Prisma + PostgreSQL)
  - User authentication
  - Hymn storage with metadata
  - Tag/category system
  - Structured JSON storage for parsed hymn data

- **RESTful API** (`/api/hymns`)
  - GET list with search, filtering, pagination
  - GET single hymn by ID
  - POST create hymn (admin only)
  - PUT update hymn (admin only)
  - DELETE hymn (admin only)
  - GET download endpoint with multiple format support

- **Authentication** (NextAuth.js)
  - Credential-based login
  - Protected admin routes
  - Middleware for route protection

- **Text Processing Engine**
  - Auto-detects verse/chorus/bridge sections
  - Strips punctuation and formatting labels
  - Configurable lines-per-slide formatting
  - Preserves hymn structure as JSON

- **File Generators**
  - PowerPoint (.pptx) - using pptxgenjs
  - ProPresenter (.pro, .pro6) - custom XML generator
  - Plain text (full and per-slide formats)

### Admin UI
- **Login Page** (`/admin/login`)
  - Email/password authentication
  - Error handling and validation

- **Dashboard** (`/admin`)
  - Statistics overview (total hymns, tags)
  - Recently added hymns
  - Quick action buttons

- **Navigation**
  - Persistent header with nav links
  - User email display
  - Sign out functionality

- **Upload Hymn** (`/admin/upload`)
  - Text paste input
  - File upload (.txt)
  - Metadata fields (title, author, year)
  - Copyright info (public domain, publisher, CCLI)
  - Tag management (comma-separated)
  - Form validation

- **Manage Hymns** (`/admin/hymns`)
  - Paginated list view
  - Search functionality
  - Edit/delete actions
  - Tag display

- **Edit Hymn** (`/admin/hymns/[id]`)
  - Pre-populated form
  - Same fields as upload
  - Save changes

### Public UI
- **Home Page** (`/`)
  - Hero section with tagline
  - Search bar
  - Statistics display
  - Features showcase
  - Popular tags/categories
  - Footer with copyright notice

- **Browse Hymns** (`/hymns`)
  - Grid layout of hymns
  - Search functionality
  - Filter by tag/category
  - Pagination
  - Hymn metadata display

- **Hymn Detail** (`/hymns/[id]`)
  - Full hymn information
  - Copyright details
  - Tag links
  - Interactive preview with configurable slides
  - Download options panel

- **Download Options**
  - Lines per slide selector (1-6)
  - ProPresenter version selector (6 or 7)
  - Multiple format downloads:
    - PowerPoint (.pptx)
    - ProPresenter (.pro/.pro6)
    - Plain text
    - Per-slide text
  - Client-side download handling

- **Preview**
  - Live slide preview
  - Title slide simulation
  - Adjustable lines per slide
  - Dark slide backgrounds
  - Slide count display

## Project Structure

```
hymns2go/
├── app/
│   ├── page.tsx                      # Public home page
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout with nav
│   │   ├── page.tsx                  # Admin dashboard
│   │   ├── login/page.tsx            # Login page
│   │   ├── upload/page.tsx           # Upload hymn form
│   │   └── hymns/
│   │       ├── page.tsx              # Manage hymns list
│   │       └── [id]/page.tsx         # Edit hymn
│   ├── hymns/
│   │   ├── page.tsx                  # Browse hymns
│   │   └── [id]/page.tsx             # Hymn detail
│   └── api/
│       ├── auth/[...nextauth]/       # NextAuth handler
│       └── hymns/
│           ├── route.ts              # List/create hymns
│           ├── [id]/route.ts         # Get/update/delete
│           └── [id]/download/route.ts # Download handler
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx              # Admin navigation
│   │   ├── DeleteHymnButton.tsx      # Delete confirmation
│   │   └── EditHymnForm.tsx          # Edit form component
│   └── public/
│       ├── SearchBar.tsx             # Search input
│       ├── DownloadOptions.tsx       # Download controls
│       └── HymnPreview.tsx           # Slide preview
├── lib/
│   ├── auth/
│   │   ├── config.ts                 # NextAuth config
│   │   └── index.ts                  # Auth exports
│   ├── db/
│   │   └── prisma.ts                 # Prisma client
│   ├── hymn-processor/
│   │   └── parser.ts                 # Text processing logic
│   └── file-generators/
│       ├── powerpoint.ts             # PPTX generator
│       └── propresenter.ts           # ProPresenter XML
├── prisma/
│   └── schema.prisma                 # Database schema
├── scripts/
│   └── create-admin.ts               # Admin user creation
├── middleware.ts                     # Route protection
├── .env                              # Environment variables
├── .env.example                      # Env template
└── README.md                         # Documentation

```

## Getting Started

1. **Install dependencies:**
   ```bash
   cd /Users/nicholasharvey/Hymns2Go/hymns2go
   npm install
   ```

2. **Set up database:**
   ```bash
   # Start local Prisma dev server
   npx prisma dev

   # Or use external PostgreSQL and update DATABASE_URL in .env
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Create admin user:**
   ```bash
   npm install -D tsx
   npx tsx scripts/create-admin.ts admin@example.com yourpassword
   ```

5. **Start dev server:**
   ```bash
   npm run dev
   ```

6. **Access the app:**
   - Public site: http://localhost:3000
   - Admin login: http://localhost:3000/admin/login

## API Examples

### List Hymns
```bash
GET /api/hymns?search=amazing&page=1&limit=20
```

### Get Hymn
```bash
GET /api/hymns/abc123
```

### Download PowerPoint (2 lines per slide)
```bash
GET /api/hymns/abc123/download?format=pptx&linesPerSlide=2
```

### Download ProPresenter 7
```bash
GET /api/hymns/abc123/download?format=propresenter&proPresenterVersion=7&linesPerSlide=2
```

### Create Hymn (requires auth)
```bash
POST /api/hymns
Content-Type: application/json

{
  "title": "Amazing Grace",
  "author": "John Newton",
  "year": 1779,
  "rawText": "Amazing grace! How sweet the sound...",
  "isPublicDomain": true,
  "tags": ["salvation", "grace"]
}
```

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **File Generation:** pptxgenjs, custom XML

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `DATABASE_URL` (Vercel Postgres)
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

Vercel will automatically handle builds and serverless functions.

## Next Steps (Future Enhancements)
- [ ] Batch upload functionality
- [ ] More export formats (EasyWorship, MediaShout)
- [ ] User accounts for favorites/history
- [ ] Advanced search (by year, theme)
- [ ] Hymnal number tracking
- [ ] Mobile responsive improvements
- [ ] Dark mode
- [ ] Copy-to-clipboard for text formats
- [ ] Email notifications for new hymns
- [ ] Analytics dashboard

## Notes
- All hymn text is processed and stored with structure preserved
- Downloads are generated on-demand from stored structure
- Minimal formatting allows users to apply their own templates
- Copyright information is tracked but validation is the admin's responsibility
- API is fully RESTful and can be used by third-party tools
