'use client'

import React from 'react';
import { FileText, Image as ImageIcon, FileSpreadsheet, File } from 'lucide-react';

const MiniAttachmentViewer = ({ url }) => {
    if (!url) return null;

    const extension = url.split('.').pop().toLowerCase().split('?')[0];
    const fileNameParts = url.split('/').pop().split('-');
    const fileName = fileNameParts.length > 1 ? fileNameParts.slice(1).join('-') : url.split('/').pop() || `File-${extension}`;

    let type = 'document';
    let Icon = File;
    let iconColor = "text-muted-foreground";
    let bgColor = "bg-muted";

    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        type = 'image';
        Icon = ImageIcon;
        iconColor = "text-blue-500";
        bgColor = "bg-blue-50 dark:bg-blue-900/20";
    } else if (['pdf'].includes(extension)) {
        type = 'pdf';
        Icon = FileText;
        iconColor = "text-red-500";
        bgColor = "bg-red-50 dark:bg-red-900/20";
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
        type = 'excel';
        Icon = FileSpreadsheet;
        iconColor = "text-green-600 dark:text-green-500";
        bgColor = "bg-green-50 dark:bg-green-900/20";
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-1.5 pr-3 rounded border border-border/80 hover:bg-muted/50 hover:border-border transition-colors w-max max-w-full overflow-hidden group shadow-sm bg-background"
        >
            <div className={`flex-shrink-0 h-6 w-6 rounded-sm flex items-center justify-center ${bgColor}`}>
                <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                    {fileName}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase leading-tight font-semibold tracking-wider">
                    {type}
                </span>
            </div>
        </a>
    );
};

export default MiniAttachmentViewer;
