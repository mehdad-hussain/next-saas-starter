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
    title: z.string({ message: "Title is required" }).max(255, { message: "Title is too long" }),
    slug: z.string().optional(),
    featureImage: z.string().optional(),
    state: z.enum(["draft", "published", "archived", "unpublished"], { message: "State is required" }),
    authorId: z.number({ message: "Author is required" }),
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
    name: z.string({ message: "Name is required" }).max(30, { message: "Name is too long" }),
    description: z.string({ message: "Description is required" }).max(255, { message: "Description is too long" }),
});

export type CreateRoleSchema = z.infer<typeof createRoleSchema>;

export const permission = z.object({
    id: z.number(),
    entityName: z.string().nullable(),
    entityType: z.string().nullable(),
    canCreate: z.boolean(),
    canUpdate: z.boolean(),
    canDelete: z.boolean(),
    canRead: z.boolean(),
});

export type Permission = z.infer<typeof permission>;

export const getRoleDetailsSchema = z.object({
    role: z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().optional(),
    }),
    userCount: z.number(),
    permissions: z.array(permission),
});

export type GetRoleDetailsSchema = z.infer<typeof getRoleDetailsSchema>;

export const updateRoleSchema = getRoleDetailsSchema.omit({ userCount: true });

export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>;
