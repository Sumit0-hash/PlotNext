'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parseCommand, getCommandSuggestions, NLPCommand } from '@/lib/nlp';
import { createPermission, createRole, getRoles, getPermissions, assignPermissionToRole } from '@/lib/permissions';
import { Brain, Send, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CommandInterface() {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [parsedCommand, setParsedCommand] = useState<NLPCommand | null>(null);

  const suggestions = getCommandSuggestions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    setLastCommand(command);

    try {
      const parsed = await parseCommand(command);
      setParsedCommand(parsed);

      if (!parsed) {
        toast.error('Could not understand the command. Please try a different format.');
        return;
      }

      await executeCommand(parsed);
      setCommand('');
    } catch (error) {
      console.error('Error executing command:', error);
      toast.error('Failed to execute command');
    } finally {
      setLoading(false);
    }
  };

  const executeCommand = async (cmd: NLPCommand) => {
    switch (cmd.action) {
      case 'create_permission':
        if (cmd.permissionName) {
          const { error } = await createPermission({
            name: cmd.permissionName,
            description: cmd.description
          });
          if (error) throw error;
          toast.success(`Permission "${cmd.permissionName}" created successfully`);
        }
        break;

      case 'create_role':
        if (cmd.roleName) {
          const { error } = await createRole({
            name: cmd.roleName
          });
          if (error) throw error;
          toast.success(`Role "${cmd.roleName}" created successfully`);
        }
        break;

      case 'assign_permission':
        if (cmd.roleName && cmd.permissionName) {
          // Find role and permission IDs
          const [rolesResult, permissionsResult] = await Promise.all([
            getRoles(),
            getPermissions()
          ]);

          const role = rolesResult.data?.find(r => r.name.toLowerCase() === cmd.roleName?.toLowerCase());
          const permission = permissionsResult.data?.find(p => p.name.toLowerCase() === cmd.permissionName?.toLowerCase());

          if (!role) {
            toast.error(`Role "${cmd.roleName}" not found`);
            return;
          }

          if (!permission) {
            toast.error(`Permission "${cmd.permissionName}" not found`);
            return;
          }

          const { error } = await assignPermissionToRole(role.id, permission.id);
          if (error) {
            if (error.code === '23505') { // Unique constraint violation
              toast.warning(`Permission "${cmd.permissionName}" is already assigned to role "${cmd.roleName}"`);
            } else {
              throw error;
            }
          } else {
            toast.success(`Assigned permission "${cmd.permissionName}" to role "${cmd.roleName}"`);
          }
        }
        break;

      default:
        toast.error('Command not yet implemented');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCommand(suggestion);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Command Interface
          </CardTitle>
          <CardDescription>
            Use natural language to manage roles and permissions. Type commands like "Create a new role called Editor" or "Give the Administrator role the manage_users permission".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Type a command in natural language..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !command.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>

          {lastCommand && parsedCommand && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Command Interpreted:</span>
              </div>
              <div className="text-sm text-blue-800">
                <div><strong>Input:</strong> {lastCommand}</div>
                <div><strong>Action:</strong> {parsedCommand.action.replace('_', ' ')}</div>
                {parsedCommand.roleName && <div><strong>Role:</strong> {parsedCommand.roleName}</div>}
                {parsedCommand.permissionName && <div><strong>Permission:</strong> {parsedCommand.permissionName}</div>}
                {parsedCommand.description && <div><strong>Description:</strong> {parsedCommand.description}</div>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Command Examples</CardTitle>
          <CardDescription>
            Click on any example to try it out
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <Badge variant="outline" className="mb-2">
                  Example {index + 1}
                </Badge>
                <div className="text-sm">{suggestion}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}