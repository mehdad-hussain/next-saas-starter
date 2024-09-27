"use client";

import { type BlogPost, blogPosts } from "@/lib/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { updateBlogSchema, type UpdateBlogSchema } from "@/lib/db/validations";
import { updateBlog } from "../api/actions";

interface UpdateBlogSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
    blog: BlogPost;
}

export function UpdateBlogSheet({ blog, ...props }: UpdateBlogSheetProps) {
    const [isUpdatePending, startUpdateTransition] = React.useTransition();

    const form = useForm<UpdateBlogSchema>({
        resolver: zodResolver(updateBlogSchema),
        defaultValues: {
            title: blog.title ?? "",
            slug: blog.slug ?? "",
            state: blog.state ?? "",
            featureImage: blog.featureImage ?? "",
        },
    });

    React.useEffect(() => {
        form.reset({
            title: blog.title ?? "",
            slug: blog.slug ?? "",
            state: blog.state ?? "",
            featureImage: blog.featureImage ?? "",
        });
    }, [blog, form]);

    function onSubmit(input: UpdateBlogSchema) {
        startUpdateTransition(async () => {
            const { error } = await updateBlog({
                id: blog.id,
                ...input,
            });

            if (error) {
                toast.error(error);
                return;
            }

            form.reset();
            props.onOpenChange?.(false);
            toast.success("Blog updated");
        });
    }

    return (
        <Sheet {...props}>
            <SheetContent className="flex flex-col gap-6 sm:max-w-md">
                <SheetHeader className="text-left">
                    <SheetTitle>Update blog</SheetTitle>
                    <SheetDescription>Update the blog details and save the changes</SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Do a kickflip" className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="capitalize">
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                {blogPosts.state.enumValues.map((item) => (
                                                    <SelectItem key={item} value={item} className="capitalize">
                                                        {item}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <SheetFooter className="gap-2 pt-2 sm:space-x-0">
                            <SheetClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </SheetClose>
                            <Button disabled={isUpdatePending}>
                                {isUpdatePending && <Icons.spinner className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                                Save
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
