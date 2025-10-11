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
        return <Hero useMS={Boolean(process.env.MICROSOFT_CLIENT_ID)} />;
    }

    const projects = await getProjects();

    return (
        <>
            <NavBar />
            <main>
                {projects.length > 0 ? (
                    <Projects projects={projects} />
                ) : (
                    <NoProjects />
                )}
                <Link href="/projects/new" prefetch>
                    <button
                        type="button"
                        className="fixed rounded-full bg-blue-600 p-2 text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:shadow-none dark:hover:bg-blue-400 dark:focus-visible:outline-blue-500 bottom-4 right-4 md:bottom-8 md:right-8"
                    >
                        <PlusIcon
                            aria-hidden="true"
                            className="size-8 md:size-12"
                        />
                    </button>
                </Link>
            </main>
        </>
    );
}
