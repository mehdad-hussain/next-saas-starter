"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
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

import { useUser } from "@/lib/auth";
import { createBlogSchema, type CreateBlogSchema } from "@/lib/db/validations";
import { useState, useTransition } from "react";
import { createBlog } from "../api/actions";
import { CreateBlogForm } from "./create-blog-form";

type Props = {
    disabled?: boolean;
};

export function CreateBlogDialog({ disabled }: Props) {
    const [open, setOpen] = useState(false);
    const [isCreatePending, startCreateTransition] = useTransition();
    const isDesktop = useMediaQuery("(min-width: 640px)");
    const { user } = useUser();

    const form = useForm<CreateBlogSchema>({
        resolver: zodResolver(createBlogSchema),
        defaultValues: {
            authorId: user?.id ?? 0,
        },
    });

    function onSubmit(input: CreateBlogSchema) {
        startCreateTransition(async () => {
            const { error } = await createBlog(input, user?.id ?? 0);

            if (error) {
                toast.error(error);
                return;
            }

            form.reset();
            setOpen(false);
            toast.success("Blog created");
        });
    }

    if (isDesktop)
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={disabled}>
                        <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                        New blog
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create blog</DialogTitle>
                        <DialogDescription>Fill in the details below to create a new blog.</DialogDescription>
                    </DialogHeader>
                    <CreateBlogForm form={form} onSubmit={onSubmit}>
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
                    </CreateBlogForm>
                </DialogContent>
            </Dialog>
        );

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                    New blog
                </Button>
            </DrawerTrigger>

            <DrawerContent className="px-4 py-2">
                <DrawerHeader>
                    <DrawerTitle>Create blog</DrawerTitle>
                    <DrawerDescription>Fill in the details below to create a new blog.</DrawerDescription>
                </DrawerHeader>
                <CreateBlogForm form={form} onSubmit={onSubmit}>
                    <DrawerFooter className="gap-2 sm:space-x-0">
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button disabled={isCreatePending}>
                            {isCreatePending && <ReloadIcon className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                            Create
                        </Button>
                    </DrawerFooter>
                </CreateBlogForm>
            </DrawerContent>
        </Drawer>
    );
}
