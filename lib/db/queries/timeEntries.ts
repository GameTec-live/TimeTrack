"use server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib";
import { auth } from "@/lib/auth";
import { timeEntry, user } from "../schema";

export async function getTimeEntriesByProjectId(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const data = await db
        .select({
            id: timeEntry.id,
            projectId: timeEntry.projectId,
            userId: timeEntry.userId,
            startedAt: timeEntry.startedAt,
            stoppedAt: timeEntry.stoppedAt,
            note: timeEntry.note,
            userName: user.name,
            userImage: user.image,
        })
        .from(timeEntry)
        .where(and(eq(timeEntry.projectId, projectId)))
        .leftJoin(user, eq(timeEntry.userId, user.id))
        .orderBy(desc(timeEntry.startedAt));

    const personalTimeEntries = data.filter(
        (te) => te.userId === session.user.id,
    );
    const runningEntry = personalTimeEntries.find(
        (te) => te.stoppedAt === null,
    );

    const totalPersonalTime = personalTimeEntries.reduce((acc, te) => {
        if (te.stoppedAt) {
            return acc + (te.stoppedAt.getTime() - te.startedAt.getTime());
        } else {
            return acc + (Date.now() - te.startedAt.getTime());
        }
    }, 0);

    const totalSharedTime = data.reduce((acc, te) => {
        if (te.stoppedAt) {
            return acc + (te.stoppedAt.getTime() - te.startedAt.getTime());
        } else {
            return acc + (Date.now() - te.startedAt.getTime());
        }
    }, 0);

    return { data, runningEntry, totalPersonalTime, totalSharedTime };
}

export async function startTime(
    projectId: string,
    note: string | null | undefined,
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const existingEntry = await db
        .select()
        .from(timeEntry)
        .where(
            and(
                eq(timeEntry.projectId, projectId),
                eq(timeEntry.userId, session.user.id),
                isNull(timeEntry.stoppedAt),
            ),
        );

    if (existingEntry.length > 0) {
        throw new Error(
            "A time entry is already running for this project and user",
        );
    }

    await db.insert(timeEntry).values({
        projectId,
        userId: session.user.id,
        startedAt: new Date(),
        note,
    });
}

export async function stopTime(
    projectId: string,
    note: string | null | undefined,
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("No session found");
    }

    const existingEntry = await db
        .select()
        .from(timeEntry)
        .where(
            and(
                eq(timeEntry.projectId, projectId),
                eq(timeEntry.userId, session.user.id),
                isNull(timeEntry.stoppedAt),
            ),
        );

    if (existingEntry.length === 0) {
        throw new Error(
            "No running time entry found for this project and user",
        );
    }

    const entry = existingEntry[0];

    await db
        .update(timeEntry)
        .set({
            stoppedAt: new Date(),
            note: note ?? entry.note,
        })
        .where(eq(timeEntry.id, entry.id));
}

export type GetTimeEntriesByProjectIdQueryResult = Awaited<
    ReturnType<typeof getTimeEntriesByProjectId>
>;

export type TimeEntry = GetTimeEntriesByProjectIdQueryResult["data"][number];
