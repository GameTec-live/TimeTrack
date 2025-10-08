"use client";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startTime, stopTime } from "@/lib/db/queries/timeEntries";
import { Textarea } from "./ui/textarea";

export default function StartStopButton({
    projectId,
    startedAt,
    note,
}: {
    projectId: string;
    startedAt: Date | undefined;
    note: string | null | undefined;
}) {
    const router = useRouter();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isPending, startTransition] = useTransition();

    const onClick = async () => {
        startTransition(async () => {
            try {
                if (startedAt) {
                    await stopTime(projectId, textAreaRef.current?.value);
                    if (textAreaRef.current) {
                        textAreaRef.current.value = "";
                    }
                } else {
                    await startTime(projectId, textAreaRef.current?.value);
                }
                router.refresh();
                toast.success(`Timer ${startedAt ? "stopped" : "started"}`);
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Failed to toggle timer";
                console.error(e);
                toast.error(msg);
            }
        });
    };

    return (
        <>
            <Textarea
                placeholder="Add a comment..."
                className="max-w-md min-h-18 max-h-18"
                defaultValue={note ?? ""}
                ref={textAreaRef}
            />
            {startedAt ? (
                <Button
                    variant="destructive"
                    onClick={onClick}
                    disabled={isPending}
                >
                    Stop Timer
                </Button>
            ) : (
                <Button onClick={onClick} disabled={isPending}>
                    Start Timer
                </Button>
            )}
        </>
    );
}
