'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Permission } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface PermissionFormProps {
  permission?: Permission;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
}

export function PermissionForm({ permission, open, onClose, onSubmit }: PermissionFormProps) {
  const [name, setName] = useState(permission?.name || '');
  const [description, setDescription] = useState(permission?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(permission?.name || '');
    setDescription(permission?.description || '');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {permission ? 'Edit Permission' : 'Create Permission'}
            </DialogTitle>
            <DialogDescription>
              {permission 
                ? 'Update the permission details below.'
                : 'Add a new permission to the system.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Permission Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., edit_articles, manage_users"
                required
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this permission allows"
                rows={3}
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
                  {permission ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                permission ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}