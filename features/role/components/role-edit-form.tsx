"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateRoleSchema, type GetRoleDetailsSchema, type UpdateRoleSchema } from "@/lib/db/validations";
import usePermissionStore from "@/store/user-permission-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateRolePermissions } from "../api/actions";
import RoleManagementCard from "./role-management-card";

type Props = {
    roleData: GetRoleDetailsSchema;
};

const RoleEditForm = ({ roleData }: Props) => {
    const { setPermissions, permissions, setCurrentUserPermissions } = usePermissionStore();
    const [isUpdatePending, startUpdateTransition] = useTransition();

    // Initialize the form with validation
    const form = useForm<UpdateRoleSchema>({
        resolver: zodResolver(updateRoleSchema),
        defaultValues: {
            role: {
                id: roleData.role.id,
                name: roleData.role.name,
                description: roleData.role.description || "",
            },
            permissions,
        },
    });

    useEffect(() => {
        setPermissions(roleData.permissions);
    }, [roleData, setPermissions]);

    useEffect(() => {
        form.reset({
            ...form.getValues(),
            permissions,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissions]);

    const onSubmit = async (data: UpdateRoleSchema) => {
        startUpdateTransition(async () => {
            const { error } = await updateRolePermissions(data.role.id, data);
            if (error) {
                toast.error(error);
                return;
            }
            const currentUserPermissions = data.permissions.map(({ id, ...rest }) => ({
                ...rest,
                roleName: data.role.name,
                entityType: rest.entityType as "collection" | "single" | "plugin" | "settings" | null,
            }));

            setCurrentUserPermissions(currentUserPermissions);

            form.reset(
                {
                    ...form.getValues(),
                    permissions: data.permissions,
                },
                {
                    keepDirtyValues: true,
                },
            );
            toast.success("Role updated");
        });
    };

    return (
        <div className="p-6 space-y-6 dark:bg-black">
            <section className="p-1 flex flex-row justify-between items-center">
                <div>
                    <h1 className="font-semibold text-2xl">Edit a role</h1>
                    <p>Define the rights to the role</p>
                </div>

                <Button disabled={isUpdatePending} variant="outline" onClick={form.handleSubmit(onSubmit)}>
                    {isUpdatePending && <Icons.spinner className="mr-2 size-4 animate-spin" aria-hidden="true" />}
                    Save
                </Button>
            </section>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="capitalize">
                            <CardTitle className="capitalize">{roleData.role.name}</CardTitle>
                            <CardDescription className="capitalize my-1">{roleData.role.description}</CardDescription>
                        </div>

                        <Button variant="outline" className="text-sm px-4 py-2">
                            {roleData.userCount} User{roleData.userCount > 1 ? "s" : ""} with this role
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 lg:flex-row">
                            <FormField
                                control={form.control}
                                name={"role.name"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter role name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={"role.description"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter role description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <RoleManagementCard permissions={permissions} />
        </div>
    );
};

export default RoleEditForm;
