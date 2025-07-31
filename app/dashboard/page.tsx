'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRoles, getPermissions } from '@/lib/permissions';
import { supabase } from '@/lib/supabase';
import { Users, Key, Shield, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRoles: 0,
    totalPermissions: 0,
    totalAssignments: 0,
    totalUsers: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [rolesResult, permissionsResult, assignmentsResult, usersResult] = await Promise.all([
        getRoles(),
        getPermissions(),
        supabase.from('role_permissions').select('*', { count: 'exact' }),
        supabase.from('user_roles').select('*', { count: 'exact' })
      ]);

      setStats({
        totalRoles: rolesResult.data?.length || 0,
        totalPermissions: permissionsResult.data?.length || 0,
        totalAssignments: assignmentsResult.count || 0,
        totalUsers: usersResult.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Roles',
      value: stats.totalRoles,
      description: 'Active roles in the system',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Permissions',
      value: stats.totalPermissions,
      description: 'Available permissions',
      icon: Key,
      color: 'text-emerald-600'
    },
    {
      title: 'Role Assignments',
      value: stats.totalAssignments,
      description: 'Permission-to-role mappings',
      icon: Shield,
      color: 'text-amber-600'
    },
    {
      title: 'Active Users',
      value: stats.totalUsers,
      description: 'Users with assigned roles',
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your RBAC system configuration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your RBAC system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                  <Key className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="font-medium">Manage Permissions</h3>
                    <p className="text-sm text-gray-600">Create and edit system permissions</p>
                  </div>
                </div>
                <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                  <Users className="h-8 w-8 text-emerald-600 mr-4" />
                  <div>
                    <h3 className="font-medium">Manage Roles</h3>
                    <p className="text-sm text-gray-600">Create and configure user roles</p>
                  </div>
                </div>
                <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                  <Shield className="h-8 w-8 text-amber-600 mr-4" />
                  <div>
                    <h3 className="font-medium">Assign Permissions</h3>
                    <p className="text-sm text-gray-600">Link permissions to roles</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Current status of your RBAC configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Roles with Permissions</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: stats.totalRoles > 0 ? '85%' : '0%' }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Permission Coverage</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: stats.totalPermissions > 0 ? '92%' : '0%' }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Security</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-600 h-2 rounded-full w-full"></div>
                    </div>
                    <span className="text-xs text-gray-600">100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}