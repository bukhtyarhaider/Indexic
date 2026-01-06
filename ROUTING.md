# Routing Structure

## Routes

### Public Routes (Unauthenticated)
- `/signin` - Sign in page for existing users
- `/signup` - Sign up page for new user registration

### Protected Routes (Requires Authentication)
- `/dashboard` - Main dashboard (default authenticated route)

### Default Behavior
- `/` - Redirects to `/dashboard` (which redirects to `/signin` if not authenticated)
- Any unmatched route (`*`) - Redirects to `/dashboard`

## Authentication Flow

1. **Unauthenticated Users**
   - Accessing `/` or `/dashboard` redirects to `/signin`
   - Can navigate between `/signin` and `/signup`
   - After successful sign-up, shown email verification screen
   - After successful sign-in, redirected to `/dashboard`

2. **Authenticated Users**
   - Direct access to `/dashboard`
   - Accessing `/signin` or `/signup` while authenticated shows those pages
   - Logout redirects to `/signin`

## Components

- **ProtectedRoute**: Wraps protected routes and handles authentication checks
- **SignIn**: Dedicated sign-in page with form validation
- **SignUp**: Dedicated sign-up page with email verification flow
- **Dashboard**: Main application dashboard (protected)

## Error Handling

All pages include:
- Client-side form validation
- Server-side error handling
- User-friendly error messages
- Loading states during authentication
- Toast notifications for success/error feedback
