"use client";

import { TrashIcon } from "@radix-ui/react-icons";
import { type Row } from "@tanstack/react-table";
import * as React from "react";
import { toast } from "sonner";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { type GetRoleTableSchema } from "@/lib/db/validations";

interface DeleteRolesDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
    roles: Row<GetRoleTableSchema>["original"][];
    showTrigger?: boolean;
    onSuccess?: () => void;
}

export function DeleteRolesDialog({ roles, showTrigger = true, onSuccess, ...props }: DeleteRolesDialogProps) {
    const [isDeletePending, startDeleteTransition] = React.useTransition();
    const isDesktop = useMediaQuery("(min-width: 640px)");

    function onDelete() {
        startDeleteTransition(async () => {
            // const { error } = await deleteRoles({
            //     ids: roles.map((blog) => blog.id),
            // });

            // if (error) {
            //     toast.error(error);
            //     return;
            // }

            props.onOpenChange?.(false);
            toast.success("Roles deleted");
            onSuccess?.();
        });
    }

    if (isDesktop) {
        return (
            <Dialog {...props}>
                {showTrigger ? (
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                            Delete ({roles.length})
                        </Button>
                    </DialogTrigger>
                ) : null}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your{" "}
                            <span className="font-medium">{roles.length}</span>
                            {roles.length === 1 ? " role" : " roles"} from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:space-x-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button aria-label="Delete selected rows" variant="destructive" onClick={onDelete} disabled={isDeletePending}>
                            {isDeletePending && <Icons.spinner className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer {...props}>
            {showTrigger ? (
                <DrawerTrigger asChild>
                    <Button variant="outline" size="sm">
                        <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                        Delete ({roles.length})
                    </Button>
                </DrawerTrigger>
            ) : null}
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                    <DrawerDescription>
                        This action cannot be undone. This will permanently delete your <span className="font-medium">{roles.length}</span>
                        {roles.length === 1 ? " role" : " roles"} from our servers.
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="gap-2 sm:space-x-0">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                    <Button aria-label="Delete selected rows" variant="destructive" onClick={onDelete} disabled={isDeletePending}>
                        {isDeletePending && <Icons.spinner className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                        Delete
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
