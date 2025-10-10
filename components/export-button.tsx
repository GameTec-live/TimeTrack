"use client";

import { Download, File, Table, Table2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
    exportProjectCSV,
    exportProjectCSVSimple,
    exportProjectPDF,
} from "@/lib/db/queries/projects";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ExportButton({
    projectId,
    projectName,
}: {
    projectId: string;
    projectName: string;
}) {
    const [isCSVDownloadPending, startCSVDownload] = useTransition();
    const [isSimpleCSVDownloadPending, startSimpleCSVDownload] =
        useTransition();
    const [isPDFDownloadPending, startPDFDownload] = useTransition();

    const onCSVClick = async () => {
        startCSVDownload(async () => {
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

    const onSimpleCSVClick = async () => {
        startSimpleCSVDownload(async () => {
            try {
                const base64CSV = await exportProjectCSVSimple(projectId);
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

    const onPDFClick = async () => {
        startPDFDownload(async () => {
            try {
                const base64PDF = await exportProjectPDF(projectId);
                const link = document.createElement("a");
                link.href = `data:application/pdf;base64,${base64PDF}`;
                link.download = `${projectName}-${projectId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("PDF downloaded");
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Failed to delete project";
                console.error(e);
                toast.error(msg);
            }
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size={"icon-sm"} variant={"ghost"}>
                    <Download />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    onClick={onSimpleCSVClick}
                    disabled={isSimpleCSVDownloadPending}
                >
                    <Table2 className="mr-0.5" />
                    CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onCSVClick}
                    disabled={isCSVDownloadPending}
                >
                    <Table className="mr-0.5" />
                    CSV (Adv.)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onPDFClick}
                    disabled={isPDFDownloadPending}
                >
                    <File className="mr-0.5" />
                    PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
