interface ScheduleConfig {
    maxEvents: number;
    midMissionDelay: number;  // secondes
    lateMissionDelay: number; // secondes
}

interface ScheduledEvent {
    scheduledAt: number;  // secondes depuis gameStart
    type: 'START' | 'MID' | 'LATE';
}

interface TimeRange {
    start: number;
    end: number;
}

// Soustrait les zones d'exclusion d'une plage de temps
function subtractExclusions(ranges: TimeRange[], exclusions: TimeRange[]): TimeRange[] {
    let result = [...ranges];

    for (const excl of exclusions) {
        const newResult: TimeRange[] = [];
        for (const range of result) {
            // Pas de chevauchement
            if (range.end <= excl.start || range.start >= excl.end) {
                newResult.push(range);
                continue;
            }
            // Partie avant l'exclusion
            if (range.start < excl.start) {
                newResult.push({ start: range.start, end: excl.start });
            }
            // Partie après l'exclusion
            if (range.end > excl.end) {
                newResult.push({ start: excl.end, end: range.end });
            }
        }
        result = newResult;
    }

    return result;
}

// Calcule le temps total disponible dans des plages
function totalAvailable(ranges: TimeRange[]): number {
    return ranges.reduce((sum, r) => sum + Math.max(0, r.end - r.start), 0);
}

// Tire un temps aléatoire dans les plages valides
function randomTimeInRanges(ranges: TimeRange[]): number | null {
    const total = totalAvailable(ranges);
    if (total <= 0) return null;

    let target = Math.random() * total;
    for (const range of ranges) {
        const size = range.end - range.start;
        if (target < size) {
            return Math.floor(range.start + target);
        }
        target -= size;
    }
    return null;
}

// Place un événement dans une tranche, en respectant les exclusions
function placeEvent(
    sliceRange: TimeRange,
    baseExclusions: TimeRange[],
    placedExclusions: TimeRange[],
): number | null {
    const allExcl = [...baseExclusions, ...placedExclusions];
    const ranges = subtractExclusions([sliceRange], allExcl);
    return randomTimeInRanges(ranges);
}

export function computeEventSchedule(config: ScheduleConfig): ScheduledEvent[] {
    const { maxEvents, midMissionDelay, lateMissionDelay } = config;

    if (maxEvents <= 0) return [];

    // Limite absolue : rien après 20 minutes
    const MAX_TIME = 1200;

    // 3 tranches définies par les timers mid/late
    // START : [30, midMissionDelay)  — avant le 1er timer
    // MID   : [midMissionDelay, lateMissionDelay) — entre les 2 timers
    // LATE  : [lateMissionDelay, 1200] — après le 2ème timer, max 20min
    const slices: { type: 'START' | 'MID' | 'LATE'; range: TimeRange }[] = [
        { type: 'START', range: { start: 30, end: midMissionDelay } },
        { type: 'MID', range: { start: midMissionDelay, end: lateMissionDelay } },
        { type: 'LATE', range: { start: lateMissionDelay, end: MAX_TIME } },
    ];

    // Zones d'exclusion de base : ±30s autour des timers mid/late
    const baseExclusions: TimeRange[] = [
        { start: midMissionDelay - 30, end: midMissionDelay + 30 },
        { start: lateMissionDelay - 30, end: lateMissionDelay + 30 },
    ];

    const events: ScheduledEvent[] = [];
    const placedExclusions: TimeRange[] = [];

    // --- Règle : à partir de 3 événements, 1 obligatoire dans chaque tranche ---
    if (maxEvents >= 3) {
        // Placer 1 événement obligatoire par tranche (START, MID, LATE)
        for (const slice of slices) {
            const time = placeEvent(slice.range, baseExclusions, placedExclusions);
            if (time === null) continue;

            events.push({ scheduledAt: time, type: slice.type });
            placedExclusions.push({ start: time - 60, end: time + 60 });
        }

        // Placer les événements restants librement
        for (let i = events.length; i < maxEvents; i++) {
            const allExcl = [...baseExclusions, ...placedExclusions];

            const candidates: { type: 'START' | 'MID' | 'LATE'; ranges: TimeRange[]; available: number }[] = [];
            for (const slice of slices) {
                const ranges = subtractExclusions([slice.range], allExcl);
                const avail = totalAvailable(ranges);
                if (avail > 0) {
                    candidates.push({ type: slice.type, ranges, available: avail });
                }
            }

            if (candidates.length === 0) break;

            // Répartition équitable
            const countByType = { START: 0, MID: 0, LATE: 0 };
            for (const e of events) countByType[e.type]++;

            candidates.sort((a, b) => countByType[a.type] - countByType[b.type]);
            const minCount = countByType[candidates[0].type];
            const bestCandidates = candidates.filter(c => countByType[c.type] === minCount);

            const chosen = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
            const time = randomTimeInRanges(chosen.ranges);
            if (time === null) break;

            events.push({ scheduledAt: time, type: chosen.type });
            placedExclusions.push({ start: time - 60, end: time + 60 });
        }
    } else {
        // 1 ou 2 événements : placement libre avec répartition équitable
        for (let i = 0; i < maxEvents; i++) {
            const allExcl = [...baseExclusions, ...placedExclusions];

            const candidates: { type: 'START' | 'MID' | 'LATE'; ranges: TimeRange[]; available: number }[] = [];
            for (const slice of slices) {
                const ranges = subtractExclusions([slice.range], allExcl);
                const avail = totalAvailable(ranges);
                if (avail > 0) {
                    candidates.push({ type: slice.type, ranges, available: avail });
                }
            }

            if (candidates.length === 0) break;

            // Répartition équitable
            const countByType = { START: 0, MID: 0, LATE: 0 };
            for (const e of events) countByType[e.type]++;

            candidates.sort((a, b) => countByType[a.type] - countByType[b.type]);
            const minCount = countByType[candidates[0].type];
            const bestCandidates = candidates.filter(c => countByType[c.type] === minCount);

            const chosen = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
            const time = randomTimeInRanges(chosen.ranges);
            if (time === null) break;

            events.push({ scheduledAt: time, type: chosen.type });
            placedExclusions.push({ start: time - 60, end: time + 60 });
        }
    }

    // Trier par scheduledAt
    events.sort((a, b) => a.scheduledAt - b.scheduledAt);

    return events;
}
