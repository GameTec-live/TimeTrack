import Link from "next/link";
import type { ProjectPin } from "@/lib/db/queries/projects";
import { cn } from "@/lib/utils";
import ProjectMenu from "./projectmenu";

export default function PinnedProjects({ pins }: { pins: ProjectPin[] }) {
    return (
        <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pinned Projects
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {pins.map((pin) => (
                    <li
                        key={pin.name}
                        className="col-span-1 flex rounded-md shadow-xs dark:shadow-none"
                    >
                        <div
                            className={cn(
                                pin.color,
                                "flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white",
                            )}
                        >
                            {pin.name.length > 2
                                ? pin.name.includes(" ")
                                    ? pin.name
                                          .split(" ")
                                          .map((word) =>
                                              word.charAt(0).toUpperCase(),
                                          )
                                          .join("")
                                    : pin.name.slice(0, 2).toUpperCase()
                                : pin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800/50">
                            <Link
                                href={`/projects/${pin.id}`}
                                className="flex-1 truncate px-4 py-2 text-sm"
                            >
                                <p className="font-medium text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-200">
                                    {pin.name}
                                </p>
                            </Link>
                            <div className="shrink-0 pr-2">
                                <ProjectMenu pinned projectId={pin.id} />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
