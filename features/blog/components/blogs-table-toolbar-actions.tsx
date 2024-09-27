"use client";

import { type BlogPost } from "@/lib/db/schema";
import { DownloadIcon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { exportTableToCSV } from "@/lib/export";

import usePermissionStore from "@/store/user-permission-store";
import { CreateBlogDialog } from "./create-blog-dialog";
import { DeleteBlogsDialog } from "./delete-blogs-dialog";

interface BlogsTableToolbarActionsProps {
    table: Table<BlogPost>;
}

export function BlogsTableToolbarActions({ table }: BlogsTableToolbarActionsProps) {
    const { currentUserPermissions } = usePermissionStore();

    const blogPostPermission = currentUserPermissions.find((permission) => permission.entityName === "blog-post");
    return (
        <div className="flex items-center gap-2">
            {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                <DeleteBlogsDialog
                    blogs={table.getFilteredSelectedRowModel().rows.map((row) => row.original)}
                    onSuccess={() => table.toggleAllRowsSelected(false)}
                    disabled={!blogPostPermission?.canDelete}
                />
            ) : null}
            <CreateBlogDialog disabled={!blogPostPermission?.canCreate} />
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    exportTableToCSV(table, {
                        filename: "blogs",
                        excludeColumns: ["select", "actions"],
                    })
                }
                disabled={!blogPostPermission?.canRead}
            >
                <DownloadIcon className="mr-2 size-4" aria-hidden="true" />
                Export
            </Button>
        </div>
    );
}
