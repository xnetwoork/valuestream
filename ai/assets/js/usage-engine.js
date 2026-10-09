/**
 * VALUESTREAMHUB AI - USAGE ENGINE & FAIR USE GUARDRAIL
 * Manages user credit ledgers, estimates operation costs, enforces fair use policies,
 * and guards against runaway API consumption on €65/year annual passes.
 */

const ValueStreamUsageEngine = {
    DEFAULT_ANNUAL_CREDITS: 120000, // 120,000 internal credits per annual subscription

    /**
     * Get active user usage state
     */
    getUserState() {
        if (typeof localStorage === 'undefined') return { creditsRemaining: 120000, plan: 'ALL-IN-ONE ANNUAL' };
        try {
            const data = localStorage.getItem('vsh_ai_usage_ledger');
            if (data) return JSON.parse(data);
        } catch(e) {}
        
        const initialState = {
            creditsTotal: 120000,
            creditsRemaining: 118450,
            plan: 'ALL-IN-ONE ANNUAL (€65/yr)',
            renewalDate: '2027-10-09',
            history: [
                { id: 'tx-1', operation: 'Unified Chat', model: 'GPT-4o Omniscience', creditsUsed: 15, timestamp: new Date().toISOString() },
                { id: 'tx-2', operation: 'Code Refactor', model: 'Claude 3.5 Sonnet', creditsUsed: 25, timestamp: new Date().toISOString() },
                { id: 'tx-3', operation: 'Visual Generation', model: 'FLUX 1.1 Pro Ultra', creditsUsed: 200, timestamp: new Date().toISOString() }
            ]
        };
        localStorage.setItem('vsh_ai_usage_ledger', JSON.stringify(initialState));
        return initialState;
    },

    /**
     * Calculate cost for an operation
     */
    calculateOperationCost(model, operationType, params = {}) {
        const multiplier = model.internalCreditMultiplier || 1.0;
        let baseCredits = 10;

        if (operationType === 'chat' || operationType === 'text') {
            const estTokens = (params.promptLength || 100) + (params.outputLength || 500);
            baseCredits = Math.max(5, Math.ceil((estTokens / 1000) * 15 * multiplier));
        } else if (operationType === 'image') {
            const numImages = params.count || 1;
            baseCredits = Math.ceil(150 * numImages * multiplier);
        } else if (operationType === 'video') {
            const durationSec = params.duration || 5;
            baseCredits = Math.ceil(500 * durationSec * multiplier);
        } else if (operationType === 'research' || operationType === 'files') {
            baseCredits = Math.ceil(30 * multiplier);
        }

        return baseCredits;
    },

    /**
     * Check if user can run operation
     */
    canExecute(model, operationType, params = {}) {
        const state = this.getUserState();
        const cost = this.calculateOperationCost(model, operationType, params);

        if (state.creditsRemaining < cost) {
            return {
                allowed: false,
                cost,
                creditsRemaining: state.creditsRemaining,
                reason: `Insufficient credits. This operation requires ${cost} credits, but you have ${state.creditsRemaining} remaining. Subject to fair-use policy.`
            };
        }

        return {
            allowed: true,
            cost,
            creditsRemaining: state.creditsRemaining
        };
    },

    /**
     * Deduct credits and record transaction in ledger
     */
    recordExecution(model, operationType, params = {}) {
        const check = this.canExecute(model, operationType, params);
        if (!check.allowed) return check;

        const state = this.getUserState();
        state.creditsRemaining -= check.cost;
        state.history.unshift({
            id: 'tx-' + Date.now(),
            operation: operationType.toUpperCase(),
            model: model.displayName,
            creditsUsed: check.cost,
            timestamp: new Date().toISOString()
        });

        if (state.history.length > 50) state.history.pop();

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('vsh_ai_usage_ledger', JSON.stringify(state));
        }

        return {
            allowed: true,
            cost: check.cost,
            creditsRemaining: state.creditsRemaining
        };
    }
};

if (typeof window !== 'undefined') {
    window.ValueStreamUsageEngine = ValueStreamUsageEngine;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValueStreamUsageEngine;
}
