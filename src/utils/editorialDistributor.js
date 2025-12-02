/**
 * Distributes posts into editorial slots based on their 'displaySection' field.
 * Mimics a newsroom logic: Hero -> Must Read -> Briefing -> Standard.
 */
export const distributeContent = (posts) => {
    if (!posts || posts.length === 0) {
        return { hero: null, mustRead: null, briefing: [], feed: [] };
    }

    // 1. Buckets
    let heroes = [];
    let mustReads = [];
    let briefings = [];
    let standards = [];

    // 2. Sort into buckets
    posts.forEach(post => {
        switch (post.displaySection) {
            case 'HERO': heroes.push(post); break;
            case 'MUST_READ': mustReads.push(post); break;
            case 'QUICK_READ': briefings.push(post); break;
            case 'STANDARD':
            default: standards.push(post); break;
        }
    });

    // 3. Assign Slots with Fallbacks
    // Strategy: Fill high-priority slots first. If specific content missing, steal from 'Standard'.

    // HERO SLOT (1 Post)
    let hero = heroes.length > 0 ? heroes[0] : (standards.length > 0 ? standards.shift() : null);
    // If we have extra heroes, demote them to Must Read
    if (heroes.length > 1) mustReads = [...heroes.slice(1), ...mustReads];

    // SECONDARY LEAD / MUST READ (1 Post for Desktop Anchor)
    let mustRead = mustReads.length > 0 ? mustReads[0] : (standards.length > 0 ? standards.shift() : null);
    // If extra must reads, demote to feed or briefing
    let extraMustReads = mustReads.length > 1 ? mustReads.slice(1) : [];

    // BRIEFING STRIP (3 Posts)
    // We want exactly 3 for the strip if possible.
    let briefing = [];
    while (briefing.length < 3 && briefings.length > 0) briefing.push(briefings.shift());
    // If not enough briefings, steal from Standard (optional, but keeps layout full)
    while (briefing.length < 3 && standards.length > 0) briefing.push(standards.shift());

    // FEED (The rest)
    // Combine remaining standards + overflow from other sections
    let feed = [
        ...extraMustReads,
        ...briefings, // any remaining briefings
        ...standards
    ];

    // Ensure strictly time-sorted feed
    feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
        hero,
        mustRead,   // The "Secondary Hero" row
        briefing,   // The 3-col text strip
        feed        // The main grid
    };
};