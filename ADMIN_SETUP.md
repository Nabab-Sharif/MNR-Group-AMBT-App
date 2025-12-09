# Admin Role Assignment Guide

## Security Improvements Implemented

All critical security vulnerabilities have been fixed:

1. **✅ Removed hardcoded admin ID** - No more client-side authentication bypass
2. **✅ Implemented role-based access control** - Created `user_roles` table with `has_role()` function
3. **✅ Fixed overly permissive RLS policies** - All data modification operations now require admin role
4. **✅ Added input validation** - Form data and file uploads are now validated
5. **✅ Restricted storage access** - Only admins can upload/modify/delete player photos

## How to Assign Admin Roles

Since the hardcoded admin ID has been removed for security, you now need to manually assign admin roles to users through the backend.

### Option 1: Using Lovable Cloud Backend (Recommended)

1. Open your Lovable Cloud backend
2. Navigate to the Database section
3. Open the `user_roles` table
4. Insert a new row:
   - `user_id`: The UUID of the user (found in the auth.users table)
   - `role`: Select `admin`

### Option 2: Using the Edge Function (Advanced)

1. Set an `ADMIN_SECRET` in your environment secrets
2. Call the `assign-admin-role` edge function:

```javascript
const response = await fetch('YOUR_EDGE_FUNCTION_URL/assign-admin-role', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user-uuid-here',
    adminSecret: 'your-admin-secret'
  })
});
```

### Option 3: Direct SQL Query

Run this SQL in your database:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

## User Registration Flow

1. Users register normally through the signup form
2. After registration, they can log in but won't have admin access
3. An existing admin must manually assign the admin role using one of the methods above
4. Once the role is assigned, the user will have full admin access on their next login

## Important Security Notes

- Never share your `ADMIN_SECRET` 
- Only assign admin roles to trusted users
- Regularly audit the `user_roles` table to ensure no unauthorized admin access
- All match data, scores, and photos can only be modified by users with the admin role
