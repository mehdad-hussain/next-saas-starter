import "server-only";

import { blogPosts, type BlogPost } from "@/lib/db/schema";
import { type DrizzleWhere } from "@/types";
import { and, asc, count, desc, or, type SQL } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";

import { filterColumn } from "@/lib/filter-column";

import { db } from "@/lib/db/drizzle";
import { type GetBlogsSchema } from "@/lib/db/validations";

export async function getBlogs(input: GetBlogsSchema) {
    noStore();
    const { page, per_page, sort, title, state, operator } = input;

    try {
        // Offset to paginate the results
        const offset = (page - 1) * per_page;

        const [column, order] = (sort?.split(".").filter(Boolean) ?? ["createdAt", "desc"]) as [
            keyof BlogPost | undefined,
            "asc" | "desc" | undefined,
        ];

        const expressions: (SQL<unknown> | undefined)[] = [
            title
                ? filterColumn({
                      column: blogPosts.title,
                      value: title,
                  })
                : undefined,
            // Filter blogPosts by state
            !!state
                ? filterColumn({
                      column: blogPosts.state,
                      value: state,
                      isSelectable: true,
                  })
                : undefined,
        ];
        const where: DrizzleWhere<BlogPost> = !operator || operator === "and" ? and(...expressions) : or(...expressions);

        // Transaction is used to ensure both queries are executed in a single transaction
        const { data, total } = await db.transaction(async (tx) => {
            const data = await tx
                .select()
                .from(blogPosts)
                .limit(per_page)
                .offset(offset)
                .where(where)
                .orderBy(
                    column && column in blogPosts
                        ? order === "asc"
                            ? asc(blogPosts[column])
                            : desc(blogPosts[column])
                        : desc(blogPosts.id),
                );

            const total = await tx
                .select({
                    count: count(),
                })
                .from(blogPosts)
                .where(where)
                .execute()
                .then((res) => res[0]?.count ?? 0);

            return {
                data,
                total,
            };
        });

        const pageCount = Math.ceil(total / per_page);
        return { data, pageCount };
    } catch (err) {
        return { data: [], pageCount: 0 };
    }
}
