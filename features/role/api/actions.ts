"use server";

import { db } from "@/lib/db/drizzle";
import { permissions, roles, users } from "@/lib/db/schema";
import { createRoleSchema, CreateRoleSchema, updateRoleSchema, type UpdateRoleSchema } from "@/lib/db/validations";
import { getErrorMessage } from "@/lib/handle-error";
import { and, eq, inArray, sql } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

export async function getRoleData(roleId: number) {
    noStore();

    try {
        // Fetch role details
        const [role] = await db
            .select({
                id: roles.id,
                name: roles.name,
                description: roles.description,
            })
            .from(roles)
            .where(eq(roles.id, roleId));

        if (!role) {
            throw new Error(`Role with id ${roleId} not found`);
        }

        // Fetch user count under this role
        const [userCount] = await db
            .select({
                count: sql`COUNT(${users.id})`,
            })
            .from(users)
            .where(eq(users.roleId, roleId));

        // Fetch role permissions
        const permissionsData = await db
            .select({
                id: permissions.id,
                entityName: permissions.entityName,
                entityType: permissions.entityType,
                canCreate: permissions.canCreate,
                canRead: permissions.canRead,
                canUpdate: permissions.canUpdate,
                canDelete: permissions.canDelete,
            })
            .from(permissions)
            .where(eq(permissions.roleId, roleId));

        return {
            role,
            userCount: Number(userCount.count) || 0,
            permissions: permissionsData,
        };
    } catch (error) {
        return { data: null, error: getErrorMessage(error) };
    }
}

export const getAllRolesWithUserCount = async () => {
    noStore();
    try {
        const roleData = await db
            .select({
                id: roles.id,
                name: roles.name,
                description: roles.description,
                userCount: sql<number>`COUNT(${users.id})`,
            })
            .from(roles)
            .leftJoin(users, eq(users.roleId, roles.id))
            .groupBy(roles.id);

        return roleData;
    } catch (error) {
        return { data: null, error: getErrorMessage(error) };
    }
};

export async function createRole(newRoleData: CreateRoleSchema) {
    try {
        const roleData = createRoleSchema.parse(newRoleData);

        const [newRole] = await db
            .insert(roles)
            .values({
                name: roleData.name,
                description: roleData.description || null,
            })
            .returning({
                id: roles.id,
                name: roles.name,
                description: roles.description,
            });

        revalidatePath("/dashboard/role");

        return { success: true, role: newRole, message: "Role created successfully." };
    } catch (error) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function updateRolePermissions(roleId: number, updatedRolePermissions: UpdateRoleSchema) {
    try {
        const rolePermissions = updateRoleSchema.parse(updatedRolePermissions);

        await db.transaction(async (tx) => {
            await tx
                .update(roles)
                .set({
                    name: rolePermissions.role.name,
                    description: rolePermissions.role.description ?? null,
                })
                .where(eq(roles.id, roleId));

            for (const permission of rolePermissions.permissions) {
                await tx
                    .update(permissions)
                    .set({
                        canCreate: permission.canCreate,
                        canRead: permission.canRead,
                        canUpdate: permission.canUpdate,
                        canDelete: permission.canDelete,
                    })
                    .where(and(eq(permissions.id, permission.id), eq(permissions.roleId, roleId)));
            }
        });

        revalidatePath("/dashboard/role/[id]");

        return { success: true, message: "Permissions updated successfully." };
    } catch (error) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function deleteRoles(input: { ids: number[] }) {
    try {
        await db.transaction(async (tx) => {
            await tx.delete(users).where(inArray(users.roleId, input.ids));

            await tx.delete(roles).where(inArray(roles.id, input.ids));
        });

        revalidatePath("/dashboard/role");

        return {
            data: null,
            error: null,
        };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err),
        };
    }
}
