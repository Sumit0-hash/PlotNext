'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionForm } from '@/components/permissions/permission-form';
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
import { getPermissions, createPermission, updatePermission, deletePermission } from '@/lib/permissions';
import { Permission } from '@/lib/supabase';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | undefined>();

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    const filtered = permissions.filter(permission =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
    setFilteredPermissions(filtered);
  }, [permissions, searchTerm]);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await getPermissions();
      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async (data: { name: string; description?: string }) => {
    try {
      const { error } = await createPermission(data);
      if (error) throw error;
      toast.success('Permission created successfully');
      loadPermissions();
    } catch (error: any) {
      console.error('Error creating permission:', error);
      if (error.code === '23505') {
        toast.error('A permission with this name already exists');
      } else {
        toast.error('Failed to create permission');
      }
    }
  };

  const handleUpdatePermission = async (data: { name: string; description?: string }) => {
    if (!editingPermission) return;
    
    try {
      const { error } = await updatePermission(editingPermission.id, data);
      if (error) throw error;
      toast.success('Permission updated successfully');
      loadPermissions();
    } catch (error: any) {
      console.error('Error updating permission:', error);
      if (error.code === '23505') {
        toast.error('A permission with this name already exists');
      } else {
        toast.error('Failed to update permission');
      }
    }
  };

  const handleDeletePermission = async (permission: Permission) => {
    if (!confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
      return;
    }

    try {
      const { error } = await deletePermission(permission.id);
      if (error) throw error;
      toast.success('Permission deleted successfully');
      loadPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast.error('Failed to delete permission');
    }
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPermission(undefined);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Permissions</h1>
            <p className="text-gray-600 mt-2">
              Manage system permissions and access controls
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Permission
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              All Permissions
            </CardTitle>
            <CardDescription>
              {permissions.length} permission{permissions.length !== 1 ? 's' : ''} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
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
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Loading permissions...
                      </TableCell>
                    </TableRow>
                  ) : filteredPermissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {searchTerm ? 'No permissions match your search.' : 'No permissions found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{permission.name}</Badge>
                        </TableCell>
                        <TableCell>
                          {permission.description || (
                            <span className="text-muted-foreground italic">No description</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(permission.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPermission(permission)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePermission(permission)}
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

        <PermissionForm
          permission={editingPermission}
          open={showForm}
          onClose={handleCloseForm}
          onSubmit={editingPermission ? handleUpdatePermission : handleCreatePermission}
        />
      </div>
    </DashboardLayout>
  );
}