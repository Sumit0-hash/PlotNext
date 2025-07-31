'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Role } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface RoleFormProps {
  role?: Role;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => Promise<void>;
}

export function RoleForm({ role, open, onClose, onSubmit }: RoleFormProps) {
  const [name, setName] = useState(role?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(role?.name || '');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {role ? 'Edit Role' : 'Create Role'}
            </DialogTitle>
            <DialogDescription>
              {role 
                ? 'Update the role name below.'
                : 'Add a new role to the system.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Administrator, Editor, Viewer"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {role ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                role ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}