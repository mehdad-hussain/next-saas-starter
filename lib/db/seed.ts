import { hashPassword } from "@/lib/auth/session";
import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import { permissionCategories, permissionEntities, rolePermissions, roles, teamMembers, teams, users } from "./schema";

async function createStripeProducts() {
    console.log("Creating Stripe products and prices...");

    const baseProduct = await stripe.products.create({
        name: "Base",
        description: "Base subscription plan",
    });

    await stripe.prices.create({
        product: baseProduct.id,
        unit_amount: 800, // $8 in cents
        currency: "usd",
        recurring: {
            interval: "month",
            trial_period_days: 7,
        },
    });

    const plusProduct = await stripe.products.create({
        name: "Plus",
        description: "Plus subscription plan",
    });

    await stripe.prices.create({
        product: plusProduct.id,
        unit_amount: 1200, // $12 in cents
        currency: "usd",
        recurring: {
            interval: "month",
            trial_period_days: 7,
        },
    });

    console.log("Stripe products and prices created successfully.");
}

async function seed() {
    // Create roles
    const [adminRole, editorRole, authorRole, ownerRole, memberRole, userRole] = await db
        .insert(roles)
        .values([
            { name: "admin", description: "Administrator with full access" },
            { name: "editor", description: "Editor with limited access" },
            { name: "author", description: "Author with permission to create content" },
            { name: "owner", description: "Owner with full access of a team" },
            { name: "member", description: "Member with limited access to a team" },
            { name: "user", description: "User with limited access" },
        ])
        .returning();

    console.log("Roles created.");

    // Create permission categories
    const [collectionCategory, singleCategory, pluginCategory, settingsCategory] = await db
        .insert(permissionCategories)
        .values([
            { name: "collection", description: "Permissions for collections" },
            { name: "single", description: "Permissions for single types" },
            { name: "plugin", description: "Permissions for managing plugins" },
            { name: "settings", description: "Permissions for application settings" },
        ])
        .returning();

    console.log("Permission categories created.");

    // Create permission entities (e.g., blog-post, site-settings)
    const [blogPostEntity, siteSettingsEntity] = await db
        .insert(permissionEntities)
        .values([
            { name: "blog-post", description: "Permissions for blog post", categoryId: collectionCategory.id },
            { name: "site-settings", description: "Permissions for site-wide settings", categoryId: settingsCategory.id },
        ])
        .returning();

    console.log("Permission entities created.");

    // Assign permissions to roles for blog-post entity (under collection category)
    await db.insert(rolePermissions).values([
        {
            roleId: adminRole.id,
            entityId: blogPostEntity.id,
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
        },
        {
            roleId: editorRole.id,
            entityId: blogPostEntity.id,
            canCreate: false,
            canRead: true,
            canUpdate: true,
            canDelete: false,
        },
        {
            roleId: authorRole.id,
            entityId: blogPostEntity.id,
            canCreate: true,
            canRead: true,
            canUpdate: false,
            canDelete: false,
        },
        {
            roleId: ownerRole.id,
            entityId: blogPostEntity.id,
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
        },
        {
            roleId: memberRole.id,
            entityId: blogPostEntity.id,
            canCreate: false,
            canRead: true,
            canUpdate: false,
            canDelete: false,
        },
        {
            roleId: userRole.id,
            entityId: blogPostEntity.id,
            canCreate: false,
            canRead: true,
            canUpdate: false,
            canDelete: false,
        },
    ]);

    console.log("Role permissions assigned for blog post.");

    // Assign permissions to roles for site-settings entity (under settings category)
    await db.insert(rolePermissions).values([
        {
            roleId: adminRole.id,
            entityId: siteSettingsEntity.id,
            canCreate: false,
            canRead: true,
            canUpdate: true,
            canDelete: false,
        },
        {
            roleId: editorRole.id,
            entityId: siteSettingsEntity.id,
            canCreate: false,
            canRead: true,
            canUpdate: false,
            canDelete: false,
        },
    ]);

    console.log("Role permissions assigned for site settings.");

    // Create users and assign them to each role
    const usersData = [
        { email: "admin@test.com", password: "admin123", roleId: adminRole.id },
        { email: "editor@test.com", password: "editor123", roleId: editorRole.id },
        { email: "author@test.com", password: "author123", roleId: authorRole.id },
        { email: "owner@test.com", password: "owner123", roleId: ownerRole.id },
        { email: "member@test.com", password: "member123", roleId: memberRole.id },
        { email: "user@test.com", password: "user123", roleId: userRole.id },
    ];

    const createdUsers = await Promise.all(
        usersData.map(async (userData) => {
            const passwordHash = await hashPassword(userData.password);
            const [user] = await db
                .insert(users)
                .values({
                    email: userData.email,
                    passwordHash: passwordHash,
                    roleId: userData.roleId,
                })
                .returning();

            return user; // Return the single user object
        }),
    );

    console.log("Users created and roles assigned.", createdUsers);

    // Create a team for all users
    const [team] = await db
        .insert(teams)
        .values({
            name: "Test Team",
        })
        .returning();

    console.log("Team created:", team);

    // Assign each user to the team with their respective roles
    await Promise.all(
        createdUsers.map(async (user) => {
            let teamRole = "member"; // Default role in the team

            if (user.email === "owner@test.com") {
                teamRole = "owner";
            } else if (user.email === "admin@test.com") {
                teamRole = "admin";
            } else if (user.email === "editor@test.com") {
                teamRole = "editor";
            } else if (user.email === "author@test.com") {
                teamRole = "author";
            }

            await db.insert(teamMembers).values({
                teamId: team.id,
                userId: user.id,
                role: teamRole,
            });
        }),
    );

    console.log("Team and team members created and all users assigned to them.");

    await createStripeProducts();
}

seed()
    .catch((error) => {
        console.error("Seed process failed:", error);
        process.exit(1);
    })
    .finally(() => {
        console.log("Seed process finished. Exiting...");
        process.exit(0);
    });
