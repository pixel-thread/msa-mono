The implementation:

- Allows high role users (SUPER_ADMIN, PRESIDENT, SECRETARY) to create, edit, delete, and publish announcements
- Supports targeting specific user roles or all users
- Sends push notifications to targeted users when announcements are published
- Supports pinning, priority levels, scheduling (publishedAt), and expiration (expiresAt)
- Status workflow: DRAFT → PUBLISHED → ARCHIVED

All done! I've created the announcement feature with the following structure:

**Services** (`src/features/announcement/services/`):

- `createAnnouncement.ts` - Create announcement, sends push notifications to targeted users when published
- `updateAnnouncement.ts` - Update announcement, notifications on publish
- `deleteAnnouncement.ts` - Delete (author only)
- `findManyAnnouncements.ts` - List with pagination, filters, search
- `findUniqueAnnouncement.ts` - Get single announcement

**Validators** (`src/features/announcement/validators/index.ts`):

- Create/Update/Query schemas with support for targeting specific roles, priority, pinning, scheduling

**API Routes** (`src/app/api/announcement/`):

- `GET /api/announcement` - List announcements
- `POST /api/announcement` - Create (high role only)
- `GET /api/announcement/[id]` - Get single
- `PUT /api/announcement/[id]` - Update (author only)
- `DELETE /api/announcement/[id]` - Delete (author only)
- `PATCH /api/announcement/[id]` - Actions: publish, archive, unpublish

Features:

- Role-based access (SUPER_ADMIN, PRESIDENT, SECRETARY can manage)
- Target specific roles or all users
- Push notifications on publish
- Status workflow: DRAFT → PUBLISHED → ARCHIVED
- Pinning, priority levels, scheduling, expiration support

---
