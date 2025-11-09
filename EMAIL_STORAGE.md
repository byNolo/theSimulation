# Email Storage Feature

## Overview
Users' email addresses from KeyN OAuth are now stored in the database to help administrators identify users.

## Changes Made

### Database
- Added `email` column to the `users` table (VARCHAR 255, nullable)
- Migration script: `server/scripts/add_email_column.py`

### Backend (`server/`)
- **models.py**: Added `email` field to User model
- **utils/auth.py**: Updated `upsert_user_from_token()` to store and update email addresses from KeyN
- **routes/admin.py**: Updated user management endpoints to include email in responses
  - `GET /api/admin/users` - List users (includes email)
  - `GET /api/admin/users/<user_id>` - Get user details (includes email)

### Frontend (`web/`)
- **components/UserManager.tsx**: 
  - Added email column to user list table
  - Added email display in user detail modal
  - Shows "No email" or "Not provided" for users without emails
- **services/api.ts**: Updated TypeScript interfaces to include email field

## How It Works

1. When a user authenticates via KeyN OAuth, the email is requested in the scopes
2. On successful authentication, the email is extracted from the KeyN user data
3. For new users, the email is stored when the user record is created
4. For existing users, the email is updated if available in the OAuth response
5. Admins can view user emails in the Users tab of the Admin Panel

## Backwards Compatibility

- The `email` column is nullable, so existing users without emails won't cause issues
- Users who authenticated before this change will have their email populated on their next login
- The migration script is idempotent and can be run multiple times safely

## Admin Interface

In the Admin Panel → Users tab, you can now see:
- Email address in the user list table (new column)
- Email address in the detailed user view modal (top section)
- If no email is available, it displays "No email" or "Not provided"
