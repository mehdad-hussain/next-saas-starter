"use server";

import { blogPosts } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

import { getErrorMessage } from "@/lib/handle-error";

import { db } from "@/lib/db/drizzle";
import { permissions, users } from "@/lib/db/schema";
import type { CreateBlogSchema, UpdateBlogSchema } from "@/lib/db/validations";
import { generateSlug } from "@/lib/utils";

export async function hasPermission(userId: number, entityName: string, action: "create" | "read" | "update" | "delete") {
    try {
        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .execute()
            .then((res) => res[0]);
        if (!user || !user.roleId) {
            throw new Error("User not found or role not assigned.");
        }

        const permission = await db
            .select()
            .from(permissions)
            .where(and(eq(permissions.roleId, user.roleId), eq(permissions.entityName, entityName)))
            .execute()
            .then((res) => res[0]);

        if (!permission) {
            throw new Error("Permission not found.");
        }

        switch (action) {
            case "create":
                return permission.canCreate;
            case "read":
                return permission.canRead;
            case "update":
                return permission.canUpdate;
            case "delete":
                return permission.canDelete;
            default:
                throw new Error("Invalid action.");
        }
    } catch (error) {
        return {
            error: getErrorMessage(error),
            status: 403,
        };
    }
}

export async function createBlog(input: CreateBlogSchema, userId: number) {
    noStore();

    const hasCreatePermission = await hasPermission(userId, "blog-post", "create");
    if (!hasCreatePermission) {
        return {
            data: null,
            error: "You do not have permission to create blog posts.",
        };
    }

    try {
        const slug = input.slug ?? generateSlug(input.title);
        await db.transaction(async (tx) => {
            await tx
                .insert(blogPosts)
                .values({
                    title: input.title,
                    slug,
                    featureImage: input.featureImage,
                    state: input.state,
                    authorId: input.authorId,
                })
                .returning({
                    id: blogPosts.id,
                });
        });

        revalidatePath("/dashboard/blog");

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

export async function updateBlog(input: UpdateBlogSchema & { id: number }, userId: number, isPromise: boolean = false) {
    noStore();

    const hasUpdatePermission = await hasPermission(userId, "blog-post", "update");
    if (!hasUpdatePermission) {
        if (isPromise) {
            throw new Error("You do not have permission to update blog posts.");
        } else {
            return {
                data: null,
                error: "You do not have permission to update blog posts.",
            };
        }
    }
    try {
        await db
            .update(blogPosts)
            .set({
                title: input.title,
                slug: input.slug,
                featureImage: input.featureImage,
                state: input.state,
            })
            .where(eq(blogPosts.id, input.id));

        revalidatePath("/dashboard/blog");

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

export async function deleteBlog(input: { id: number }, userId: number) {
    const hasDeletePermission = await hasPermission(userId, "blog-post", "delete");
    if (!hasDeletePermission) {
        return {
            data: null,
            error: "You do not have permission to delete blog posts.",
        };
    }
    try {
        await db.transaction(async (tx) => {
            await tx
                .update(blogPosts)
                .set({
                    isDeleted: true,
                })
                .where(eq(blogPosts.id, input.id));
        });

        revalidatePath("/dashboard/blog");

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

export async function deleteBlogs(input: { ids: number[] }, userId: number) {
    const hasDeletePermission = await hasPermission(userId, "blog-post", "delete");
    if (!hasDeletePermission) {
        return {
            data: null,
            error: "You do not have permission to delete blog posts.",
        };
    }
    try {
        await db.transaction(async (tx) => {
            await tx
                .update(blogPosts)
                .set({
                    isDeleted: true,
                })
                .where(inArray(blogPosts.id, input.ids));
        });

        revalidatePath("/dashboard/blog");

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
