"use server";

import { blogPosts } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

import { getErrorMessage } from "@/lib/handle-error";

import { db } from "@/lib/db/drizzle";
import type { CreateBlogSchema, UpdateBlogSchema } from "@/lib/db/validations";
import { generateSlug } from "@/lib/utils";

export async function createBlog(input: CreateBlogSchema) {
    noStore();
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

export async function updateBlog(input: UpdateBlogSchema & { id: number }) {
    noStore();
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

export async function deleteBlog(input: { id: number }) {
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

export async function deleteBlogs(input: { ids: number[] }) {
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
