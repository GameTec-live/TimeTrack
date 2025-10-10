"use client";

import { useEffect, useRef, useState } from "react";
import { FormatTime } from "@/lib/timeformatter";
import { cn } from "@/lib/utils";

type LiveTimerProps = {
    startedAtMs: number;
    /**
     * Elapsed ms at render time generated on the server to ensure
     * hydration doesn't mismatch. If omitted, defaults to 0.
     */
    initialElapsedMs?: number;
    className?: string;
    /**
     * Optional callback when the displayed elapsed time updates.
     * Receives the elapsed milliseconds.
     */
    onTick?: (elapsedMs: number) => void;
};

/**
 * Live-updating timer that displays the elapsed time since `startedAtMs`.
 * Uses requestAnimationFrame for smooth updates and millisecond precision.
 */
export default function LiveTimer({
    startedAtMs,
    initialElapsedMs,
    className,
    onTick,
}: LiveTimerProps) {
    const [elapsed, setElapsed] = useState<number>(() =>
        Math.max(0, initialElapsedMs ?? 0),
    );
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        let mounted = true;

        const tick = () => {
            const now = Date.now();
            const next = Math.max(0, now - startedAtMs);
            if (!mounted) return;
            setElapsed(next);
            onTick?.(next);
            rafRef.current = window.requestAnimationFrame(tick);
        };

        // Start the loop
        rafRef.current = window.requestAnimationFrame(tick);

        return () => {
            mounted = false;
            if (rafRef.current !== null) {
                window.cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [startedAtMs, onTick]);

    return <span className={cn(className)}>{FormatTime(elapsed)}</span>;
}
