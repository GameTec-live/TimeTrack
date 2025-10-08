import type { Project } from "@/lib/db/queries/projects";
import ProjectsGrid from "./projects-grid";
import { Separator } from "./ui/separator";

export default function Projects({ projects }: { projects: Project[] }) {
    const pinnedProjects = projects.filter((project) => project.pinned);

    return (
        <div className="m-4">
            {pinnedProjects.length > 0 && (
                <>
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Pinned Projects
                    </h2>
                    <ProjectsGrid projects={pinnedProjects} />
                    <Separator className="my-4" />
                </>
            )}
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                All Projects
            </h2>
            <ProjectsGrid projects={projects} />
        </div>
    );
}
