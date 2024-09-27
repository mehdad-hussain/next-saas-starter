"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Permission } from "@/lib/db/validations";
import PermissionTable from "./permission-table";

type Props = {
    permissions: Permission[];
};

const RoleManagementCard = ({ permissions }: Props) => {
    const filterByCategory = (category: string) => {
        const filteredPermissions = permissions.filter((perm) => perm.entityType === category);
        return filteredPermissions;
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                    <CardDescription>Configure what this role can do across different categories.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Tabs defaultValue={"collection"}>
                            <TabsList className="flex  justify-between">
                                <TabsTrigger value="collection" className="w-full">
                                    Collection types
                                </TabsTrigger>
                                <TabsTrigger value="single" className="w-full">
                                    Single types
                                </TabsTrigger>
                                <TabsTrigger value="plugin" className="w-full">
                                    Plugins
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="w-full">
                                    Settings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="collection">
                                {filterByCategory("collection").length === 0 ? (
                                    <NoPermissionFound />
                                ) : (
                                    <PermissionTable permissions={filterByCategory("collection")} />
                                )}
                            </TabsContent>

                            <TabsContent value="single">
                                {filterByCategory("single").length === 0 ? (
                                    <NoPermissionFound />
                                ) : (
                                    <PermissionTable permissions={filterByCategory("single")} />
                                )}
                            </TabsContent>

                            <TabsContent value="plugin">
                                {filterByCategory("plugin").length === 0 ? (
                                    <NoPermissionFound />
                                ) : (
                                    <PermissionTable permissions={filterByCategory("plugin")} />
                                )}
                            </TabsContent>

                            <TabsContent value="settings">
                                {filterByCategory("settings").length === 0 ? (
                                    <NoPermissionFound />
                                ) : (
                                    <PermissionTable permissions={filterByCategory("settings")} />
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default RoleManagementCard;

const NoPermissionFound = () => {
    return (
        <Card className="flex justify-center items-center">
            <CardTitle className="p-6">No permissions found</CardTitle>
        </Card>
    );
};
