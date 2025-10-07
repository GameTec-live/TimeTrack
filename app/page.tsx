import { PlusIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import Hero from "@/components/hero";
import NavBar from "@/components/nav-bar";
import NoProjects from "@/components/no-projects";
import Projects from "@/components/project-grid";
import { auth } from "@/lib/auth";
import { getProjects } from "@/lib/db/queries/projects";

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return <Hero />;
    }

    const projects = await getProjects();

    return (
        <main>
            <NavBar />
            {projects.length > 0 ? (
                <Projects projects={projects} />
            ) : (
                <NoProjects />
            )}
            <Link href="/projects/new">
                <button
                    type="button"
                    className="rounded-full bg-indigo-600 p-2 text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 absolute bottom-4 right-4 md:bottom-8 md:right-8"
                >
                    <PlusIcon
                        aria-hidden="true"
                        className="size-8 md:size-12"
                    />
                </button>
            </Link>
        </main>
    );
}
