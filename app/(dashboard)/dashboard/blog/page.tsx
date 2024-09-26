"use memo";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { getTasks } from "@/features/blog/api/queries";
import { TasksTable } from "@/features/blog/components/tasks-table";
import { searchParamsSchema } from "@/lib/db/validations";
import type { SearchParams } from "@/types";
import * as React from "react";

export interface IndexPageProps {
    searchParams: SearchParams;
}

const Page = ({ searchParams }: IndexPageProps) => {
    const search = searchParamsSchema.parse(searchParams);
    const tasksPromise = getTasks(search);

    return (
        <React.Suspense
            fallback={
                <DataTableSkeleton
                    columnCount={5}
                    searchableColumnCount={1}
                    filterableColumnCount={2}
                    cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
                    shrinkZero
                />
            }
        >
            <TasksTable tasksPromise={tasksPromise} />
        </React.Suspense>
    );
};

export default Page;
