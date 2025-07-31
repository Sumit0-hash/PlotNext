'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleForm } from '@/components/roles/role-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getRoles, createRole, updateRole, deleteRole, getRolePermissions } from '@/lib/permissions';
import { Role } from '@/lib/supabase';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface RoleWithPermissionCount extends Role {
  permissionCount: number;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleWithPermissionCount[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<RoleWithPermissionCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>();

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    const filtered = roles.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [roles, searchTerm]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const { data, error } = await getRoles();
      if (error) throw error;

      // Load permission counts for each role
      const rolesWithCounts = await Promise.all(
        (data || []).map(async (role) => {
          const { data: permissions } = await getRolePermissions(role.id);
          return {
            ...role,
            permissionCount: permissions?.length || 0
          };
        })
      );

      setRoles(rolesWithCounts);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (data: { name: string }) => {
    try {
      const { error } = await createRole(data);
      if (error) throw error;
      toast.success('Role created successfully');
      loadRoles();
    } catch (error: any) {
      console.error('Error creating role:', error);
      if (error.code === '23505') {
        toast.error('A role with this name already exists');
      } else {
        toast.error('Failed to create role');
      }
    }
  };

  const handleUpdateRole = async (data: { name: string }) => {
    if (!editingRole) return;
    
    try {
      const { error } = await updateRole(editingRole.id, data);
      if (error) throw error;
      toast.success('Role updated successfully');
      loadRoles();
    } catch (error: any) {
      console.error('Error updating role:', error);
      if (error.code === '23505') {
        toast.error('A role with this name already exists');
      } else {
        toast.error('Failed to update role');
      }
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    try {
      const { error } = await deleteRole(role.id);
      if (error) throw error;
      toast.success('Role deleted successfully');
      loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRole(undefined);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
            <p className="text-gray-600 mt-2">
              Manage user roles and their access levels
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Roles
            </CardTitle>
            <CardDescription>
              {roles.length} role{roles.length !== 1 ? 's' : ''} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Loading roles...
                      </TableCell>
                    </TableRow>
                  ) : filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {searchTerm ? 'No roles match your search.' : 'No roles found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <Badge variant="secondary">{role.name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {role.permissionCount} permission{role.permissionCount !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(role.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteRole(role)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <RoleForm
          role={editingRole}
          open={showForm}
          onClose={handleCloseForm}
          onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
        />
      </div>
    </DashboardLayout>
  );
}