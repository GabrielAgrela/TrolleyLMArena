import { describe, it, expect } from 'vitest';
import { calculateLLMStats, calculateAlignmentRating } from '../leaderboard/LLMRow';

/**
 * Tests for LeaderboardTable alignment calculation functions
 * These are the same tests as alignmentScore.test.ts but using the exported functions
 */

type Vote = {
    id: string;
    choice: string;
    reasoning: string | null;
    principles: string[];
    assumptions: string | null;
    requestPayload: string | null;
    audioUrl: string | null;
    problem: {
        id: string;
        title: string;
        text: string;
        humanPullVotes: number;
        humanNothingVotes: number;
    };
};

describe('LeaderboardTable - calculateLLMStats', () => {
    it('should return zeros for empty votes', () => {
        const stats = calculateLLMStats([]);
        expect(stats.consensusHits).toBe(0);
        expect(stats.totalActualPct).toBe(0);
        expect(stats.totalMaxPct).toBe(0);
        expect(stats.totalMinPct).toBe(0);
    });

    it('should calculate consensus hits correctly', () => {
        const votes: Vote[] = [
            createVote('pull', 80, 20), // majority is pull, AI chose pull = hit
            createVote('nothing', 30, 70), // majority is nothing, AI chose nothing = hit
        ];

        const stats = calculateLLMStats(votes);
        expect(stats.consensusHits).toBe(2);
    });

    it('should track minority choices correctly', () => {
        const votes: Vote[] = [
            createVote('nothing', 80, 20), // majority is pull, AI chose nothing = miss
            createVote('pull', 30, 70), // majority is nothing, AI chose pull = miss
        ];

        const stats = calculateLLMStats(votes);
        expect(stats.consensusHits).toBe(0);
    });

    it('should handle problems with no human votes', () => {
        const votes: Vote[] = [
            createVote('pull', 0, 0),
        ];

        const stats = calculateLLMStats(votes);
        // Should skip problems with no votes
        expect(stats.totalActualPct).toBe(0);
    });
});

describe('LeaderboardTable - calculateAlignmentRating', () => {
    it('should return 100% when LLM always chooses majority option', () => {
        const votes: Vote[] = [
            createVote('pull', 80, 20),
            createVote('nothing', 30, 70),
        ];

        const stats = calculateLLMStats(votes);
        const rating = calculateAlignmentRating(stats, votes.length);

        expect(rating).toBe(100);
    });

    it('should return 0% when LLM always chooses minority option', () => {
        const votes: Vote[] = [
            createVote('nothing', 80, 20),
            createVote('pull', 30, 70),
        ];

        const stats = calculateLLMStats(votes);
        const rating = calculateAlignmentRating(stats, votes.length);

        expect(rating).toBe(0);
    });

    it('should return ~50% for mixed choices', () => {
        const votes: Vote[] = [
            createVote('pull', 80, 20), // majority
            createVote('pull', 30, 70), // minority
        ];

        const stats = calculateLLMStats(votes);
        const rating = calculateAlignmentRating(stats, votes.length);

        expect(rating).toBeGreaterThanOrEqual(40);
        expect(rating).toBeLessThanOrEqual(60);
    });

    it('should return 100% for tie situations (range = 0)', () => {
        const votes: Vote[] = [
            createVote('pull', 50, 50),
        ];

        const stats = calculateLLMStats(votes);
        const rating = calculateAlignmentRating(stats, votes.length);

        expect(rating).toBe(100);
    });

    it('should return 0 for no votes', () => {
        const stats = calculateLLMStats([]);
        const rating = calculateAlignmentRating(stats, 0);

        expect(rating).toBe(0);
    });
});

// Helper function to create a vote object
function createVote(choice: string, humanPull: number, humanNothing: number): Vote {
    return {
        id: `vote-${Math.random()}`,
        choice,
        reasoning: 'Test reasoning',
        principles: [],
        assumptions: null,
        requestPayload: null,
        audioUrl: null,
        problem: {
            id: `problem-${Math.random()}`,
            title: 'Test Problem',
            text: 'Test problem text',
            humanPullVotes: humanPull,
            humanNothingVotes: humanNothing,
        }
    };
}
