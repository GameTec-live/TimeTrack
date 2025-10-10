"use client";
import { Edit, EllipsisVertical, Trash2 } from "lucide-react";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { deleteEntry, type TimeEntry } from "@/lib/db/queries/timeEntries";
import FeedItemEditDialog from "./feed-item-edit-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function FeedItemMenu({ entry }: { entry: TimeEntry }) {
    const router = useRouter();
    const [isDeletePending, startDeleteTransition] = useTransition();
    const { data: session } = authClient.useSession();

    const onDelete = async () => {
        startDeleteTransition(async () => {
            try {
                await deleteEntry(entry.id);
                router.refresh();
                toast.success("Entry deleted");
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Failed to delete entry";
                console.error(e);
                toast.error(msg);
            }
        });
    };

    return (
        <Dialog>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex size-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 dark:hover:text-white dark:focus:outline-white"
                        >
                            <span className="sr-only">Open options</span>
                            <EllipsisVertical
                                aria-hidden="true"
                                className="size-5"
                            />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DialogTrigger asChild>
                            <DropdownMenuItem
                                disabled={
                                    entry.userId !== session?.user.id ||
                                    isDeletePending ||
                                    !entry.stoppedAt
                                }
                            >
                                <Edit className="mr-0.5" />
                                Edit
                            </DropdownMenuItem>
                        </DialogTrigger>
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
                            delete the entry and remove all associated data.
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
            {entry.stoppedAt && <FeedItemEditDialog entry={entry} />}
        </Dialog>
    );
}
