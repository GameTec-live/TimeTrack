"use client";

import { formatDuration, intervalToDuration } from "date-fns";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TimeEntry } from "@/lib/db/queries/timeEntries";
import { cn } from "@/lib/utils";
import FeedItemMenu from "./feed-item-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Feed({ entries }: { entries: TimeEntry[] }) {
    return (
        <ul className="space-y-6 mt-4">
            {entries.map((entryItem, entryItemIdx) => (
                <li key={entryItem.id} className="relative flex gap-x-4">
                    <div
                        className={cn(
                            entryItemIdx === entries.length - 1
                                ? "h-6"
                                : "-bottom-6",
                            "absolute top-0 left-0 flex w-6 justify-center",
                        )}
                    >
                        <div className="w-px bg-gray-200 dark:bg-white/15" />
                    </div>
                    {entryItem.note && entryItem.note !== "" ? (
                        <>
                            <Avatar className="relative mt-3 size-6 flex-none rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10">
                                <AvatarImage
                                    src={entryItem.userImage || undefined}
                                    alt={entryItem.userName || "User"}
                                />
                                <AvatarFallback className="rounded-full">
                                    {entryItem.userName
                                        ? entryItem.userName
                                              .slice(0, 2)
                                              .toUpperCase()
                                        : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-auto rounded-md p-3 ring-1 ring-gray-200 ring-inset dark:ring-white/15">
                                <div className="flex justify-between gap-x-4">
                                    <Tooltip>
                                        <p className="flex-auto py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {entryItem.userName}
                                            </span>{" "}
                                            <TooltipTrigger>
                                                {entryItem.startedAt.toLocaleTimeString()}{" "}
                                                -{" "}
                                                {entryItem.stoppedAt?.toLocaleTimeString()}
                                            </TooltipTrigger>
                                        </p>
                                        <TooltipContent>
                                            {formatDuration(
                                                intervalToDuration({
                                                    start: entryItem.startedAt,
                                                    end:
                                                        entryItem.stoppedAt ??
                                                        new Date(),
                                                }),
                                            )}
                                        </TooltipContent>
                                    </Tooltip>

                                    <div className="flex flex-row gap-2">
                                        <time
                                            dateTime={entryItem.startedAt.toISOString()}
                                            className="flex-none py-0.5 text-xs/5 text-gray-500 dark:text-gray-400"
                                        >
                                            {entryItem.startedAt.toLocaleDateString()}
                                        </time>
                                        <FeedItemMenu entry={entryItem} />
                                    </div>
                                </div>
                                <p className="text-sm/6 text-gray-500 dark:text-gray-400 break-words text-wrap lg:max-w-lg max-w-[80vw]">
                                    {entryItem.note}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative flex size-6 flex-none items-center justify-center bg-white dark:bg-gray-900">
                                <div className="size-1.5 rounded-full bg-gray-100 ring ring-gray-300 dark:bg-white/10 dark:ring-white/20" />
                            </div>
                            <Tooltip>
                                <p className="flex-auto py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {entryItem.userName}
                                    </span>{" "}
                                    <TooltipTrigger>
                                        {entryItem.startedAt.toLocaleTimeString()}{" "}
                                        -{" "}
                                        {entryItem.stoppedAt?.toLocaleTimeString()}
                                    </TooltipTrigger>
                                </p>
                                <TooltipContent>
                                    {formatDuration(
                                        intervalToDuration({
                                            start: entryItem.startedAt,
                                            end:
                                                entryItem.stoppedAt ??
                                                new Date(),
                                        }),
                                    )}
                                </TooltipContent>
                            </Tooltip>
                            <div className="flex flex-row gap-2">
                                <time
                                    dateTime={entryItem.startedAt.toISOString()}
                                    className="flex-none py-0.5 text-xs/5 text-gray-500 dark:text-gray-400"
                                >
                                    {entryItem.startedAt.toLocaleDateString()}
                                </time>
                                <FeedItemMenu entry={entryItem} />
                            </div>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}
