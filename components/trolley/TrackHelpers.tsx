// Track geometry helpers for trolley scene

export type Point = { x: number; y: number };

export type RailDef =
    | { type: 'line'; p0: Point; p1: Point }
    | { type: 'quad'; p0: Point; p1: Point; p2: Point }
    | { type: 'cubic'; p0: Point; p1: Point; p2: Point; p3: Point };

export function getPointOnRail(rail: RailDef, t: number): Point {
    if (rail.type === 'line') {
        return {
            x: rail.p0.x + t * (rail.p1.x - rail.p0.x),
            y: rail.p0.y + t * (rail.p1.y - rail.p0.y)
        };
    } else if (rail.type === 'quad') {
        const oneMinusT = 1 - t;
        return {
            x: oneMinusT * oneMinusT * rail.p0.x + 2 * oneMinusT * t * rail.p1.x + t * t * rail.p2.x,
            y: oneMinusT * oneMinusT * rail.p0.y + 2 * oneMinusT * t * rail.p1.y + t * t * rail.p2.y
        };
    } else if (rail.type === 'cubic') {
        // Cubic Bezier: B(t) = (1-t)^3*P0 + 3*(1-t)^2*t*P1 + 3*(1-t)*t^2*P2 + t^3*P3
        const oneMinusT = 1 - t;
        const oneMinusT2 = oneMinusT * oneMinusT;
        const oneMinusT3 = oneMinusT2 * oneMinusT;
        const t2 = t * t;
        const t3 = t2 * t;
        return {
            x: oneMinusT3 * rail.p0.x + 3 * oneMinusT2 * t * rail.p1.x + 3 * oneMinusT * t2 * rail.p2.x + t3 * rail.p3.x,
            y: oneMinusT3 * rail.p0.y + 3 * oneMinusT2 * t * rail.p1.y + 3 * oneMinusT * t2 * rail.p2.y + t3 * rail.p3.y
        };
    }
    return { x: 0, y: 0 };
}

type TrackTiesProps = {
    rail1: RailDef;
    rail2: RailDef;
    count: number;
    startT?: number;
    endT?: number;
};

export function TrackTies({ rail1, rail2, count, startT = 0, endT = 1 }: TrackTiesProps) {
    return (
        <g>
            {Array.from({ length: count }).map((_, i) => {
                const tActual = startT + (i / (count - 1 || 1)) * (endT - startT);

                const p1 = getPointOnRail(rail1, tActual);
                const p2 = getPointOnRail(rail2, tActual);

                // Extend slightly past rails
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const angle = Math.atan2(dy, dx);
                const ext = 4; // Extension length

                const x1 = p1.x - Math.cos(angle) * ext;
                const y1 = p1.y - Math.sin(angle) * ext;
                const x2 = p2.x + Math.cos(angle) * ext;
                const y2 = p2.y + Math.sin(angle) * ext;

                return (
                    <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2}`} strokeWidth="2" stroke="black" />
                );
            })}
        </g>
    );
}
