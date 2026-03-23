"use client";

import type { CSSProperties } from "react";

/**
 * Circular rotating label — same structure as LatestNewsRollup, text from props.
 * Keep title short for readable ring (max ~36 chars).
 * Use `preserveCase` for fixed designs like "LATEST NEWS - LATEST NEWS -".
 */
export default function CircularLabelText({
    text,
    preserveCase = false,
}: {
    text: string;
    preserveCase?: boolean;
}) {
    const trimmed = (text || (preserveCase ? "" : "Blog")).trim();
    if (!trimmed) return null;
    const raw = preserveCase ? trimmed : trimmed.toUpperCase();
    const truncated = raw.length > 36 ? `${raw.slice(0, 33)}…` : raw;
    const chars = truncated.split("");
    const n = Math.max(chars.length, 1);

    return (
        <>
            {chars.map((ch, i) => (
                <span
                    key={`${i}-${ch}`}
                    className="text__char"
                    style={
                        {
                            "--char-rotate": `${(i / n) * 360}deg`,
                        } as CSSProperties
                    }
                >
                    {ch === " " ? "\u00A0" : ch}
                </span>
            ))}
        </>
    );
}
