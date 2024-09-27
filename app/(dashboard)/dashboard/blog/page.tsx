"use memo";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { getBlogs } from "@/features/blog/api/queries";
import { BlogsTable } from "@/features/blog/components/blogs-table";
import { searchBlogsSchema } from "@/lib/db/validations";
import type { SearchParams } from "@/types";
import * as React from "react";

export interface IndexPageProps {
    searchParams: SearchParams;
}

const Page = ({ searchParams }: IndexPageProps) => {
    const search = searchBlogsSchema.parse(searchParams);
    const blogsPromise = getBlogs(search);

    return (
        <section className="max-lg:p-[2%]">
            <React.Suspense
                fallback={
                    <DataTableSkeleton
                        columnCount={5}
                        searchableColumnCount={1}
                        filterableColumnCount={1}
                        cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
                        shrinkZero
                    />
                }
            >
                <BlogsTable blogsPromise={blogsPromise} />
            </React.Suspense>
        </section>
    );
};

export default Page;
