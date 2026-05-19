"use client";

import { useState } from "react";
import RtmNewTable from "./components/rtm-new-table";
import RtmNewForm from "./components/rtm-new-form";

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
