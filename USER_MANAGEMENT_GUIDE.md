# User Management System Guide

## Overview
The Sports Card Tracker now includes a comprehensive user management system that allows administrators to manage all users in the application.

## Features

### 1. User Management Interface
- **Access**: Available only to admin users via the "Users" menu item
- **Location**: Navigate to the Users section from the main navigation menu

### 2. User Operations

#### View All Users
- See a table of all registered users with:
  - Status (Active/Inactive)
  - Username
  - Email
  - Role (Admin/User)
  - Number of cards owned
  - Total value of collection
  - Account creation date

#### Edit User Information
- **Username**: Click on any username to edit it inline
- **Email**: Click on any email to edit it inline
- **Password**: Click the 🔑 button to reset a user's password

#### Change User Roles
- Use the dropdown to change between "User" and "Admin" roles
- System prevents removing the last active admin

#### Enable/Disable Users
- Click the 🚫/✅ button to toggle user account status
- Disabled users cannot log in
- System prevents disabling the last active admin

#### Delete Users
- Click the 🗑️ button to permanently delete a user
- User's cards are preserved and can be reassigned
- System prevents deleting the last admin

### 3. Create New Users
- Click "➕ Add New User" button
- Fill in:
  - Username
  - Email
  - Password
  - Role (User/Admin)
- New users are created as active by default

## Default Admin Account
- **Email**: admin@sportscard.local
- **Password**: admin123
- This account cannot be deleted while it's the only admin

## Security Features
- Only admins can access user management
- Cannot remove/disable the last admin account
- User passwords are stored locally (for demo purposes)
- Each user can only see their own card collection
- Admins can see statistics for all users

## User Data Isolation
- Each user's card collection is isolated
- Users can only view/edit their own cards
- Admins can see aggregated statistics but not individual cards
- Card backups are user-specific

## Integration with Existing Features
- **Authentication**: Uses local storage for demo purposes
- **Card Management**: Each card is associated with a userId
- **Admin Dashboard**: Shows per-user statistics
- **Backup/Restore**: Maintains user ownership of cards

## Technical Implementation
- **UserService**: Manages all user operations (`src/services/userService.ts`)
- **UserManagement Component**: Admin interface (`src/components/UserManagement/`)
- **Local Storage**: Users are stored in browser's localStorage
- **Database**: Cards table includes userId field with proper indexes

## Best Practices
1. Change the default admin password immediately
2. Create individual accounts for each user
3. Regularly review user access and disable unused accounts
4. Use strong passwords for all accounts
5. Assign admin role only when necessary

## Limitations (Demo Version)
- Passwords are stored in plain text (production would use hashing)
- No email verification for new accounts
- No password recovery mechanism
- All data is stored locally in the browser

## Future Enhancements
- Password hashing and encryption
- Email verification for new accounts
- Password recovery via email
- Two-factor authentication
- User activity logs
- Bulk user operations
- User groups and permissions
- API integration for real authentication