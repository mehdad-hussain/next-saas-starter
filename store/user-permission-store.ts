import { create } from "zustand";

interface Permission {
    id: number;
    entityName: string | null;
    entityType: string | null;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canRead: boolean;
}

interface PermissionStore {
    permissions: Permission[];
    setPermissions: (permissions: Permission[]) => void;
    togglePermission: (id: number, permissionType: keyof Permission) => void;
}

const usePermissionStore = create<PermissionStore>((set) => ({
    permissions: [],
    setPermissions: (permissions) => set({ permissions }),
    togglePermission: (id, permissionType) =>
        set((state) => {
            const updatedPermissions = state.permissions.map((perm) => {
                if (perm.id === id) {
                    return { ...perm, [permissionType]: !perm[permissionType] };
                }
                return perm;
            });
            return { permissions: updatedPermissions };
        }),
}));

export default usePermissionStore;
