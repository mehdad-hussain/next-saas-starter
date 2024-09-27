import { getRoleData } from "@/features/role/api/actions";
import RoleEditForm from "@/features/role/components/role-edit-form";
import { Params } from "next/dist/client/components/params";

type Props = {
    params: Params;
};

const Page = async ({ params }: Props) => {
    const roleData = await getRoleData(Number(params.id));
    return (
        <>
            <RoleEditForm roleData={roleData} />
        </>
    );
};

export default Page;
