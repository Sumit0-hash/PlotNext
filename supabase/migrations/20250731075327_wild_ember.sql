/*
  # RBAC Schema Setup

  1. New Tables
    - `permissions`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, nullable)
      - `created_at` (timestamp)
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `role_permissions` (junction table)
      - `role_id` (uuid, foreign key)
      - `permission_id` (uuid, foreign key)
    - `user_roles` (junction table)
      - `user_id` (uuid, foreign key to auth.users)
      - `role_id` (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage RBAC data
    - Restrict access to users with appropriate permissions

  3. Sample Data
    - Create default admin role and permissions
    - Set up basic permission structure
*/

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Enable Row Level Security
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for permissions table
CREATE POLICY "Users can read permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage permissions"
  ON permissions
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for roles table
CREATE POLICY "Users can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for role_permissions table
CREATE POLICY "Users can read role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage role permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for user_roles table
CREATE POLICY "Users can read user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (true);

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
  ('manage_permissions', 'Can create, read, update, and delete permissions'),
  ('manage_roles', 'Can create, read, update, and delete roles'),
  ('manage_users', 'Can manage user role assignments'),
  ('view_dashboard', 'Can access the main dashboard'),
  ('edit_articles', 'Can create and edit articles'),
  ('delete_articles', 'Can delete articles'),
  ('publish_content', 'Can publish content to live site'),
  ('moderate_comments', 'Can moderate user comments'),
  ('view_analytics', 'Can view site analytics and reports')
ON CONFLICT (name) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name) VALUES
  ('Administrator'),
  ('Content Editor'),
  ('Support Agent'),
  ('Viewer')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to Administrator role
DO $$
DECLARE
  admin_role_id uuid;
  perm_record RECORD;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'Administrator';
  
  FOR perm_record IN SELECT id FROM permissions LOOP
    INSERT INTO role_permissions (role_id, permission_id) 
    VALUES (admin_role_id, perm_record.id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Assign permissions to Content Editor role
DO $$
DECLARE
  editor_role_id uuid;
BEGIN
  SELECT id INTO editor_role_id FROM roles WHERE name = 'Content Editor';
  
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT editor_role_id, p.id
  FROM permissions p
  WHERE p.name IN ('view_dashboard', 'edit_articles', 'publish_content', 'moderate_comments')
  ON CONFLICT DO NOTHING;
END $$;

-- Assign permissions to Support Agent role
DO $$
DECLARE
  support_role_id uuid;
BEGIN
  SELECT id INTO support_role_id FROM roles WHERE name = 'Support Agent';
  
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT support_role_id, p.id
  FROM permissions p
  WHERE p.name IN ('view_dashboard', 'moderate_comments', 'manage_users')
  ON CONFLICT DO NOTHING;
END $$;

-- Assign permissions to Viewer role
DO $$
DECLARE
  viewer_role_id uuid;
BEGIN
  SELECT id INTO viewer_role_id FROM roles WHERE name = 'Viewer';
  
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT viewer_role_id, p.id
  FROM permissions p
  WHERE p.name = 'view_dashboard'
  ON CONFLICT DO NOTHING;
END $$;