"use client";

import { Download } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { exportProjectCSV } from "@/lib/db/queries/projects";
import { Button } from "./ui/button";

export function CSVButton({
    projectId,
    projectName,
}: {
    projectId: string;
    projectName: string;
}) {
    const [isDownloadPending, startDownload] = useTransition();

    const onClick = async () => {
        startDownload(async () => {
            try {
                const base64CSV = await exportProjectCSV(projectId);
                const link = document.createElement("a");
                link.href = `data:text/csv;base64,${base64CSV}`;
                link.download = `${projectName}-${projectId}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("CSV downloaded");
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Failed to delete project";
                console.error(e);
                toast.error(msg);
            }
        });
    };

    return (
        <Button
            size={"icon-sm"}
            variant={"ghost"}
            onClick={onClick}
            disabled={isDownloadPending}
        >
            <Download />
        </Button>
    );
}
