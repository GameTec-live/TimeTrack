import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { exportProjectCSV } from "@/lib/db/queries/projects";

export const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
        return new Response("Bad Request - Missing projectId", { status: 400 });
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (
        !/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
            projectId,
        )
    ) {
        return new Response("Bad Request - Invalid projectId", { status: 400 });
    }

    try {
        const base64CSV = await exportProjectCSV(projectId);
        return new Response(base64CSV, { status: 200 });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to export project";
        return new Response(msg, { status: 500 });
    }
};
