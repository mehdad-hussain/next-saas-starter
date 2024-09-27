import * as z from "zod";

export const searchBlogsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    title: z.string().optional(),
    state: z.string().optional(),
    authorId: z.coerce.number().optional(),
    teamId: z.coerce.number().optional(),
    operator: z.enum(["and", "or"]).optional(),
});

export const getBlogsSchema = searchBlogsSchema;

export type GetBlogsSchema = z.infer<typeof getBlogsSchema>;

export const createBlogSchema = z.object({
    title: z.string().max(255),
    slug: z.string().max(255),
    featureImage: z.string().optional(),
    state: z.enum(["draft", "published", "archived", "unpublished"]).default("draft"),
    authorId: z.number(),
});

export type CreateBlogSchema = z.infer<typeof createBlogSchema>;

export const updateBlogSchema = z.object({
    title: z.string().max(255).optional(),
    slug: z.string().max(255).optional(),
    featureImage: z.string().optional(),
    state: z.enum(["draft", "published", "archived", "unpublished"]).optional(),
    authorId: z.number().optional(),
});

export type UpdateBlogSchema = z.infer<typeof updateBlogSchema>;

export const getRoleTableSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    userCount: z.number(),
});

export type GetRoleTableSchema = z.infer<typeof getRoleTableSchema>;

export const createRoleSchema = z.object({
    name: z.string(),
    description: z.string(),
});

export type CreateRoleSchema = z.infer<typeof createRoleSchema>;
