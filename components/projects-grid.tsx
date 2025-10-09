import Link from "next/link";
import type { Project } from "@/lib/db/queries/projects";
import { cn } from "@/lib/utils";
import ProjectMenu from "./projectmenu";

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
    return (
        <ul className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {projects.map((project) => (
                <li
                    key={project.id}
                    className="col-span-1 flex rounded-md shadow-xs dark:shadow-none"
                >
                    <div
                        className={cn(
                            project.bgColor,
                            "flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white",
                        )}
                    >
                        {project.name.length > 2
                            ? project.name.includes(" ")
                                ? project.name
                                      .split(" ")
                                      .map((word) =>
                                          word.charAt(0).toUpperCase(),
                                      )
                                      .join("")
                                : project.name.slice(0, 2).toUpperCase()
                            : project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800/50">
                        <Link
                            prefetch
                            href={`/projects/${project.id}`}
                            className="flex-1 truncate px-4 py-2 text-sm"
                        >
                            <p className="font-medium text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-200">
                                {project.name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
                                {project.description}
                            </p>
                        </Link>
                        <div className="shrink-0 pr-2">
                            <ProjectMenu
                                projectId={project.id}
                                pinned={project.pinned}
                            />
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
