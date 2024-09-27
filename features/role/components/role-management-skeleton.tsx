"use client";
type Props = {
    columnCount: number;
};

const RoleManagementSkeleton = ({ columnCount }: Props) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex justify-between items-center animate-pulse">
                    {Array.from({ length: columnCount }).map((_, colIndex) => (
                        <div key={colIndex} className="bg-gray-300 h-6 w-full rounded"></div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default RoleManagementSkeleton;
