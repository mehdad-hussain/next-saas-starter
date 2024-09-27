import { type Permission } from "@/lib/db/validations";
import PermissionRow from "./permission-row";

interface PermissionTableProps {
    permissions: Permission[];
}

const PermissionTable = ({ permissions }: PermissionTableProps) => {
    return (
        <div className="py-4">
            <table className="w-full table-auto">
                <thead>
                    <tr>
                        <th className="text-left sr-only">Entity</th>
                        <th className="text-center">Create</th>
                        <th className="text-center">Read</th>
                        <th className="text-center">Update</th>
                        <th className="text-center">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions.map((perm) => (
                        <PermissionRow key={perm.id} perm={perm} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PermissionTable;
