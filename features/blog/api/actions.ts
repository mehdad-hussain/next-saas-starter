"use server";

import { db } from "@/lib/db/drizzle";
import { activityLogs, ActivityType, blogPosts, permissions, teamMembers, teams, users, type NewActivityLog } from "@/lib/db/schema";
import type { CreateBlogSchema, UpdateBlogSchema } from "@/lib/db/validations";
import { getErrorMessage } from "@/lib/handle-error";
import { generateSlug } from "@/lib/utils";
import { and, eq, inArray } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

async function logActivity(
    teamId: number | null | undefined,
    userId: number,
    entityType: string,
    entityId: number,
    action: ActivityType,
    ipAddress?: string,
) {
    const newActivity: NewActivityLog = {
        teamId: teamId as number,
        userId,
        entityType,
        entityId,
        action,
        ipAddress: ipAddress || "",
    };

    await db.insert(activityLogs).values(newActivity);
}

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
        const newBlogPost = await db.transaction(async (tx) => {
            const result = await tx
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
                    title: blogPosts.title,
                    slug: blogPosts.slug,
                    featureImage: blogPosts.featureImage,
                    state: blogPosts.state,
                    authorId: blogPosts.authorId,
                });
            return result[0];
        });

        const [userWithTeam] = await db
            .select({
                teamId: teams.id,
            })
            .from(teams)
            .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
            .where(eq(teamMembers.userId, userId))
            .limit(1);

        await logActivity(userWithTeam.teamId, userId, "blog_post", newBlogPost.id, ActivityType.CREATE_BLOG_POST);

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

        const [userWithTeam] = await db
            .select({
                teamId: teams.id,
            })
            .from(teams)
            .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
            .where(eq(teamMembers.userId, userId))
            .limit(1);

        let activityType: ActivityType;
        switch (input.state) {
            case "published":
                activityType = ActivityType.PUBLISH_BLOG_POST;
                break;
            case "archived":
                activityType = ActivityType.ARCHIVE_BLOG_POST;
                break;
            case "unpublished":
                activityType = ActivityType.UNPUBLISHED_BLOG_POST;
                break;
            case "draft":
            default:
                activityType = ActivityType.UPDATE_BLOG_POST;
                break;
        }

        await logActivity(userWithTeam.teamId, userId, "blog_post", input.id, activityType);

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

        const [userWithTeam] = await db
            .select({
                teamId: teams.id,
            })
            .from(teams)
            .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
            .where(eq(teamMembers.userId, userId))
            .limit(1);

        for (const blogId of input.ids) {
            await logActivity(userWithTeam.teamId, userId, "blog_post", blogId, ActivityType.DELETE_BLOG_POST);
        }

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
