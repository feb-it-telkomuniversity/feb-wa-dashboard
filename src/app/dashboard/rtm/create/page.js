"use client";

import RtmNewForm from "@/components/RTM/rtm-new-form";
import { useRouter } from "next/navigation";

export default function CreateRtmPage() {
    const router = useRouter();

    const handleBack = () => {
        router.push("/dashboard/rtm");
    };

    return (
        <div className="space-y-6">
            <RtmNewForm onBack={handleBack} />
        </div>
    );
}
