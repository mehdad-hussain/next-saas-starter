"use client";

import { blogPosts } from "@/lib/db/schema";
import * as React from "react";
import { type UseFormReturn } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/lib/auth";
import { type CreateBlogSchema } from "@/lib/db/validations";

interface CreateBlogFormProps extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
    children: React.ReactNode;
    form: UseFormReturn<CreateBlogSchema>;
    onSubmit: (data: CreateBlogSchema) => void;
}

export function CreateBlogForm({ form, onSubmit, children }: CreateBlogFormProps) {
    const { user } = useUser();
    return (
        <Form {...form}>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.setValue("authorId", user?.id ?? 0);
                    form.setValue("slug", form.getValues("title").replace(/\s+/g, "-").toLowerCase());
                    console.log("Form values:", form.getValues());
                    console.log("Form errors:", form.formState.errors);
                    form.handleSubmit(onSubmit)(event);
                }}
                className="flex flex-col gap-4"
            >
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Do a you know about ...?" className="resize-none" {...field} />
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
                                        <SelectValue placeholder="Select a state" />
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

                {children}
            </form>
        </Form>
    );
}

// todo: feature image, create form error validation, slug and author id issue

// todo: table schema as sazid
