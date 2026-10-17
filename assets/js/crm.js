/**
 * VALUESTREAMHUB.STORE — SOVEREIGN CLIENT-SIDE CRM & ATTRIBUTION ENGINE (v2.0)
 * Architecture: Local-First, Zero-External-Dependency, Privacy-Preserving
 * Tracks UTMs, Referrers, Device Telemetry, Generates Sovereign IDs:
 *   - Trial ID: VS-T-YYMMDD-XXXX
 *   - Order ID: VS-YYMMDD-XXXX
 * Local Persistence: localStorage (vsh_crm_trials, vsh_crm_orders, vsh_attribution)
 */

(function () {
    'use strict';

    const CRM_STORAGE_KEY_ATTRIBUTION = 'vsh_attribution';
    const CRM_STORAGE_KEY_TRIALS = 'vsh_crm_trials';
    const CRM_STORAGE_KEY_ORDERS = 'vsh_crm_orders';
    const CRM_STORAGE_KEY_EVENTS = 'vsh_crm_events';
    const WHATSAPP_NUMBER = '212638070903';

    // 1. Capture & Persist Attribution (First-touch & Last-touch)
    function captureAttribution() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const utmSource = urlParams.get('utm_source') || '';
            const utmMedium = urlParams.get('utm_medium') || '';
            const utmCampaign = urlParams.get('utm_campaign') || '';
            const utmTerm = urlParams.get('utm_term') || '';
            const utmContent = urlParams.get('utm_content') || '';
            const gclid = urlParams.get('gclid') || '';
            const fbclid = urlParams.get('fbclid') || '';
            const ref = document.referrer || 'direct';

            const existing = JSON.parse(localStorage.getItem(CRM_STORAGE_KEY_ATTRIBUTION) || '{}');
            const now = new Date().toISOString();

            const currentTouch = {
                source: utmSource || (ref.includes('google') ? 'google' : (ref.includes('bing') ? 'bing' : (ref.includes('wa.me') ? 'whatsapp' : (ref === 'direct' ? 'direct' : 'referral')))),
                medium: utmMedium || (gclid ? 'cpc' : (fbclid ? 'social' : 'organic')),
                campaign: utmCampaign || 'standard',
                term: utmTerm,
                content: utmContent,
                referrer: ref,
                landing_page: window.location.pathname + window.location.search,
                timestamp: now,
                user_agent: navigator.userAgent
            };

            if (!existing.first_touch) {
                existing.first_touch = currentTouch;
            }
            existing.last_touch = currentTouch;
            existing.visits_count = (existing.visits_count || 0) + 1;

            localStorage.setItem(CRM_STORAGE_KEY_ATTRIBUTION, JSON.stringify(existing));
            return existing;
        } catch (e) {
            console.warn('[VSH CRM] Attribution error:', e);
            return {};
        }
    }

    // 2. Sovereign ID Generators
    function getFormattedDateStamp() {
        const d = new Date();
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return yy + mm + dd;
    }

    function generateRandomHex(len) {
        const chars = '0123456789ABCDEF';
        let res = '';
        for (let i = 0; i < len; i++) {
            res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res;
    }

    function generateTrialId() {
        return 'VS-T-' + getFormattedDateStamp() + '-' + generateRandomHex(4);
    }

    function generateOrderId() {
        return 'VS-' + getFormattedDateStamp() + '-' + generateRandomHex(4);
    }

    // 3. Storage Helpers
    function getStoredList(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveToList(key, item) {
        try {
            const list = getStoredList(key);
            list.unshift(item); // prepend latest
            // cap at 500 records
            if (list.length > 500) list.pop();
            localStorage.setItem(key, JSON.stringify(list));
            return true;
        } catch (e) {
            console.warn('[VSH CRM] Save error:', e);
            return false;
        }
    }

    // 4. CRM Event Recording API
    window.VSH_CRM = {
        getAttribution: function () {
            try {
                return JSON.parse(localStorage.getItem(CRM_STORAGE_KEY_ATTRIBUTION) || '{}');
            } catch (e) {
                return {};
            }
        },

        generateTrialId: generateTrialId,
        generateOrderId: generateOrderId,

        recordTrialRequest: function (details) {
            const attr = this.getAttribution();
            const trialRecord = {
                id: details.trial_id || generateTrialId(),
                type: '12H_FREE_TEST',
                product: details.product || 'Internet TV/VOD',
                customer_name: details.name || 'Anonymous Prospect',
                whatsapp: details.whatsapp || '',
                device: details.device || 'Smart TV / Firestick',
                app: details.app || 'TiviMate / IBO / Smarters',
                status: 'NEW_REQUEST',
                source: (attr.last_touch && attr.last_touch.source) || 'direct',
                campaign: (attr.last_touch && attr.last_touch.campaign) || 'standard',
                created_at: new Date().toISOString(),
                page_url: window.location.href
            };

            saveToList(CRM_STORAGE_KEY_TRIALS, trialRecord);
            window.dispatchEvent(new CustomEvent('vsh:trial_recorded', { detail: trialRecord }));
            return trialRecord;
        },

        recordOrderIntent: function (details) {
            const attr = this.getAttribution();
            const orderRecord = {
                id: details.order_id || generateOrderId(),
                plan_code: details.plan_code || 'order1y',
                plan_title: details.plan_title || '12 Months All-in-1 Pass',
                amount_eur: details.amount_eur || 64,
                currency: 'EUR',
                customer_name: details.name || 'Anonymous Buyer',
                whatsapp: details.whatsapp || '',
                device: details.device || 'Standard Setup',
                first_time_iptv: details.first_time_iptv !== undefined ? details.first_time_iptv : true,
                payment_method: 'PAYPAL_DIRECT',
                paypal_url: details.paypal_url || 'https://paypal.me/valuestreamhubstore/64EUR',
                status: 'PENDING_PAYPAL',
                source: (attr.last_touch && attr.last_touch.source) || 'direct',
                campaign: (attr.last_touch && attr.last_touch.campaign) || 'standard',
                created_at: new Date().toISOString(),
                page_url: window.location.href
            };

            saveToList(CRM_STORAGE_KEY_ORDERS, orderRecord);
            window.dispatchEvent(new CustomEvent('vsh:order_recorded', { detail: orderRecord }));
            return orderRecord;
        },

        getAllTrials: function () {
            return getStoredList(CRM_STORAGE_KEY_TRIALS);
        },

        getAllOrders: function () {
            return getStoredList(CRM_STORAGE_KEY_ORDERS);
        },

        updateTrialStatus: function (trialId, newStatus) {
            const list = getStoredList(CRM_STORAGE_KEY_TRIALS);
            const item = list.find(t => t.id === trialId);
            if (item) {
                item.status = newStatus;
                item.updated_at = new Date().toISOString();
                localStorage.setItem(CRM_STORAGE_KEY_TRIALS, JSON.stringify(list));
                return true;
            }
            return false;
        },

        updateOrderStatus: function (orderId, newStatus) {
            const list = getStoredList(CRM_STORAGE_KEY_ORDERS);
            const item = list.find(o => o.id === orderId);
            if (item) {
                item.status = newStatus;
                item.updated_at = new Date().toISOString();
                localStorage.setItem(CRM_STORAGE_KEY_ORDERS, JSON.stringify(list));
                return true;
            }
            return false;
        },

        exportCSV: function (type) {
            const list = type === 'trials' ? this.getAllTrials() : this.getAllOrders();
            if (!list.length) return '';
            const headers = Object.keys(list[0]);
            const rows = list.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','));
            return [headers.join(','), ...rows].join('\n');
        },

        exportJSON: function () {
            return JSON.stringify({
                attribution: this.getAttribution(),
                trials: this.getAllTrials(),
                orders: this.getAllOrders(),
                exported_at: new Date().toISOString()
            }, null, 2);
        }
    };

    // 5. Initialize Attribution on Page Load
    captureAttribution();

    // 6. Auto-Instrument WhatsApp Links with Sovereign CRM IDs
    document.addEventListener('DOMContentLoaded', function () {
        // Intercept WhatsApp Trial clicks to attach unique Trial ID
        document.querySelectorAll('a[data-wa-type="trial"]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                const trialId = generateTrialId();
                const attr = window.VSH_CRM.getAttribution();
                const sourceTag = (attr.last_touch && attr.last_touch.source) || 'web';

                window.VSH_CRM.recordTrialRequest({
                    trial_id: trialId,
                    product: 'Internet TV/VOD',
                    device: 'Website CTA Click'
                });

                // Format friendly WhatsApp prefill message
                const msg = [
                    `👋 *HELLO VALUE STREAM HUB — 12-HOUR FREE TEST REQUEST*`,
                    `• *Test Ticket ID:* ${trialId}`,
                    `• *Offer:* 12-Hour Full Entertainment Test (4K/FHD)`,
                    `• *Source:* ${sourceTag}`,
                    ``,
                    `Please send me my 12-hour instant test access code and setup guide for my Smart TV / Firestick / Phone.`
                ].join('\n');

                const targetUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
                el.href = targetUrl;
            });
        });

        // Intercept AI WhatsApp links if present
        document.querySelectorAll('a[data-wa-type="ai_trial"], a[data-wa-type="ai_order"]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                const orderId = generateOrderId();
                window.VSH_CRM.recordOrderIntent({
                    order_id: orderId,
                    plan_code: 'ai_1year',
                    plan_title: 'AI All-in-One Frontier Pass (1 Year)',
                    amount_eur: 65,
                    payment_method: 'PAYPAL_DIRECT',
                    paypal_url: 'https://paypal.me/valuestreamhubstore/65EUR'
                });

                const msg = [
                    `🤖 *HELLO VALUE STREAM HUB — AI ALL-IN-ONE PASS (€65/YEAR)*`,
                    `• *Order Reference:* ${orderId}`,
                    `• *Product:* AI All-in-One 1-Year Pass (€65/yr)`,
                    `• *PayPal Checkout:* https://paypal.me/valuestreamhubstore/65EUR`,
                    ``,
                    `I am interested in activating my 1-Year Frontier AI Workspace. Please assist with onboarding!`
                ].join('\n');

                el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
            });
        });
    });

})();
