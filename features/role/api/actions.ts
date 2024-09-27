"use server";

import { db } from "@/lib/db/drizzle";
import { permissionCategories, permissionEntities, rolePermissions, roles, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

export async function getRoleData(roleId: number) {
    const role = await db
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
    const userCount = await db
        .select({
            count: sql`COUNT(${users.id})`,
        })
        .from(users)
        .where(eq(users.roleId, roleId));

    // Fetch role permissions with category and entity names
    const permissions = await db
        .select({
            entityName: permissionEntities.name,
            categoryName: permissionCategories.name,
            canCreate: rolePermissions.canCreate,
            canRead: rolePermissions.canRead,
            canUpdate: rolePermissions.canUpdate,
            canDelete: rolePermissions.canDelete,
        })
        .from(rolePermissions)
        .leftJoin(permissionEntities, eq(rolePermissions.entityId, permissionEntities.id))
        .leftJoin(permissionCategories, eq(permissionEntities.categoryId, permissionCategories.id))
        .where(eq(rolePermissions.roleId, roleId));

    return {
        role,
        userCount: userCount[0]?.count || 0,
        permissions,
    };
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
            .groupBy(roles.id)
            .execute();

        return roleData;
    } catch (error) {
        console.error("Error fetching roles with user count:", error);
        throw error;
    }
};
