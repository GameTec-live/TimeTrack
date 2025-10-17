"use client";

export default function ClientTime({ time }: { time: Date }) {
    return time.toLocaleString();
}
