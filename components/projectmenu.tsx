"use client";
import { EllipsisVertical, Pin, PinOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    deleteProject,
    pinProject,
    unpinProject,
} from "@/lib/db/queries/projects";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
export default function ProjectMenu({
    pinned,
    projectId,
}: {
    pinned?: boolean;
    projectId: string;
}) {
    const router = useRouter();
    const [isDeletePending, startDeleteTransition] = useTransition();
    const [isPinPending, startPinTransition] = useTransition();

    const onDelete = async () => {
        startDeleteTransition(async () => {
            try {
                await deleteProject(projectId);
                router.refresh();
                toast.success("Project deleted");
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Failed to delete project";
                console.error(e);
                toast.error(msg);
            }
        });
    };

    const onPin = async () => {
        startPinTransition(async () => {
            try {
                if (pinned) {
                    await unpinProject(projectId);
                } else {
                    await pinProject(projectId);
                }
                router.refresh();
                toast.success(pinned ? "Project unpinned" : "Project pinned");
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Failed to pin project";
                console.error(e);
                toast.error(msg);
            }
        });
    };

    return (
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:hover:text-white dark:focus:outline-white"
                    >
                        <span className="sr-only">Open options</span>
                        <EllipsisVertical
                            aria-hidden="true"
                            className="size-5"
                        />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem disabled={isPinPending} onSelect={onPin}>
                        {pinned ? (
                            <PinOff className="mr-0.5" />
                        ) : (
                            <Pin className="mr-0.5" />
                        )}
                        {pinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild disabled={isDeletePending}>
                        <DropdownMenuItem disabled={isDeletePending}>
                            <Trash2 className="mr-0.5" />
                            Delete
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the project and remove all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onDelete}
                        disabled={isDeletePending}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
