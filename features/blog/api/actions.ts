"use server";

import { blogPosts } from "@/lib/db/schema";
import { count, eq, inArray } from "drizzle-orm";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

import { getErrorMessage } from "@/lib/handle-error";

import { db } from "@/lib/db/drizzle";
import type { CreateBlogSchema, UpdateBlogSchema } from "@/lib/db/validations";

export async function createBlog(input: CreateBlogSchema) {
    noStore();
    try {
        await db.transaction(async (tx) => {
            const [newBlog] = await tx
                .insert(blogPosts)
                .values({
                    title: input.title,
                    slug: input.slug,
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
            await tx.delete(blogPosts).where(eq(blogPosts.id, input.id));
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
            await tx.delete(blogPosts).where(inArray(blogPosts.id, input.ids));
        });

        revalidatePath("/");

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

export async function getChunkedBlogs(input: { chunkSize?: number } = {}) {
    try {
        const chunkSize = input.chunkSize ?? 1000;

        const [totalBlogs] = await db
            .select({
                count: count(),
            })
            .from(blogPosts);

        const totalChunks = Math.ceil(totalBlogs.count / chunkSize);

        let chunkedBlogs;

        for (let i = 0; i < totalChunks; i++) {
            chunkedBlogs = await db
                .select()
                .from(blogPosts)
                .limit(chunkSize)
                .offset(i * chunkSize)
                .then((blogs) =>
                    blogs.map((blog) => ({
                        ...blog,
                        createdAt: blog.createdAt.toString(),
                        updatedAt: blog.updatedAt?.toString(),
                    })),
                );
        }

        return {
            data: chunkedBlogs,
            error: null,
        };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err),
        };
    }
}
