"use client";

import RtmNewTable from "@/components/RTM/rtm-new-table";
import { useRouter } from "next/navigation";

export default function RtmPage() {
    const router = useRouter();

    const handleAdd = () => {
        router.push("/dashboard/rtm/create");
    };

    const handleEdit = (rtm) => {
        router.push(`/dashboard/rtm/edit/${rtm.id}`);
    };

    return (
        <div className="space-y-6">
            <RtmNewTable onAdd={handleAdd} onEdit={handleEdit} />
        </div>
    );
}
