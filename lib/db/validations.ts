import * as z from "zod";

// Search params schema for filtering and pagination
export const searchBlogsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    title: z.string().optional(),
    state: z.enum(["draft", "published", "archived", "unpublished"]).optional(),
    authorId: z.coerce.number().optional(),
    teamId: z.coerce.number().optional(),
});

export const getBlogsSchema = searchBlogsSchema;

export type GetBlogsSchema = z.infer<typeof getBlogsSchema>;

// Create blog post schema
export const createBlogSchema = z.object({
    title: z.string().max(255),
    slug: z.string().max(255),
    featureImage: z.string().optional(),
    state: z.enum(["draft", "published", "archived", "unpublished"]).default("draft"),
    authorId: z.number(),
});

export type CreateBlogSchema = z.infer<typeof createBlogSchema>;

// Update blog post schema
export const updateBlogSchema = z.object({
    title: z.string().max(255).optional(),
    slug: z.string().max(255).optional(),
    featureImage: z.string().optional(),
    state: z.enum(["draft", "published", "archived", "unpublished"]).optional(),
    authorId: z.number().optional(),
});

export type UpdateBlogSchema = z.infer<typeof updateBlogSchema>;
