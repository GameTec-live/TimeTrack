import { headers } from "next/headers";
import Hero from "@/components/hero";
import NavBar from "@/components/nav-bar";
import NoProjects from "@/components/no-projects";
import PinnedProjects from "@/components/pinned-projects";
import Projects from "@/components/project-grid";
import { auth } from "@/lib/auth";
import { getProjectPins, getProjects } from "@/lib/db/queries/projects";

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return <Hero />;
    }

    const projects = await getProjects();
    const projectPins = await getProjectPins();

    return (
        <main>
            <NavBar />
            {projectPins.length > 0 && <PinnedProjects pins={projectPins} />}
            {projects.length > 0 ? (
                <Projects projects={projects} />
            ) : (
                <NoProjects />
            )}
        </main>
    );
}
