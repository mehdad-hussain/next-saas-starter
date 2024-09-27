import { hashPassword } from "@/lib/auth/session";
import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import { permissions, roles, teamMembers, teams, users } from "./schema";

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

    // Insert permissions directly into the permissions table
    await db.insert(permissions).values([
        // Blog-post permissions for each role
        {
            roleId: adminRole.id,
            entityName: "blog-post",
            entityType: "collection",
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
        },
        {
            roleId: editorRole.id,
            entityName: "blog-post",
            entityType: "collection",
            canCreate: false,
            canRead: true,
            canUpdate: true,
            canDelete: false,
        },
        {
            roleId: authorRole.id,
            entityName: "blog-post",
            entityType: "collection",
            canCreate: true,
            canRead: true,
            canUpdate: false,
            canDelete: false,
        },
        {
            roleId: ownerRole.id,
            entityName: "blog-post",
            entityType: "collection",
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
        },
        {
            roleId: memberRole.id,
            entityName: "blog-post",
            entityType: "collection",
            canCreate: false,
            canRead: true,
            canUpdate: false,
            canDelete: false,
        },
        {
            roleId: userRole.id,
            entityName: "blog-post",
            entityType: "collection",
            canCreate: false,
            canRead: true,
            canUpdate: false,
            canDelete: false,
        },

        // Site-settings permissions for each role
        {
            roleId: adminRole.id,
            entityName: "site-settings",
            entityType: "settings",
            canCreate: false,
            canRead: true,
            canUpdate: true,
            canDelete: false,
        },
        {
            roleId: editorRole.id,
            entityName: "site-settings",
            entityType: "settings",
            canCreate: false,
            canRead: true,
            canUpdate: false,
            canDelete: false,
        },
    ]);

    console.log("Permissions assigned.");

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

            return user;
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

    console.log("Team members assigned to the team.");

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
