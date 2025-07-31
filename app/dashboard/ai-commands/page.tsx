'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CommandInterface } from '@/components/ai/command-interface';

export default function AICommandsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Commands</h1>
          <p className="text-gray-600 mt-2">
            Use natural language to manage your RBAC system configuration
          </p>
        </div>

        <CommandInterface />
      </div>
    </DashboardLayout>
  );
}