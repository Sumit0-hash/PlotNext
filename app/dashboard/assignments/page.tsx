'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RolePermissionMatrix } from '@/components/assignments/role-permission-matrix';

export default function AssignmentsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Role Assignments</h1>
          <p className="text-gray-600 mt-2">
            Assign permissions to roles using the interactive matrix below
          </p>
        </div>

        <RolePermissionMatrix />
      </div>
    </DashboardLayout>
  );
}