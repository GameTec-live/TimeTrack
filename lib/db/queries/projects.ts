"use server";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { project, projectPin } from "../schema";

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

export type GetProjectQueryResult = Awaited<ReturnType<typeof getProjects>>;
export type Project = GetProjectQueryResult[number];
