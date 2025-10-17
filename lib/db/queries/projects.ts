"use server";
import { intervalToDuration } from "date-fns";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { generatePDF } from "@/lib/pdfgen";
import { project, projectPin, timeEntry, user } from "../schema";

export async function getProjects() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    // Get all projects of the user
    const projects = await db
        .select()
        .from(project)
        .where(eq(project.ownerId, session.user.id))
        .orderBy(desc(project.createdAt));

    // Get pinned project ids
    const pinned = await db
        .select({ projectId: projectPin.projectId })
        .from(projectPin)
        .where(eq(projectPin.userId, session.user.id));

    const pinnedSet = new Set(pinned.map((p) => p.projectId));
    return projects.map((p) => ({ ...p, pinned: pinnedSet.has(p.id) }));
}

export async function getProjectById(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    return await db
        .select()
        .from(project)
        .where(
            and(
                eq(project.id, projectId),
                eq(project.ownerId, session.user.id),
            ),
        );
}

export async function deleteProject(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    // Check permission
    const projectToDelete = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId));

    if (!projectToDelete || projectToDelete.length === 0) {
        throw new Error("Project not found");
    }

    if (projectToDelete[0].ownerId !== session.user.id) {
        throw new Error("You do not have permission to delete this project");
    }

    await db
        .delete(project)
        .where(
            and(
                eq(project.id, projectId),
                eq(project.ownerId, session.user.id),
            ),
        );
}

export async function pinProject(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    await db.insert(projectPin).values({
        projectId,
        userId: session.user.id,
    });
}

export async function unpinProject(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    await db
        .delete(projectPin)
        .where(
            and(
                eq(projectPin.projectId, projectId),
                eq(projectPin.userId, session.user.id),
            ),
        );
}

export async function createProject(
    name: string,
    description: string | null | undefined,
    color: string | null | undefined,
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const result = await db
        .insert(project)
        .values({
            name,
            description,
            bgColor: color,
            ownerId: session.user.id,
        })
        .returning();

    if (!result) {
        throw new Error("Failed to create project");
    }

    return result[0].id;
}

export async function exportProjectCSV(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const projectToExport = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId));

    if (!projectToExport || projectToExport.length === 0) {
        throw new Error("Project not found");
    }

    if (projectToExport[0].ownerId !== session.user.id) {
        throw new Error("You do not have permission to export this project");
    }

    const timeData = await db
        .select({
            id: timeEntry.id,
            projectId: timeEntry.projectId,
            userId: timeEntry.userId,
            userName: user.name,
            startedAt: timeEntry.startedAt,
            stoppedAt: timeEntry.stoppedAt,
            note: timeEntry.note,
        })
        .from(timeEntry)
        .where(eq(timeEntry.projectId, projectId))
        .leftJoin(user, eq(timeEntry.userId, user.id));

    const csv = [
        [
            "id",
            "projectId",
            "userId",
            "userName",
            "startedAt",
            "stoppedAt",
            "note",
        ].join(","),
        ...timeData.map((entry) =>
            [
                entry.id,
                entry.projectId,
                entry.userId,
                `"${entry.userName ?? "Unknown"}"`,
                entry.startedAt.toISOString(),
                entry.stoppedAt ? entry.stoppedAt.toISOString() : "",
                `"${(entry.note ?? "").replace(/"/g, '""')}"`,
            ].join(","),
        ),
    ].join("\n");

    return Buffer.from(csv).toString("base64");
}

export async function exportProjectCSVSimple(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const projectToExport = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId));

    if (!projectToExport || projectToExport.length === 0) {
        throw new Error("Project not found");
    }

    if (projectToExport[0].ownerId !== session.user.id) {
        throw new Error("You do not have permission to export this project");
    }

    const timeData = await db
        .select({
            userName: user.name,
            startedAt: timeEntry.startedAt,
            stoppedAt: timeEntry.stoppedAt,
            note: timeEntry.note,
        })
        .from(timeEntry)
        .where(eq(timeEntry.projectId, projectId))
        .leftJoin(user, eq(timeEntry.userId, user.id));

    const csv = [
        ["userName", "startedAt", "stoppedAt", "duration", "note"].join(";"),
        ...timeData.map((entry) =>
            [
                `"${entry.userName ?? "Unknown"}"`,
                entry.startedAt.toLocaleString(),
                entry.stoppedAt ? entry.stoppedAt.toLocaleString() : "",
                (() => {
                    const duration = intervalToDuration({
                        start: entry.startedAt,
                        end: entry.stoppedAt ?? new Date(),
                    });

                    const years = duration.years ?? 0;
                    const months = duration.months ?? 0;
                    const weeks = duration.weeks ?? 0;
                    const days = duration.days ?? 0;

                    const hoursFromLargerUnits =
                        years * 365 * 24 +
                        months * 30 * 24 +
                        weeks * 7 * 24 +
                        days * 24;

                    const totalHours =
                        (duration.hours ?? 0) + hoursFromLargerUnits;
                    return `${String(totalHours).padStart(2, "0")}:${String(duration.minutes ?? 0).padStart(2, "0")}:${String(duration.seconds ?? 0).padStart(2, "0")}`;
                })(),
                `"${(entry.note ?? "").replace(/"/g, '""')}"`,
            ].join(";"),
        ),
    ].join("\n");

    const csvWithBOM = `\uFEFF${csv}`;
    return Buffer.from(csvWithBOM, "utf8").toString("base64");
}

export async function exportProjectPDF(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const projectToExport = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId));

    if (!projectToExport || projectToExport.length === 0) {
        throw new Error("Project not found");
    }

    if (projectToExport[0].ownerId !== session.user.id) {
        throw new Error("You do not have permission to export this project");
    }

    const timeData = await db
        .select({
            userName: user.name,
            startedAt: timeEntry.startedAt,
            stoppedAt: timeEntry.stoppedAt,
            note: timeEntry.note,
        })
        .from(timeEntry)
        .where(eq(timeEntry.projectId, projectId))
        .leftJoin(user, eq(timeEntry.userId, user.id));

    const pdf = await generatePDF(timeData);

    return Buffer.from(pdf).toString("base64");
}

export type GetProjectQueryResult = Awaited<ReturnType<typeof getProjects>>;
export type Project = GetProjectQueryResult[number];
