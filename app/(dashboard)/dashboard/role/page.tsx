import { getAllRolesWithUserCount } from "@/features/role/api/actions";
import { RolesTable } from "@/features/role/components/roles-table";

type Props = Record<string, never>;

const Page = async ({}: Props) => {
    const rolesPromise = getAllRolesWithUserCount();

    return (
        <>
            <RolesTable rolesPromise={rolesPromise} />
        </>
    );
};

export default Page;
