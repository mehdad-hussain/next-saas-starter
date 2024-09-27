"use client";

import { blogPosts, type BlogPost } from "@/lib/db/schema";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { toast } from "sonner";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/handle-error";
import { formatDate } from "@/lib/utils";

import usePermissionStore from "@/store/user-permission-store";
import Image from "next/image";
import { updateBlog } from "../api/actions";
import { DeleteBlogsDialog } from "./delete-blogs-dialog";
import { UpdateBlogSheet } from "./update-blog-sheet";

export function getColumns(): ColumnDef<BlogPost>[] {
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
            accessorKey: "id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => <div className="w-20">{row.getValue("id")}</div>,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "title",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
            cell: ({ row }) => <div className="max-w-[20rem] truncate font-medium">{row.getValue("title")}</div>,
        },
        {
            accessorKey: "slug",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
            cell: ({ row }) => <div className="max-w-[15rem] truncate font-medium text-gray-600">{row.getValue("slug")}</div>,
        },
        {
            accessorKey: "featuredImage",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Featured Image" />,
            cell: ({ row }) => {
                const imageUrl = row.getValue("featuredImage") as string | null;
                return imageUrl ? (
                    <Image src={imageUrl} alt="Featured" className="h-12 w-12 object-cover rounded-md" width={48} height={48} />
                ) : (
                    <span className="text-gray-500">No image</span>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "state",
            header: ({ column }) => <DataTableColumnHeader column={column} title="State" />,
            cell: ({ row }) => {
                const state = blogPosts.state.enumValues.find((s) => s === row.original.state);

                if (!state) return null;

                return (
                    <Badge variant="outline" className="capitalize">
                        {state}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => {
                return Array.isArray(value) && value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
            cell: ({ cell }) => formatDate(cell.getValue() as Date),
        },
        {
            id: "actions",
            cell: function Cell({ row }) {
                const [isUpdatePending, startUpdateTransition] = React.useTransition();
                const [showUpdateBlogSheet, setShowUpdateBlogSheet] = React.useState(false);
                const [showDeleteBlogsDialog, setShowDeleteBlogsDialog] = React.useState(false);
                const { currentUserPermissions } = usePermissionStore();

                const blogPostPermission = currentUserPermissions.find((permission) => permission.entityName === "blog-post");

                return (
                    <>
                        <UpdateBlogSheet open={showUpdateBlogSheet} onOpenChange={setShowUpdateBlogSheet} blog={row.original} />
                        <DeleteBlogsDialog
                            open={showDeleteBlogsDialog}
                            onOpenChange={setShowDeleteBlogsDialog}
                            blogs={[row.original]}
                            showTrigger={false}
                            onSuccess={() => row.toggleSelected(false)}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-label="Open menu" variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
                                    <DotsHorizontalIcon className="size-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onSelect={() => setShowUpdateBlogSheet(true)} disabled={!blogPostPermission?.canUpdate}>
                                    Edit
                                </DropdownMenuItem>

                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>State</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuRadioGroup
                                            value={row.original.state}
                                            onValueChange={(value) => {
                                                startUpdateTransition(() => {
                                                    toast.promise(
                                                        updateBlog({
                                                            id: row.original.id,
                                                            state: value as BlogPost["state"],
                                                        }),
                                                        {
                                                            loading: "Updating...",
                                                            success: "State updated",
                                                            error: (err) => getErrorMessage(err),
                                                        },
                                                    );
                                                });
                                            }}
                                        >
                                            {blogPosts.state.enumValues.map((state) => (
                                                <DropdownMenuRadioItem
                                                    key={state}
                                                    value={state}
                                                    className="capitalize"
                                                    disabled={isUpdatePending || !blogPostPermission?.canUpdate}
                                                >
                                                    {state}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onSelect={() => setShowDeleteBlogsDialog(true)} disabled={!blogPostPermission?.canDelete}>
                                    Delete
                                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                );
            },

            size: 40,
        },
    ];
}
