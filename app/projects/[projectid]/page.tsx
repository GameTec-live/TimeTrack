import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Feed from "@/components/feed";
import StartStopButton from "@/components/startstop-button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/lib/db/queries/projects";
import { getTimeEntriesByProjectId } from "@/lib/db/queries/timeEntries";
import { FormatTime } from "@/lib/timeformatter";

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ projectid: string }>;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) return redirect("/");

    const { projectid } = await params;

    const projects = await getProjectById(projectid);
    if (projects.length === 0) return notFound();
    const project = projects[0];

    const { data, runningEntry, totalPersonalTime, totalSharedTime } =
        await getTimeEntriesByProjectId(projectid);

    return (
        <main className="flex flex-col items-center m-4">
            <Card className="max-w-lg w-full">
                <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 w-full items-center justify-center">
                    {runningEntry?.startedAt ? (
                        <h1 className="text-4xl font-bold">
                            {FormatTime(
                                Date.now() - runningEntry.startedAt.getTime(),
                            )}
                        </h1>
                    ) : (
                        <h1 className="text-4xl font-bold">
                            {FormatTime(totalPersonalTime)}
                        </h1>
                    )}
                    <div className="flex flex-col md:flex-row items-center justify-center">
                        {runningEntry?.startedAt && (
                            <p className="text-muted-foreground text-sm mr-4">
                                Started{" "}
                                {runningEntry.startedAt.toLocaleString()}
                            </p>
                        )}
                        <p className="text-muted-foreground text-sm">
                            {FormatTime(totalSharedTime)} total time
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <CardAction className="flex flex-col items-center gap-2 w-full">
                        <StartStopButton
                            projectId={projectid}
                            startedAt={runningEntry?.startedAt}
                            note={runningEntry?.note}
                        />
                    </CardAction>
                </CardFooter>
            </Card>
            {data.length === 0 ? (
                <div className="text-center mt-4">
                    <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="mx-auto size-12 text-gray-400 dark:text-gray-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                        No entries yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Get started by pressing the button above.
                    </p>
                </div>
            ) : (
                <Feed entries={data} />
            )}
        </main>
    );
}
