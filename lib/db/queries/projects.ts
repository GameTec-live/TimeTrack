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

    return await db
        .select()
        .from(project)
        .where(eq(project.ownerId, session.user.id))
        .orderBy(desc(project.createdAt));
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

export async function getProjectPins() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    return await db
        .select({
            id: project.id,
            name: project.name,
            color: project.bgColor,
        })
        .from(projectPin)
        .where(eq(projectPin.userId, session.user.id))
        .innerJoin(project, eq(project.id, projectPin.projectId))
        .orderBy(desc(projectPin.createdAt));
}

export type GetProjectPinsQueryResult = Awaited<
    ReturnType<typeof getProjectPins>
>;
export type ProjectPin = GetProjectPinsQueryResult[number];

export type GetProjectQueryResult = Awaited<ReturnType<typeof getProjects>>;
export type Project = GetProjectQueryResult[number];
