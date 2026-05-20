"use client";

import RtmNewForm from "@/components/RTM/rtm-new-form";
import RtmNewTable from "@/components/RTM/rtm-new-table";
import { useState } from "react";

export default function RtmNewPage() {
    const [view, setView] = useState("list"); // 'list' | 'form'
    const [selectedRtm, setSelectedRtm] = useState(null);

    const handleAdd = () => {
        setSelectedRtm(null);
        setView("form");
    };

    const handleEdit = (rtm) => {
        setSelectedRtm(rtm);
        setView("form");
    };

    const handleBack = () => {
        setView("list");
    };

    return (
        <div className="space-y-6">
            {view === "list" ? (
                <RtmNewTable onAdd={handleAdd} onEdit={handleEdit} />
            ) : (
                <RtmNewForm rtm={selectedRtm} onBack={handleBack} />
            )}
        </div>
    );
}
