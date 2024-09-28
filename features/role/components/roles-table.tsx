"use client";
"use memo";

import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { type GetRoleTableSchema } from "@/lib/db/validations";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { getAllRolesWithUserCount } from "../api/actions";
import { getColumns } from "./roles-table-columns";
import { RolesTableToolbarActions } from "./roles-table-toolbar-actions";

interface RolesTableProps {
    rolesPromise: ReturnType<typeof getAllRolesWithUserCount>;
}

export function RolesTable({ rolesPromise }: RolesTableProps) {
    const roleData = React.use(rolesPromise);
    const columns = React.useMemo(() => getColumns(), []);

    const table = useReactTable({
        data: roleData as GetRoleTableSchema[],
        columns,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <DataTable table={table} showPagination={false}>
            <DataTableToolbar table={table}>
                <RolesTableToolbarActions table={table} />
            </DataTableToolbar>
        </DataTable>
    );
}
