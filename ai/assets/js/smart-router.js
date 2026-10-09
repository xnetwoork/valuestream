/**
 * VALUESTREAMHUB AI - SMART ROUTER ENGINE
 * Automatically evaluates user intent, modality, budget, and speed targets
 * to select the optimal LIVE model from MODEL_REGISTRY.
 */

const ValueStreamSmartRouter = {
    /**
     * Route a request based on user mode or auto-analysis
     * @param {string} mode - AUTO | FAST | BEST | REASONING | CODE | RESEARCH | CREATIVE | LOW COST
     * @param {object} context - { prompt, hasVision, hasFiles, contextLength, modality }
     * @returns {object} Selected model from MODEL_REGISTRY and routing metadata
     */
    route(mode = 'AUTO', context = {}) {
        const liveModels = MODEL_REGISTRY.filter(m => m.availability === 'LIVE' && m.enabled);
        if (liveModels.length === 0) {
            throw new Error('No LIVE models available in registry.');
        }

        const promptText = (context.prompt || '').toLowerCase();
        const hasVision = Boolean(context.hasVision);
        const hasFiles = Boolean(context.hasFiles);
        const contextLength = context.contextLength || promptText.length;
        const requestedModality = context.modality || 'text';

        let selected = null;
        let reasoningReason = '';

        // If modality is Image or Video, route to specialized engine
        if (requestedModality === 'image') {
            selected = liveModels.find(m => m.id === 'flux-1-1-pro') || liveModels.find(m => m.supportsImages);
            reasoningReason = 'Optimized for high-fidelity visual generation.';
            return { model: selected, mode, reason: reasoningReason };
        }
        if (requestedModality === 'video') {
            selected = liveModels.find(m => m.id === 'kling-1-5') || liveModels.find(m => m.supportsVideo);
            reasoningReason = 'Optimized for 1080p camera-controlled video synthesis.';
            return { model: selected, mode, reason: reasoningReason };
        }

        switch (mode.toUpperCase()) {
            case 'FAST':
                selected = liveModels.find(m => m.id === 'gpt-4o-mini') ||
                           liveModels.find(m => m.id === 'gemini-2-5-flash') ||
                           liveModels.find(m => m.latencyTier === 'Ultra Fast');
                reasoningReason = 'Selected for sub-second latency and high throughput.';
                break;

            case 'BEST':
            case 'REASONING':
                if (promptText.includes('code') || promptText.includes('function') || promptText.includes('script') || promptText.includes('bug')) {
                    selected = liveModels.find(m => m.id === 'o3-mini') || liveModels.find(m => m.id === 'claude-3-5-sonnet');
                    reasoningReason = 'Selected for maximum coding and logical proofing accuracy.';
                } else if (promptText.includes('math') || promptText.includes('proof') || promptText.includes('logic')) {
                    selected = liveModels.find(m => m.id === 'deepseek-r1') || liveModels.find(m => m.id === 'o3-mini');
                    reasoningReason = 'Selected for deep Chain-of-Thought mathematical proofing.';
                } else {
                    selected = liveModels.find(m => m.id === 'claude-3-5-sonnet') || liveModels.find(m => m.id === 'gpt-4o');
                    reasoningReason = 'Selected for top-tier intelligence and natural synthesis.';
                }
                break;

            case 'CODE':
                if (promptText.includes('python') || promptText.includes('rust') || promptText.includes('typescript')) {
                    selected = liveModels.find(m => m.id === 'qwen-2-5-coder-32b') || liveModels.find(m => m.id === 'claude-3-5-sonnet');
                } else {
                    selected = liveModels.find(m => m.id === 'claude-3-5-sonnet') || liveModels.find(m => m.id === 'codestral-2501');
                }
                reasoningReason = 'Selected specialized software engineering engine.';
                break;

            case 'RESEARCH':
                if (promptText.includes('citation') || promptText.includes('source') || promptText.includes('file')) {
                    selected = liveModels.find(m => m.id === 'command-r-plus') || liveModels.find(m => m.id === 'gemini-2-5-pro');
                    reasoningReason = 'Selected for verifiable citation footnotes and document QA.';
                } else {
                    selected = liveModels.find(m => m.id === 'grok-3') || liveModels.find(m => m.id === 'gemini-2-5-pro');
                    reasoningReason = 'Selected for real-time web search and live knowledge lookup.';
                }
                break;

            case 'CREATIVE':
                selected = liveModels.find(m => m.id === 'claude-3-5-sonnet') || liveModels.find(m => m.id === 'gpt-4o');
                reasoningReason = 'Selected for expressive prose, tone mastery, and narrative depth.';
                break;

            case 'LOW COST':
                selected = liveModels.find(m => m.id === 'deepseek-v3') || liveModels.find(m => m.id === 'gpt-4o-mini');
                reasoningReason = 'Selected for lowest cost-per-token efficiency.';
                break;

            case 'AUTO':
            default:
                // Auto-detect intent
                if (hasVision) {
                    selected = liveModels.find(m => m.id === 'gpt-4o') || liveModels.find(m => m.supportsVision);
                    reasoningReason = 'Auto-selected: Vision processing required.';
                } else if (contextLength > 200000) {
                    selected = liveModels.find(m => m.id === 'gemini-2-5-pro');
                    reasoningReason = 'Auto-selected: Ultra-large context window (up to 2M tokens).';
                } else if (/(\bcode\b|\bdebug\b|\bfunction\b|\brefactor\b|\bscript\b|\bsql\b)/i.test(promptText)) {
                    selected = liveModels.find(m => m.id === 'claude-3-5-sonnet') || liveModels.find(m => m.id === 'o3-mini');
                    reasoningReason = 'Auto-detected software engineering task.';
                } else if (/(\bresearch\b|\bcite\b|\blatest news\b|\bsearch\b|\bevent\b)/i.test(promptText)) {
                    selected = liveModels.find(m => m.id === 'grok-3') || liveModels.find(m => m.id === 'command-r-plus');
                    reasoningReason = 'Auto-detected research & real-time search request.';
                } else if (/(\bwhy\b|\bexplain step by step\b|\bmath\b|\bprove\b|\bcalculate\b)/i.test(promptText)) {
                    selected = liveModels.find(m => m.id === 'o3-mini') || liveModels.find(m => m.id === 'deepseek-r1');
                    reasoningReason = 'Auto-detected deep logic & reasoning problem.';
                } else {
                    selected = liveModels.find(m => m.id === 'gpt-4o') || liveModels.find(m => m.id === 'claude-3-5-sonnet');
                    reasoningReason = 'Auto-selected premier general intelligence model.';
                }
                break;
        }

        if (!selected) {
            selected = liveModels[0];
            reasoningReason = 'Default fallback model selected.';
        }

        return {
            model: selected,
            mode: mode,
            reason: reasoningReason,
            displayText: `Auto-selected: ${selected.displayName}`
        };
    }
};

if (typeof window !== 'undefined') {
    window.ValueStreamSmartRouter = ValueStreamSmartRouter;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValueStreamSmartRouter;
}
