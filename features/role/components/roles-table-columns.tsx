"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";
import { GetRoleTableSchema } from "@/lib/db/validations";
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteRolesDialog } from "./delete-roles-dialog";

export function getColumns(): ColumnDef<GetRoleTableSchema>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-0.5"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-0.5"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => <div className="max-w-[20rem] truncate font-medium capitalize">{row.getValue("name")}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "description",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            cell: ({ row }) => <div className="max-w-[15rem] truncate font-medium text-gray-600">{row.getValue("description")}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "userCount",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Users" />,
            cell: ({ row }) => (
                <div className="max-w-[15rem] truncate font-medium text-gray-600">
                    {row.getValue("userCount")}
                    {row.getValue("userCount") == 1 ? " user" : " users"}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            cell: function Cell({ row }) {
                const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false);

                return (
                    <>
                        <DeleteRolesDialog
                            open={showDeleteRoleDialog}
                            onOpenChange={setShowDeleteRoleDialog}
                            roles={[row.original]}
                            showTrigger={false}
                            onSuccess={() => row.toggleSelected(false)}
                        />

                        <div className="flex items-center space-x-2">
                            <Link href={`/dashboard/roles/${row.original.id}`}>
                                <Button aria-label="Edit role" variant="ghost" className="size-8 p-0">
                                    <PencilIcon className="size-4" aria-hidden="true" />
                                </Button>
                            </Link>

                            <Button aria-label="View role details" variant="ghost" className="size-8 p-0">
                                <EyeIcon className="size-4" aria-hidden="true" />
                            </Button>

                            <Button
                                aria-label="Delete role"
                                variant="ghost"
                                className="size-8 p-0"
                                onClick={() => setShowDeleteRoleDialog(true)}
                            >
                                <TrashIcon className="size-4" aria-hidden="true" />
                            </Button>
                        </div>
                    </>
                );
            },
            size: 40,
        },
    ];
}
