import { supabase, Permission, Role, RolePermission } from './supabase';

// Permission CRUD operations
export const getPermissions = async () => {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('name');
  return { data, error };
};

export const createPermission = async (permission: Omit<Permission, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('permissions')
    .insert([permission])
    .select()
    .single();
  return { data, error };
};

export const updatePermission = async (id: string, permission: Partial<Permission>) => {
  const { data, error } = await supabase
    .from('permissions')
    .update(permission)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deletePermission = async (id: string) => {
  const { error } = await supabase
    .from('permissions')
    .delete()
    .eq('id', id);
  return { error };
};

// Role CRUD operations
export const getRoles = async () => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name');
  return { data, error };
};

export const createRole = async (role: Omit<Role, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('roles')
    .insert([role])
    .select()
    .single();
  return { data, error };
};

export const updateRole = async (id: string, role: Partial<Role>) => {
  const { data, error } = await supabase
    .from('roles')
    .update(role)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteRole = async (id: string) => {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id);
  return { error };
};

// Role-Permission relationships
export const getRolePermissions = async (roleId: string) => {
  const { data, error } = await supabase
    .from('role_permissions')
    .select(`
      permission_id,
      permissions (
        id,
        name,
        description,
        created_at
      )
    `)
    .eq('role_id', roleId);
  return { data, error };
};

export const getPermissionRoles = async (permissionId: string) => {
  const { data, error } = await supabase
    .from('role_permissions')
    .select(`
      role_id,
      roles (
        id,
        name,
        created_at
      )
    `)
    .eq('permission_id', permissionId);
  return { data, error };
};

export const assignPermissionToRole = async (roleId: string, permissionId: string) => {
  const { data, error } = await supabase
    .from('role_permissions')
    .insert([{ role_id: roleId, permission_id: permissionId }])
    .select();
  return { data, error };
};

export const removePermissionFromRole = async (roleId: string, permissionId: string) => {
  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)
    .eq('permission_id', permissionId);
  return { error };
};

export const getRolesWithPermissions = async () => {
  const { data, error } = await supabase
    .from('roles')
    .select(`
      *,
      role_permissions (
        permissions (
          id,
          name,
          description,
          created_at
        )
      )
    `)
    .order('name');
  return { data, error };
};