-- Fix foreign key constraint to allow user deletion
-- Drop the existing constraint
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_assigned_by_fkey;

-- Add it back with ON DELETE SET NULL
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_assigned_by_fkey 
FOREIGN KEY (assigned_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;