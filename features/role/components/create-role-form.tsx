"use client";

import * as React from "react";
import { type UseFormReturn } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/lib/auth";
import { type CreateRoleSchema } from "@/lib/db/validations";

interface CreateRoleFormProps extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
    children: React.ReactNode;
    form: UseFormReturn<CreateRoleSchema>;
    onSubmit: (data: CreateRoleSchema) => void;
}

export function CreateRoleForm({ form, onSubmit, children }: CreateRoleFormProps) {
    const { user } = useUser();
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Do a you know about ...?" className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {children}
            </form>
        </Form>
    );
}
