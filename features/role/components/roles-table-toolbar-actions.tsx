"use client";

import { type Table } from "@tanstack/react-table";

import { type GetRoleTableSchema } from "@/lib/db/validations";
import { CreateRoleDialog } from "./create-role-dialog";
import { DeleteRolesDialog } from "./delete-roles-dialog";

interface RolesTableToolbarActionsProps {
    table: Table<GetRoleTableSchema>;
}

export function RolesTableToolbarActions({ table }: RolesTableToolbarActionsProps) {
    return (
        <div className="flex items-center gap-2">
            {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                <DeleteRolesDialog
                    roles={table.getFilteredSelectedRowModel().rows.map((row) => row.original)}
                    onSuccess={() => table.toggleAllRowsSelected(false)}
                />
            ) : null}
            <CreateRoleDialog />
        </div>
    );
}
