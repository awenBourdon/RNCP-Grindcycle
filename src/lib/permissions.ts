import { UserRole } from '@/generated/prisma'
import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

const statements = {
  ...defaultStatements,
  posts: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],
} as const

export const ac = createAccessControl(statements)

export const roles = {
  [UserRole.USER]: ac.newRole({
    posts: ['create', 'read', 'update:own', 'delete:own'],
  }),
  [UserRole.ADMIN]: ac.newRole({
    ...adminAc.statements,
    posts: ['create', 'read', 'update', 'delete', 'update:own', 'delete:own'],
  }),
}

// Fonction utilitaire pour pallier l'appel à la méthode userHasPermission de Better-Auth qui échoue
// export function canRoleDo(
//     role: UserRole,
//     resource: keyof typeof statements,
//     actions: Array<(typeof statements)[typeof resource][number]>
//   ): boolean {
//     const roleInstance = roles[role];
//     if (!roleInstance) return false;

//     type RequestType = { [key in typeof resource]?: Array<(typeof statements)[typeof resource][number]> };

//     const authorizeFn = roleInstance.authorize as (req: RequestType, connector?: "AND" | "OR") => { success: boolean };

//     const response = authorizeFn({ [resource]: actions } as RequestType, "AND");

//     return response.success;
//   }
