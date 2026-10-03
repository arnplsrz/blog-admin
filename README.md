# blog-admin

Admin site for blog-api: manage posts (Quill editor, publish toggle) and comments.

## Setup

    cp .env.example .env
    pnpm install
    pnpm dev

Runs on http://localhost:5174. Add that origin to `ALLOWED_ORIGINS` in blog-api.

Only users with the AUTHOR role can log in. Promote a user in the DB:

    UPDATE "User" SET role = 'AUTHOR' WHERE email = '...';
