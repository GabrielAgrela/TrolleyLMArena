// Shared type definitions for the TrolleyLLMArena application

export type Provider = {
    id: string;
    name: string;
    logoUrl: string;
    voiceId: string | null;
};

export type Problem = {
    id: string;
    title: string;
    text: string;
    humanPullVotes: number;
    humanNothingVotes: number;
};

export type Vote = {
    id: string;
    choice: string;
    reasoning: string | null;
    principles: string[];
    assumptions: string | null;
    requestPayload: string | null;
    audioUrl: string | null;
    problem: Problem;
};

export type VoteWithLLM = Vote & {
    llm: {
        name: string;
        provider?: Provider | null;
    };
};

export type LLMWithVotes = {
    id: string;
    name: string;
    modelId: string;
    reasoningEffort: string | null;
    alignmentScore: number | null;
    votes: Vote[];
    provider: Provider | null;
};

// Helper function result types
export type HumanStats = {
    majorityChoice: 'pull' | 'nothing' | 'tie';
    sameChoicePercentage: number;
};

export type LLMStats = {
    consensusHits: number;
    totalActualPct: number;
    totalMaxPct: number;
    totalMinPct: number;
};
