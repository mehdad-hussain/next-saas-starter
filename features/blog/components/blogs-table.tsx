"use client";
"use memo";

import { blogPosts, type BlogPost } from "@/lib/db/schema";
import { type DataTableFilterField } from "@/types";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";

import { type getBlogs } from "@/features/blog/api/queries";
import { getColumns } from "./blogs-table-columns";
import { BlogsTableToolbarActions } from "./blogs-table-toolbar-actions";

interface BlogsTableProps {
    blogsPromise: ReturnType<typeof getBlogs>;
}

export function BlogsTable({ blogsPromise }: BlogsTableProps) {
    const { data, pageCount } = React.use(blogsPromise);

    const columns = React.useMemo(() => getColumns(), []);

    const filterFields: DataTableFilterField<BlogPost>[] = [
        {
            label: "Title",
            value: "title",
            placeholder: "Search titles...",
        },
        {
            label: "State",
            value: "state",
            options: blogPosts.state.enumValues.map((state) => ({
                label: state[0]?.toUpperCase() + state.slice(1),
                value: state,
                withCount: true,
            })),
        },
    ];

    const { table } = useDataTable({
        data,
        columns,
        pageCount,
        /* optional props */
        filterFields,
        initialState: {
            sorting: [{ id: "createdAt", desc: true }],
            columnPinning: { right: ["actions"] },
        },
        getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    });

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table} filterFields={filterFields}>
                <BlogsTableToolbarActions table={table} />
            </DataTableToolbar>
        </DataTable>
    );
}
