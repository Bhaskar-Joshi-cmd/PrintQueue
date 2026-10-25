-- 1. First register the account normally through the PrintQueue UI.
-- 2. Replace the email below with that registered test account's email.
-- 3. Run this in the Supabase SQL Editor, from an account with database-admin access.
-- 4. Never add a role selector to public registration.

update public.users
set role = 'staff'
where email = 'your-staff-account@example.com';

-- Check that exactly the intended account is staff:
select id, full_name, email, role
from public.users
where email = 'your-staff-account@example.com';
