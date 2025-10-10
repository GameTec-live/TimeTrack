"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { editEntry, type TimeEntry } from "@/lib/db/queries/timeEntries";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const formSchema = z
    .object({
        startedAt: z.date("Required"),
        stoppedAt: z.date("Required").nullable(),
        note: z.string().optional(),
    })
    .refine(
        (data) => data.stoppedAt === null || data.stoppedAt > data.startedAt,
        {
            message: "Stop time must be after start time",
            path: ["stoppedAt"],
        },
    );

export default function FeedItemEditDialog({ entry }: { entry: TimeEntry }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startedAt: entry.startedAt,
            stoppedAt: entry.stoppedAt,
            note: entry.note ?? "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                await editEntry(
                    entry.id,
                    data.startedAt,
                    data.stoppedAt,
                    data.note,
                );
                router.refresh();
                toast.success("Entry updated");
            } catch (e) {
                const msg =
                    e instanceof Error ? e.message : "Failed to update entry";
                console.error(e);
                toast.error(msg);
            }
        });
    }

    return (
        <DialogContent onCloseAutoFocus={() => form.reset()}>
            <DialogHeader>
                <DialogTitle>Edit Entry</DialogTitle>
                <DialogDescription>
                    Edit the details of your time entry.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="startedAt"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="YYYY-MM-DD HH:MM:SS"
                                        step="1"
                                        type="datetime-local"
                                        value={
                                            field.value
                                                ? format(
                                                      field.value,
                                                      "yyyy-MM-dd'T'HH:mm:ss",
                                                  )
                                                : ""
                                        }
                                        onChange={(e) =>
                                            field.onChange(
                                                new Date(e.target.value),
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormDescription>
                                    Please select your start date and time.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="stoppedAt"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Stop</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="YYYY-MM-DD HH:MM:SS"
                                        type="datetime-local"
                                        step="1"
                                        value={
                                            field.value
                                                ? format(
                                                      field.value,
                                                      "yyyy-MM-dd'T'HH:mm:ss",
                                                  )
                                                : ""
                                        }
                                        onChange={(e) =>
                                            field.onChange(
                                                new Date(e.target.value),
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormDescription>
                                    Please select your stop date and time.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Comment</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Comment"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Add an optional comment to your entry.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={!form.formState.isValid || isPending}
                        >
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}
