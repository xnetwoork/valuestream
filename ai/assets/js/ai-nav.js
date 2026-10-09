/**
 * VALUESTREAMHUB AI - UNIFIED NAVIGATION & FOOTER COMPONENT
 * Renders consistent header navbar and footer across all /ai pages.
 */

(function renderVshAiNavAndFooter() {
    document.addEventListener('DOMContentLoaded', () => {
        const headerPlaceholder = document.getElementById('vsh-ai-header');
        const footerPlaceholder = document.getElementById('vsh-ai-footer');

        const currentPath = window.location.pathname.replace(/\/$/, '') || '/ai';

        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = `
            <header class="sticky top-0 z-50 bg-[#040711]/90 backdrop-blur-md border-b border-white/10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <!-- Brand Logo -->
                    <div class="flex items-center gap-3">
                        <a href="/ai" class="flex items-center gap-2 text-decoration-none">
                            <span class="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-cyan-500/20">AI</span>
                            <span class="font-bold text-white text-lg tracking-tight font-display">VALUESTREAM<span class="text-cyan-400 font-normal">.AI</span></span>
                        </a>
                        <span class="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">SUPER-APP</span>
                    </div>

                    <!-- Main Navigation Links -->
                    <nav class="hidden md:flex items-center gap-1">
                        <a href="/ai" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath === '/ai' || currentPath === '/ai/index.html' ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Home</a>
                        <a href="/ai/chat" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/chat') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Chat</a>
                        <a href="/ai/models" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/models') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Models</a>
                        <a href="/ai/images" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/images') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Images</a>
                        <a href="/ai/video" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/video') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Video</a>
                        <a href="/ai/research" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/research') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Research</a>
                        <a href="/ai/code" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/code') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Code</a>
                        <a href="/ai/files" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/files') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Files</a>
                        <a href="/ai/tools" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/tools') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Tools</a>
                        <a href="/ai/compare" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/compare') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Compare</a>
                        <a href="/ai/pricing" class="vsh-nav-item px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider ${currentPath.includes('/pricing') ? 'text-cyan-400 bg-white/5 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}">Pricing</a>
                    </nav>

                    <!-- CTA Buttons -->
                    <div class="flex items-center gap-3">
                        <a href="/" class="hidden lg:inline-flex text-xs font-mono text-slate-400 hover:text-slate-200">
                            ← TV & Entertainment
                        </a>
                        <a href="https://paypal.me/valuestreamhubstore/65EUR" target="_blank" rel="noopener" class="vsh-btn-primary py-1.5 px-4 text-xs">
                            GET ALL AI — €65/YR
                        </a>
                        <button id="vsh-mobile-nav-toggle" class="md:hidden text-slate-300 hover:text-white p-2">
                            <i class="fa-solid fa-bars text-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- Mobile Navigation Drawer -->
                <div id="vsh-mobile-menu" class="hidden md:hidden bg-[#060913] border-b border-white/10 px-4 pt-3 pb-6 space-y-2 font-mono text-xs">
                    <a href="/ai" class="block py-2 text-slate-300 hover:text-cyan-400">01. HOME</a>
                    <a href="/ai/chat" class="block py-2 text-slate-300 hover:text-cyan-400">02. UNIFIED CHAT</a>
                    <a href="/ai/models" class="block py-2 text-slate-300 hover:text-cyan-400">03. MODEL REGISTRY</a>
                    <a href="/ai/images" class="block py-2 text-slate-300 hover:text-cyan-400">04. IMAGE STUDIO</a>
                    <a href="/ai/video" class="block py-2 text-slate-300 hover:text-cyan-400">05. VIDEO AI STUDIO</a>
                    <a href="/ai/research" class="block py-2 text-slate-300 hover:text-cyan-400">06. RESEARCH MODE</a>
                    <a href="/ai/code" class="block py-2 text-slate-300 hover:text-cyan-400">07. CODE WORKSPACE</a>
                    <a href="/ai/files" class="block py-2 text-slate-300 hover:text-cyan-400">08. DOCUMENT INTELLIGENCE</a>
                    <a href="/ai/tools" class="block py-2 text-slate-300 hover:text-cyan-400">09. TOOLS DIRECTORY</a>
                    <a href="/ai/compare" class="block py-2 text-slate-300 hover:text-cyan-400">10. MODEL COMPARE</a>
                    <a href="/ai/pricing" class="block py-2 text-slate-300 hover:text-cyan-400">11. PRICING (€65/YR)</a>
                    <a href="/ai/activate" class="block py-2 text-emerald-400">12. ACTIVATION CODE</a>
                    <a href="/" class="block py-2 text-slate-400 border-t border-white/10 mt-2">← BACK TO ENTERTAINMENT HUB</a>
                </div>
            </header>
            `;

            const mobileToggle = document.getElementById('vsh-mobile-nav-toggle');
            const mobileMenu = document.getElementById('vsh-mobile-menu');
            if (mobileToggle && mobileMenu) {
                mobileToggle.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }
        }

        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = `
            <footer class="bg-[#02040a] border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <span class="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center text-black font-extrabold text-xs">AI</span>
                            <span class="font-bold text-white text-base font-display">VALUESTREAMHUB AI</span>
                        </div>
                        <p class="text-xs text-slate-400 leading-relaxed mb-4">
                            All the AI you need. One workspace. Unified multi-model interface for leading LLMs, image generators, and video synthesis.
                        </p>
                        <span class="inline-block text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                            Commercial Pass: €65 / Year
                        </span>
                    </div>

                    <div>
                        <h4 class="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider mb-3">Workspace Suites</h4>
                        <ul class="space-y-2 text-xs text-slate-400">
                            <li><a href="/ai/chat" class="hover:text-cyan-400">Unified AI Chat</a></li>
                            <li><a href="/ai/models" class="hover:text-cyan-400">Model Registry</a></li>
                            <li><a href="/ai/images" class="hover:text-cyan-400">Image Studio</a></li>
                            <li><a href="/ai/video" class="hover:text-cyan-400">Video AI Studio</a></li>
                            <li><a href="/ai/compare" class="hover:text-cyan-400">Multi-Model Compare</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider mb-3">Intelligence & Tools</h4>
                        <ul class="space-y-2 text-xs text-slate-400">
                            <li><a href="/ai/research" class="hover:text-cyan-400">Research & Search</a></li>
                            <li><a href="/ai/files" class="hover:text-cyan-400">Document Intelligence</a></li>
                            <li><a href="/ai/code" class="hover:text-cyan-400">Code Workspace</a></li>
                            <li><a href="/ai/tools" class="hover:text-cyan-400">18 Specialized AI Tools</a></li>
                            <li><a href="/ai/activate" class="hover:text-emerald-400">Account Activation</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider mb-3">AI Labs & Providers</h4>
                        <ul class="space-y-2 text-xs text-slate-400">
                            <li><a href="/ai/providers/openai" class="hover:text-cyan-400">OpenAI (GPT-4o, o3-mini)</a></li>
                            <li><a href="/ai/providers/anthropic" class="hover:text-cyan-400">Anthropic (Claude 3.5)</a></li>
                            <li><a href="/ai/providers/google" class="hover:text-cyan-400">Google (Gemini 2.5 Pro)</a></li>
                            <li><a href="/ai/providers/xai" class="hover:text-cyan-400">xAI (Grok 3)</a></li>
                            <li><a href="/ai/providers/deepseek" class="hover:text-cyan-400">DeepSeek (R1 & V3)</a></li>
                        </ul>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center sm:flex sm:items-center sm:justify-between">
                    <p class="text-[11px] text-slate-500 mb-4 sm:mb-0">
                        ValueStreamHub AI is an independent multi-model interface. Provider names and trademarks belong to their respective owners. Access subject to fair-use limits.
                    </p>
                    <div class="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono">
                        <a href="/ai/pricing" class="hover:text-slate-300">Fair Use Policy</a>
                        <span>•</span>
                        <a href="/ai/activate" class="hover:text-slate-300">Payment Verification</a>
                        <span>•</span>
                        <a href="/" class="hover:text-slate-300">TV Product</a>
                    </div>
                </div>
            </footer>
            `;
        }
    });
})();
