import { type Permission } from "@/lib/db/validations";
import usePermissionStore from "@/store/user-permission-store";
import { Check, Minus } from "lucide-react";
import { useEffect, useRef } from "react";

interface PermissionRowProps {
    perm: Permission;
}

const PermissionRow = ({ perm }: PermissionRowProps) => {
    const { togglePermission, permissions } = usePermissionStore();

    const permission = permissions.find((p) => p.id === perm.id) || perm;

    const isAllChecked = () => permission.canCreate && permission.canRead && permission.canUpdate && permission.canDelete;
    const isNoneChecked = () => !permission.canCreate && !permission.canRead && !permission.canUpdate && !permission.canDelete;

    const handleEntityToggle = () => {
        const newState = !isAllChecked();
        togglePermission(permission.id, "canCreate");
        togglePermission(permission.id, "canRead");
        togglePermission(permission.id, "canUpdate");
        togglePermission(permission.id, "canDelete");
    };

    const handlePermissionToggle = (permissionType: keyof Permission) => {
        togglePermission(permission.id, permissionType);
    };

    return (
        <tr key={permission.id}>
            <td className="py-4">
                <div className="flex items-center space-x-2">
                    <CheckboxWithIndeterminate
                        checked={isAllChecked()}
                        indeterminate={!isAllChecked() && !isNoneChecked()}
                        onChange={handleEntityToggle}
                    />
                    <span>{permission.entityName ?? "Unnamed Entity"}</span>
                </div>
            </td>
            <td>
                <div className="w-full flex justify-center items-center">
                    <CustomCheckbox checked={permission.canCreate} onChange={() => handlePermissionToggle("canCreate")} />
                </div>
            </td>
            <td>
                <div className="w-full flex justify-center items-center">
                    <CustomCheckbox checked={permission.canRead} onChange={() => handlePermissionToggle("canRead")} />
                </div>
            </td>
            <td>
                <div className="w-full flex justify-center items-center">
                    <CustomCheckbox checked={permission.canUpdate} onChange={() => handlePermissionToggle("canUpdate")} />
                </div>
            </td>
            <td>
                <div className="w-full flex justify-center items-center">
                    <CustomCheckbox checked={permission.canDelete} onChange={() => handlePermissionToggle("canDelete")} />
                </div>
            </td>
        </tr>
    );
};

export default PermissionRow;

interface CheckboxProps {
    checked: boolean;
    indeterminate?: boolean;
    onChange: () => void;
}

const CheckboxWithIndeterminate = ({ checked, indeterminate, onChange }: CheckboxProps) => {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = !!indeterminate;
        }
    }, [indeterminate]);

    return (
        <div onClick={onChange} className="h-5 w-5 rounded-md flex justify-center items-center border border-gray-300 cursor-pointer">
            {indeterminate ? (
                <Minus className="text-black dark:text-white w-4 h-4" />
            ) : checked ? (
                <Check className="text-black dark:text-white w-4 h-4" />
            ) : null}
        </div>
    );
};

const CustomCheckbox = ({ checked, onChange }: CheckboxProps) => {
    return (
        <div
            onClick={onChange}
            className={`w-5 h-5 flex justify-center items-center rounded-md cursor-pointer bg-black border border-white`}
        >
            {checked ? <Check className="text-white w-4 h-4" /> : <Minus className="text-white w-4 h-4" />}
        </div>
    );
};
