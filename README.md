# Hymns2Go

A modern web application for managing and distributing hymn lyrics formatted for church presentation software.

## Features

- **Admin Dashboard**: Upload and manage hymn lyrics with automatic text processing
- **Smart Text Processing**: Automatically strips punctuation, verse numbers, and formatting labels
- **Multiple Export Formats**:
  - PowerPoint (.pptx)
  - ProPresenter (.pro, .pro6)
  - Plain text (full and per-slide)
- **Customizable Formatting**: Choose lines per slide at download time
- **Rich Metadata**: Track authors, years, copyright info, CCLI numbers, and tags
- **Public API**: RESTful API for third-party integrations
- **Search & Browse**: Find hymns by title, author, or tags

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **File Generation**: pptxgenjs, custom XML generators

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use Prisma local dev server)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string
- `AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., http://localhost:3000)

3. Run database migrations:
```bash
npx prisma migrate dev --name init
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Create an admin user (see script below)

6. Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Database Setup

### Local Development (Prisma Dev)

Use Prisma's local development server:

```bash
npx prisma dev
```

This will start a local PostgreSQL instance. The URL will be automatically added to your `.env`.

### Production (Vercel Postgres)

1. Create a Vercel Postgres database
2. Copy the connection string to your `.env` file
3. Run migrations: `npx prisma migrate deploy`

## Creating an Admin User

You'll need to create a script to add your first admin user. Create `scripts/create-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'password123';

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin',
    },
  });

  console.log('Admin user created:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Install tsx if needed: `npm install -D tsx`

Run with: `npx tsx scripts/create-admin.ts your@email.com yourpassword`

## API Documentation

### Public Endpoints

#### GET /api/hymns
List all hymns with optional filtering.

**Query Parameters:**
- `search` (optional): Search by title or author
- `tag` (optional): Filter by tag slug
- `page` (default: 1): Page number
- `limit` (default: 50): Results per page

**Response:**
```json
{
  "hymns": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

#### GET /api/hymns/[id]
Get a single hymn by ID.

#### GET /api/hymns/[id]/download
Download hymn in various formats.

**Query Parameters:**
- `format`: `pptx`, `propresenter`, `text`, or `text-per-slide`
- `linesPerSlide` (default: 2): Number of lines per slide
- `proPresenterVersion` (default: 6): ProPresenter version (6 or 7)

**Example:**
```
GET /api/hymns/abc123/download?format=pptx&linesPerSlide=2
```

### Admin Endpoints (Requires Authentication)

#### POST /api/hymns
Create a new hymn.

**Body:**
```json
{
  "title": "Amazing Grace",
  "author": "John Newton",
  "year": 1779,
  "rawText": "Amazing grace! How sweet the sound...",
  "isPublicDomain": true,
  "ccliNumber": "12345",
  "tags": ["salvation", "grace"]
}
```

#### PUT /api/hymns/[id]
Update a hymn.

#### DELETE /api/hymns/[id]
Delete a hymn.

## Project Structure

```
hymns2go/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   └── hymns/        # Hymn CRUD and download
│   ├── admin/            # Admin dashboard pages
│   └── hymns/            # Public hymn pages
├── components/
│   ├── admin/            # Admin UI components
│   ├── public/           # Public-facing components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── auth/             # Authentication logic
│   ├── db/               # Database client
│   ├── hymn-processor/   # Text parsing and formatting
│   └── file-generators/  # PowerPoint, ProPresenter generators
├── prisma/
│   └── schema.prisma     # Database schema
└── middleware.ts         # Auth middleware
```

## How It Works

### Text Processing

1. Admin uploads raw hymn text (with verse numbers, punctuation, etc.)
2. System parses text using `lib/hymn-processor/parser.ts`:
   - Detects verses, chorus, bridge sections
   - Strips punctuation and formatting labels
   - Stores structured data as JSON
3. At download time, formats into slides based on user preferences

### File Generation

- **PowerPoint**: Uses `pptxgenjs` to create .pptx files with minimal formatting
- **ProPresenter**: Generates XML in ProPresenter 6/7 format
- **Text**: Simple plain text formatting

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

Vercel will automatically:
- Build your Next.js app
- Set up serverless functions for API routes
- Provide a PostgreSQL database (Vercel Postgres)

## TODO

- [ ] Build admin UI pages
- [ ] Build public browse/search pages
- [ ] Add tests
- [ ] Add batch upload functionality
- [ ] Add more export formats (EasyWorship, MediaShout)
- [ ] Add styling/theming
- [ ] Add user accounts for favorites/history

## License

TBD - Consider copyright implications for hymn content.
