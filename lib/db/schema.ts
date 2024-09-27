import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
    id: serial("id").primaryKey(),
    roleId: integer("role_id")
        .notNull()
        .references(() => roles.id),
    entityName: varchar("entity_name", { length: 100 }).notNull(), // e.g., blog-post, plugin-xyz, site-settings
    entityType: varchar("entity_type", { length: 50, enum: ["collection", "single", "plugin", "settings"] }).notNull(),
    canCreate: boolean("can_create").default(false).notNull(),
    canRead: boolean("can_read").default(true).notNull(),
    canUpdate: boolean("can_update").default(false).notNull(),
    canDelete: boolean("can_delete").default(false).notNull(),
});

export const roles = pgTable("roles", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    roleId: integer("role_id").references(() => roles.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const teams = pgTable("teams", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    stripeCustomerId: text("stripe_customer_id").unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    stripeProductId: text("stripe_product_id"),
    planName: varchar("plan_name", { length: 50 }),
    subscriptionStatus: varchar("subscription_status", { length: 20 }),
});

export const teamMembers = pgTable("team_members", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    teamId: integer("team_id")
        .notNull()
        .references(() => teams.id),
    role: varchar("role", { length: 50 }).notNull(),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
        .notNull()
        .references(() => teams.id),
    userId: integer("user_id").references(() => users.id),
    entityType: varchar("entity_type", { length: 50 }).notNull().default("blog_post"),
    entityId: integer("entity_id"),
    action: text("action").notNull(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
    ipAddress: varchar("ip_address", { length: 45 }),
});

export const invitations = pgTable("invitations", {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
        .notNull()
        .references(() => teams.id),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).notNull(),
    invitedBy: integer("invited_by")
        .notNull()
        .references(() => users.id),
    invitedAt: timestamp("invited_at").notNull().defaultNow(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
});

export const blogPosts = pgTable("blog_posts", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    featureImage: text("feature_image"),
    state: varchar("state", { length: 20, enum: ["draft", "published", "archived", "unpublished"] })
        .notNull()
        .default("draft"),
    authorId: integer("author_id")
        .notNull()
        .references(() => users.id),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),

    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
});

export const permissionsRelations = relations(permissions, ({ one }) => ({
    role: one(roles, {
        fields: [permissions.roleId],
        references: [roles.id],
    }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
    teamMembers: many(teamMembers),
    activityLogs: many(activityLogs),
    invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
    teamMembers: many(teamMembers),
    invitationsSent: many(invitations),
    blogPosts: many(blogPosts),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
    team: one(teams, {
        fields: [invitations.teamId],
        references: [teams.id],
    }),
    invitedBy: one(users, {
        fields: [invitations.invitedBy],
        references: [users.id],
    }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
    user: one(users, {
        fields: [teamMembers.userId],
        references: [users.id],
    }),
    team: one(teams, {
        fields: [teamMembers.teamId],
        references: [teams.id],
    }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    team: one(teams, {
        fields: [activityLogs.teamId],
        references: [teams.id],
    }),
    user: one(users, {
        fields: [activityLogs.userId],
        references: [users.id],
    }),
    blogPost: one(blogPosts, {
        fields: [activityLogs.entityId],
        references: [blogPosts.id],
    }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
    author: one(users, {
        fields: [blogPosts.authorId],
        references: [users.id],
    }),
    activityLogs: many(activityLogs),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
    teamMembers: (TeamMember & {
        user: Pick<User, "id" | "name" | "email">;
    })[];
};

export enum ActivityType {
    SIGN_UP = "SIGN_UP",
    SIGN_IN = "SIGN_IN",
    SIGN_OUT = "SIGN_OUT",
    UPDATE_PASSWORD = "UPDATE_PASSWORD",
    DELETE_ACCOUNT = "DELETE_ACCOUNT",
    UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
    CREATE_TEAM = "CREATE_TEAM",
    REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
    INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
    ACCEPT_INVITATION = "ACCEPT_INVITATION",
    CREATE_BLOG_POST = "CREATE_BLOG_POST",
    UPDATE_BLOG_POST = "UPDATE_BLOG_POST",
    DELETE_BLOG_POST = "DELETE_BLOG_POST",
    PUBLISH_BLOG_POST = "PUBLISH_BLOG_POST",
    ARCHIVE_BLOG_POST = "ARCHIVE_BLOG_POST",
    UNPUBLISH_BLOG_POST = "UNPUBLISH_BLOG_POST",
}

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
