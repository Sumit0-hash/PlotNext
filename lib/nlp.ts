// Natural Language Processing for RBAC commands
export interface NLPCommand {
  action: 'create_permission' | 'create_role' | 'assign_permission' | 'remove_permission' | 'delete_permission' | 'delete_role';
  roleName?: string;
  permissionName?: string;
  description?: string;
}

export const parseCommand = async (command: string): Promise<NLPCommand | null> => {
  const normalizedCommand = command.toLowerCase().trim();
  
  // Simple pattern matching for common commands
  // In a production app, you'd use a more sophisticated NLP service like Google's Gemini API
  
  // Create permission patterns
  if (normalizedCommand.includes('create') && normalizedCommand.includes('permission')) {
    const permissionMatch = normalizedCommand.match(/create.*permission.*['"](.*?)['"]/);
    if (permissionMatch) {
      return {
        action: 'create_permission',
        permissionName: permissionMatch[1],
        description: `Permission to ${permissionMatch[1]}`
      };
    }
  }
  
  // Create role patterns
  if (normalizedCommand.includes('create') && normalizedCommand.includes('role')) {
    const roleMatch = normalizedCommand.match(/create.*role.*['"](.*?)['"]/);
    if (roleMatch) {
      return {
        action: 'create_role',
        roleName: roleMatch[1]
      };
    }
  }
  
  // Assign permission patterns
  if ((normalizedCommand.includes('give') || normalizedCommand.includes('assign')) && 
      normalizedCommand.includes('permission')) {
    const roleMatch = normalizedCommand.match(/role.*['"](.*?)['"]/);
    const permissionMatch = normalizedCommand.match(/permission.*['"](.*?)['"]/);
    
    if (roleMatch && permissionMatch) {
      return {
        action: 'assign_permission',
        roleName: roleMatch[1],
        permissionName: permissionMatch[1]
      };
    }
  }
  
  // Remove permission patterns
  if (normalizedCommand.includes('remove') && normalizedCommand.includes('permission')) {
    const roleMatch = normalizedCommand.match(/role.*['"](.*?)['"]/);
    const permissionMatch = normalizedCommand.match(/permission.*['"](.*?)['"]/);
    
    if (roleMatch && permissionMatch) {
      return {
        action: 'remove_permission',
        roleName: roleMatch[1],
        permissionName: permissionMatch[1]
      };
    }
  }
  
  return null;
};

export const getCommandSuggestions = (): string[] => {
  return [
    'Create a new permission called "manage settings"',
    'Create a new role called "Moderator"',
    'Give the role "Content Editor" the permission to "edit articles"',
    'Remove the permission "delete users" from role "Support Agent"',
    'Create a permission called "view reports"'
  ];
};