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
                        <>
                            <h1 className="text-4xl font-bold">
                                {FormatTime(
                                    Date.now() -
                                        runningEntry.startedAt.getTime(),
                                )}
                            </h1>
                            <p className="text-muted-foreground text-xs">
                                {runningEntry.startedAt.toLocaleString()}
                            </p>
                        </>
                    ) : (
                        <h1 className="text-4xl font-bold">
                            {FormatTime(totalPersonalTime)}
                        </h1>
                    )}
                    <p className="text-muted-foreground text-sm">
                        {FormatTime(totalSharedTime)} total time
                    </p>
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
            <Feed entries={data} />
        </main>
    );
}
