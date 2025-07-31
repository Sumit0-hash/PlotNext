'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { getRoles, getPermissions, assignPermissionToRole, removePermissionFromRole } from '@/lib/permissions';
import { Permission, Role } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function RolePermissionMatrix() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesResult, permissionsResult] = await Promise.all([
        getRoles(),
        getPermissions()
      ]);

      if (rolesResult.error || permissionsResult.error) {
        throw new Error('Failed to load data');
      }

      setRoles(rolesResult.data || []);
      setPermissions(permissionsResult.data || []);

      // Load current assignments
      const { data: rolePermissions, error } = await supabase
        .from('role_permissions')
        .select('role_id, permission_id');

      if (error) throw error;

      const assignmentMap: Record<string, string[]> = {};
      rolePermissions?.forEach(rp => {
        if (!assignmentMap[rp.role_id]) {
          assignmentMap[rp.role_id] = [];
        }
        assignmentMap[rp.role_id].push(rp.permission_id);
      });

      setAssignments(assignmentMap);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (roleId: string, permissionId: string, checked: boolean) => {
    setSaving(true);
    try {
      if (checked) {
        const { error } = await assignPermissionToRole(roleId, permissionId);
        if (error) throw error;
        
        setAssignments(prev => ({
          ...prev,
          [roleId]: [...(prev[roleId] || []), permissionId]
        }));
        
        toast.success('Permission assigned successfully');
      } else {
        const { error } = await removePermissionFromRole(roleId, permissionId);
        if (error) throw error;
        
        setAssignments(prev => ({
          ...prev,
          [roleId]: (prev[roleId] || []).filter(id => id !== permissionId)
        }));
        
        toast.success('Permission removed successfully');
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role-Permission Matrix</CardTitle>
        <CardDescription>
          Manage which permissions are assigned to each role. Check the boxes to assign permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Permission</th>
                {roles.map(role => (
                  <th key={role.id} className="text-center p-4 font-medium min-w-[120px]">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map(permission => (
                <tr key={permission.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{permission.name}</div>
                      {permission.description && (
                        <div className="text-sm text-gray-500 mt-1">{permission.description}</div>
                      )}
                    </div>
                  </td>
                  {roles.map(role => {
                    const isAssigned = assignments[role.id]?.includes(permission.id) || false;
                    return (
                      <td key={role.id} className="p-4 text-center">
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={(checked) => 
                            handlePermissionToggle(role.id, permission.id, checked as boolean)
                          }
                          disabled={saving}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {permissions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No permissions found. Create some permissions first.
          </div>
        )}
        
        {roles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No roles found. Create some roles first.
          </div>
        )}
      </CardContent>
    </Card>
  );
}