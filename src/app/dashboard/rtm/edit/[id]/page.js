"use client";

import RtmNewForm from "@/components/RTM/rtm-new-form";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function EditRtmPage() {
    const router = useRouter();
    const params = useParams();
    const [rtm, setRtm] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!params.id) return;

        const fetchRtm = async () => {
            try {
                setIsLoading(true);
                const res = await api.get(`/api/rtm/${params.id}`);
                if (res.data?.success) {
                    setRtm(res.data.data)
                }
            } catch (error) {
                console.error("Gagal mengambil data RTM:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRtm();
    }, [params.id]);

    const handleBack = () => {
        router.push("/dashboard/rtm");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mr-2"></div>
                Memuat data RTM...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <RtmNewForm rtm={rtm} onBack={handleBack} />
        </div>
    );
}
