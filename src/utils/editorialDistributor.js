/**
 * AI-CONTEXT:
 * Purpose:
 * - Algorithmic Layout Engine. Distributes posts into editorial slots based on a mathematical decay function.
 * - Decays older 'Hero' or 'Must Read' stories gracefully into standard feeds to prevent content stagnation.
 * 
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED: Implemented Exponential Decay Algorithm (weight = baseWeight * e^(-λ * hoursSincePublish)).
 *   Replaced static bucket sorting with dynamic, time-aware prioritization to support the new Cloudflare Radar UI.
 * 
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

export const distributeContent = (posts) => {
    if (!posts || posts.length === 0) {
        return { hero: null, mustRead: null, briefing: [], feed: [] };
    }

    const now = new Date().getTime();

    // 1. Calculate dynamic weights based on exponential decay
    const weightedPosts = posts.map(post => {
        const publishTime = new Date(post.updatedAt || post.createdAt).getTime();
        const hoursSincePublish = Math.max(0, (now - publishTime) / (1000 * 60 * 60));

        let baseWeight = 40;
        let lambda = 0.01; // Decay constant

        switch (post.displaySection) {
            case 'HERO':
                baseWeight = 100;
                lambda = 0.02; // Slow decay (stays relevant longer)
                break;
            case 'MUST_READ':
                baseWeight = 80;
                lambda = 0.05; // Medium decay
                break;
            case 'QUICK_READ':
                baseWeight = 60;
                lambda = 0.08; // Fast decay (news briefs expire quickly)
                break;
            case 'STANDARD':
            default:
                baseWeight = 40;
                lambda = 0.01; // Baseline standard feed
                break;
        }

        // Mathematical Decay Formula: weight = baseWeight * e^(-λt)
        const currentWeight = baseWeight * Math.exp(-lambda * hoursSincePublish);

        return { ...post, currentWeight };
    });

    // 2. Sort all posts globally by their current mathematical weight, descending
    weightedPosts.sort((a, b) => b.currentWeight - a.currentWeight);

    let hero = null;
    let mustRead = null;
    let briefing = [];
    let feed = [];

    // 3. Distribute dynamically into the layout zones
    weightedPosts.forEach((post, index) => {
        if (index === 0) {
            hero = post;
        } else if (index === 1) {
            mustRead = post;
        } else if (index >= 2 && index <= 4) {
            briefing.push(post);
        } else {
            feed.push(post);
        }
    });

    // 4. Ensure the standard feed is strictly chronological (latest first), 
    // even though it was populated based on decayed weights.
    feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
        hero,
        mustRead,
        briefing,
        feed
    };
};