"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

import { createRoleSchema, type CreateRoleSchema } from "@/lib/db/validations";
import { createRole } from "../api/actions";
import { CreateRoleForm } from "./create-role-form";

export function CreateRoleDialog() {
    const [open, setOpen] = React.useState(false);
    const [isCreatePending, startCreateTransition] = React.useTransition();
    const isDesktop = useMediaQuery("(min-width: 640px)");

    const form = useForm<CreateRoleSchema>({
        resolver: zodResolver(createRoleSchema),
    });

    function onSubmit(input: CreateRoleSchema) {
        startCreateTransition(async () => {
            const { error } = await createRole(input);

            if (error) {
                toast.error(error);
                return;
            }

            form.reset();
            setOpen(false);
            toast.success("Role created");
        });
    }

    if (isDesktop)
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                        New role
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create role</DialogTitle>
                        <DialogDescription>Fill in the details below to create a new role.</DialogDescription>
                    </DialogHeader>
                    <CreateRoleForm form={form} onSubmit={onSubmit}>
                        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button disabled={isCreatePending}>
                                {isCreatePending && <ReloadIcon className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </CreateRoleForm>
                </DialogContent>
            </Dialog>
        );

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                    New role
                </Button>
            </DrawerTrigger>

            <DrawerContent className="px-4 py-2">
                <DrawerHeader>
                    <DrawerTitle>Create role</DrawerTitle>
                    <DrawerDescription>Fill in the details below to create a new role.</DrawerDescription>
                </DrawerHeader>
                <CreateRoleForm form={form} onSubmit={onSubmit}>
                    <DrawerFooter className="gap-2 sm:space-x-0">
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button disabled={isCreatePending}>
                            {isCreatePending && <ReloadIcon className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                            Create
                        </Button>
                    </DrawerFooter>
                </CreateRoleForm>
            </DrawerContent>
        </Drawer>
    );
}
