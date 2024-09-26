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
  const [adminRole, editorRole, authorRole] = await db
    .insert(roles)
    .values([
      { name: "admin", description: "Administrator with full access" },
      { name: "editor", description: "Editor with limited access" },
      { name: "author", description: "Author with permission to create content" },
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

  // Create a user and assign the 'admin' role
  const email = "test@test.com";
  const password = "admin123";
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        roleId: adminRole.id, // Assign the 'admin' role
      },
    ])
    .returning();

  console.log("Initial admin user created.");

  // Create a team and assign the user to the team
  const [team] = await db
    .insert(teams)
    .values({
      name: "Test Team",
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: "owner",
  });

  console.log("Team and team members created.");

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
