function wahlomatApp() {
    return {
        step: 0,
        totalTheses: 0,
        theses: [],
        parties: [],
        answers: {},
        results: [],
        topMatch: null,
        selectedPartyId: null,
        modalOpen: false,
        detailFilter: 'all',
        userCoords: { x: 0, y: 0 },
        compassParties: [],
        compassDisplayScale: 25,
        shareTextStatus: '',
        topicWeights: {},
        topics: [],
        isSharedView: false,
        _modalTrigger: null,

        init() {
            if (window.WAHLOMAT_DATA) {
                this.theses = window.WAHLOMAT_DATA.theses;
                this.parties = window.WAHLOMAT_DATA.parties;
                this.totalTheses = this.theses.length;
                const seen = new Set();
                this.theses.forEach(t => { if (!seen.has(t.topic)) { seen.add(t.topic); this.topics.push(t.topic); } });
                this.topics.forEach(t => { this.topicWeights[t] = 1; });
            } else {
                console.error("Daten nicht geladen!");
            }

            this.$watch('answers', val => {
                if (!this.isSharedView) {
                    localStorage.setItem('wahlomat_answers', JSON.stringify(val));
                }
            });

            // Check URL params for shared results
            const params = new URLSearchParams(window.location.search);
            const r = params.get('r');
            const w = params.get('w');
            if (r && this.decodeResults(r, w)) {
                this.isSharedView = true;
                this.calculateResults();
                this.step = 99;
                window.history.replaceState({}, '', window.location.pathname);
                return;
            }

            // Load from LocalStorage
            const saved = localStorage.getItem('wahlomat_answers');
            if (saved) {
                try {
                    this.answers = JSON.parse(saved);
                } catch(e) { console.error("Error loading saves", e); }
            }
        },

        get currentThesis() {
            if (this.step < 1 || this.step > this.theses.length) return null;
            return this.theses[this.step - 1];
        },

        start() {
            this.step = 1;
            window.scrollTo(0,0);
            if (Object.keys(this.answers).length >= this.totalTheses) {
                this.step = 98;
            }
        },

        answer(value) {
            if (!this.currentThesis) return;
            this.answers[this.currentThesis.id] = value;
            this.nextStep();
        },

        skip() {
            if (!this.currentThesis) return;
            delete this.answers[this.currentThesis.id];
            this.nextStep();
        },

        nextStep() {
            if (this.step < this.totalTheses) {
                this.step++;
            } else {
                this.step = 98;
                window.scrollTo(0,0);
            }
        },

        showResults() {
            try {
                this.calculateResults();
                this.step = 99;
                window.scrollTo(0,0);
            } catch (e) {
                console.error("Calculation error:", e);
                alert("Fehler bei der Berechnung. Bitte neu laden.");
            }
        },

        calculateResults() {
            try {
                const totalAnswered = Object.keys(this.answers).length;

                this.results = this.parties.map(party => {
                    let points = 0;
                    let maxPoints = 0;

                    for (const [thesisId, userPos] of Object.entries(this.answers)) {
                        const thesis = this.theses.find(t => t.id == thesisId);
                        const topicWeight = thesis ? (this.topicWeights[thesis.topic] || 1) : 1;

                        if (party.positions && party.positions[thesisId]) {
                            let partyPosData = party.positions[thesisId];
                            let partyPos = partyPosData.val !== undefined ? partyPosData.val : partyPosData.position;
                            let diff = Math.abs(userPos - partyPos);
                            points += (2 - diff) * topicWeight;
                        } else {
                            points += 1 * topicWeight;
                        }
                        maxPoints += 2 * topicWeight;
                    }

                    let percent = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
                    return {
                        ...party,
                        score: points,
                        matchPercentage: percent
                    };
                }).sort((a, b) => b.matchPercentage - a.matchPercentage);

                this.topMatch = this.results[0];

                // Calculate Compass Coordinates
                this.calculateCompass();

            } catch (e) {
                console.error("Inner calculation error", e);
                throw e;
            }
        },

        calculateCompass() {
            // 0. Compute total axis weights across ALL theses (shared denominator)
            let totalWeightX = 0, totalWeightY = 0;
            this.theses.forEach(thesis => {
                if (thesis.axes) {
                    const tw = this.topicWeights[thesis.topic] || 1;
                    if (thesis.axes.x !== 0) totalWeightX += Math.abs(thesis.axes.x) * tw;
                    if (thesis.axes.y !== 0) totalWeightY += Math.abs(thesis.axes.y) * tw;
                }
            });

            // 1. Calculate User Coordinates
            let userX = 0, userY = 0;

            for (const [thesisId, userPos] of Object.entries(this.answers)) {
                const thesis = this.theses.find(t => t.id == thesisId);
                if (thesis && thesis.axes) {
                    const tw = this.topicWeights[thesis.topic] || 1;
                    if (thesis.axes.x !== 0) userX += userPos * thesis.axes.x * tw;
                    if (thesis.axes.y !== 0) userY += userPos * thesis.axes.y * tw;
                }
            }

            // Normalize by total weight and apply power compression
            const compress = v => Math.sign(v) * Math.pow(Math.abs(v), 0.7);
            this.userCoords = {
                x: compress(totalWeightX > 0 ? userX / totalWeightX : 0),
                y: compress(totalWeightY > 0 ? userY / totalWeightY : 0)
            };

            // 2. Calculate Party Coordinates (same denominator for fair comparison)
            this.compassParties = this.parties.map(party => {
                let pX = 0, pY = 0;

                this.theses.forEach(thesis => {
                    if (party.positions && party.positions[thesis.id] && thesis.axes) {
                        let partyPosData = party.positions[thesis.id];
                        let pos = partyPosData.val !== undefined ? partyPosData.val : partyPosData.position;
                        const tw = this.topicWeights[thesis.topic] || 1;

                        if (thesis.axes.x !== 0) pX += pos * thesis.axes.x * tw;
                        if (thesis.axes.y !== 0) pY += pos * thesis.axes.y * tw;
                    }
                });

                return {
                    id: party.id,
                    name: party.name,
                    x: compress(totalWeightX > 0 ? pX / totalWeightX : 0),
                    y: compress(totalWeightY > 0 ? pY / totalWeightY : 0)
                };
            });

            // 3. Collision avoidance: push overlapping party dots apart
            const minDist = 0.12;
            for (let iter = 0; iter < 8; iter++) {
                for (let i = 0; i < this.compassParties.length; i++) {
                    for (let j = i + 1; j < this.compassParties.length; j++) {
                        const a = this.compassParties[i];
                        const b = this.compassParties[j];
                        const dx = b.x - a.x;
                        const dy = b.y - a.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) {
                            const angle = dist === 0 ? (i * 0.7 + j * 1.3) : Math.atan2(dy, dx);
                            const push = (minDist - dist) / 2;
                            a.x -= Math.cos(angle) * push;
                            a.y -= Math.sin(angle) * push;
                            b.x += Math.cos(angle) * push;
                            b.y += Math.sin(angle) * push;
                        }
                    }
                }
            }

            // 4. Dynamic display scaling: spread dots to use available space
            const allAbs = [
                ...this.compassParties.map(p => Math.abs(p.x)),
                ...this.compassParties.map(p => Math.abs(p.y)),
                Math.abs(this.userCoords.x),
                Math.abs(this.userCoords.y)
            ];
            const maxAbs = Math.max(...allAbs, 0.01);
            // Scale so the most extreme dot reaches 36% from center, cap at 42 to avoid over-spreading
            this.compassDisplayScale = Math.min(36 / maxAbs, 42);
        },

        reset() {
            if(confirm("Möchten Sie wirklich neu starten? Ihre Antworten werden gelöscht.")) {
                this.step = 0;
                this.answers = {};
                this.results = [];
                this.topMatch = null;
                this.selectedPartyId = null;
                this.modalOpen = false;
                this.isSharedView = false;
                document.body.style.overflow = '';
                localStorage.removeItem('wahlomat_answers');
                this.topics.forEach(t => { this.topicWeights[t] = 1; });
            }
        },

        // --- URL-Encoded Sharing ---

        encodeResults() {
            let r = '';
            for (let i = 1; i <= this.totalTheses; i++) {
                const ans = this.answers[i];
                if (ans === 1) r += 'a';
                else if (ans === 0) r += 'n';
                else if (ans === -1) r += 'd';
                else r += 's';
            }
            let w = '';
            this.topics.forEach(t => {
                w += this.topicWeights[t] === 2 ? '2' : '1';
            });
            return { r, w };
        },

        decodeResults(r, w) {
            if (!r || r.length !== this.totalTheses) return false;
            if (!/^[ands]+$/.test(r)) return false;

            this.answers = {};
            for (let i = 0; i < r.length; i++) {
                const ch = r[i];
                const thesisId = i + 1;
                if (ch === 'a') this.answers[thesisId] = 1;
                else if (ch === 'n') this.answers[thesisId] = 0;
                else if (ch === 'd') this.answers[thesisId] = -1;
            }

            if (w && w.length === this.topics.length && /^[12]+$/.test(w)) {
                for (let i = 0; i < w.length; i++) {
                    this.topicWeights[this.topics[i]] = w[i] === '2' ? 2 : 1;
                }
            }

            return Object.keys(this.answers).length > 0;
        },

        getShareUrl() {
            const { r, w } = this.encodeResults();
            return `https://wahl-navi.de/muc/?r=${r}&w=${w}`;
        },

        startOwnQuiz() {
            this.isSharedView = false;
            this.step = 0;
            this.answers = {};
            this.results = [];
            this.topMatch = null;
            this.topics.forEach(t => { this.topicWeights[t] = 1; });
        },

        // --- Modal with Focus Management ---

        openModal(id) {
            this._modalTrigger = document.activeElement;
            this.selectedPartyId = id;
            this.modalOpen = true;
            this.detailFilter = 'all';
            document.body.style.overflow = 'hidden';
            this.$nextTick(() => {
                const closeBtn = document.getElementById('modal-close-btn');
                if (closeBtn) closeBtn.focus();
            });
        },

        closeModal() {
            this.modalOpen = false;
            this.selectedPartyId = null;
            document.body.style.overflow = '';
            if (this._modalTrigger) {
                this._modalTrigger.focus();
                this._modalTrigger = null;
            }
        },

        trapFocus(event) {
            if (!this.modalOpen) return;
            const modal = document.getElementById('party-detail-modal');
            if (!modal) return;
            const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                last.focus();
                event.preventDefault();
            } else if (!event.shiftKey && document.activeElement === last) {
                first.focus();
                event.preventDefault();
            }
        },

        // --- Keyboard Navigation ---

        handleKeydown(event) {
            if (this.modalOpen) {
                if (event.key === 'Escape') { this.closeModal(); event.preventDefault(); }
                return;
            }
            if (this.step > 0 && this.step <= this.totalTheses) {
                if (event.key === '1') { this.answer(1); event.preventDefault(); }
                else if (event.key === '2') { this.answer(0); event.preventDefault(); }
                else if (event.key === '3') { this.answer(-1); event.preventDefault(); }
                else if (event.key === 'Backspace' && this.step > 1) { this.step--; event.preventDefault(); }
                return;
            }
            if (this.step === 0 && event.key === 'Enter') { this.start(); event.preventDefault(); }
            if (this.step === 98 && event.key === 'Enter') { this.showResults(); event.preventDefault(); }
        },

        // --- PDF Export ---

        printResults() {
            window.print();
        },

        // --- Sharing ---

        shareResults() {
            const title = 'WahlNavi München 2026';
            const url = this.getShareUrl();
            const text = `Mein Wahl-Check für München: ${this.topMatch?.name} (${Math.round(this.topMatch?.matchPercentage)}%). Mach auch den Test!`;

            if (navigator.share) {
                navigator.share({ title, text, url }).catch(console.error);
            } else {
                this.copyLink();
            }
        },

        shareCompass() {
            const s = 2; // 2x resolution for sharp export
            const size = 600 * s;
            const pad = 60 * s;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size + 80 * s;
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Quadrant tints
            const cx = size / 2, cy = size / 2;
            ctx.globalAlpha = 0.06;
            ctx.fillStyle = '#f43f5e'; ctx.fillRect(0, 0, cx, cy);
            ctx.fillStyle = '#3b82f6'; ctx.fillRect(cx, 0, cx, cy);
            ctx.fillStyle = '#22c55e'; ctx.fillRect(0, cy, cx, cy);
            ctx.fillStyle = '#a855f7'; ctx.fillRect(cx, cy, cx, cy);
            ctx.globalAlpha = 1;

            // Grid lines
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2 * s;
            ctx.beginPath(); ctx.moveTo(pad, cy); ctx.lineTo(size - pad, cy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, pad); ctx.lineTo(cx, size - pad); ctx.stroke();

            // Axis labels
            ctx.fillStyle = '#64748b';
            ctx.font = `bold ${14 * s}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('KONSERVATIV', cx, pad - 10 * s);
            ctx.fillText('PROGRESSIV', cx, size - pad + 22 * s);
            ctx.save(); ctx.translate(pad - 16 * s, cy); ctx.rotate(-Math.PI / 2); ctx.fillText('LINKS', 0, 0); ctx.restore();
            ctx.save(); ctx.translate(size - pad + 16 * s, cy); ctx.rotate(Math.PI / 2); ctx.fillText('RECHTS', 0, 0); ctx.restore();

            const range = size / 2 - pad;
            const scale = (this.compassDisplayScale / 100) / 0.5; // match dynamic CSS scale

            // Party dots with names
            ctx.font = `bold ${12 * s}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            this.compassParties.forEach(party => {
                const px = cx + party.x * range * scale;
                const py = cy - party.y * range * scale;
                ctx.fillStyle = this.getPartyColor(party.id);
                ctx.beginPath(); ctx.arc(px, py, 7 * s, 0, Math.PI * 2); ctx.fill();
                ctx.fillText(party.name, px, py - 14 * s);
            });

            // User dot
            const ux = cx + this.userCoords.x * range * scale;
            const uy = cy - this.userCoords.y * range * scale;
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.arc(ux, uy, 10 * s, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(ux, uy, 4 * s, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${13 * s}px Inter, system-ui, sans-serif`;
            ctx.fillText('DU', ux, uy + 24 * s);

            // Title bar
            const barY = size;
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${20 * s}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'left';
            ctx.fillText('Politischer Kompass', 20 * s, barY + 36 * s);

            // Top match
            if (this.topMatch) {
                ctx.fillStyle = '#64748b';
                ctx.font = `${13 * s}px Inter, system-ui, sans-serif`;
                ctx.fillText(`Top-Match: ${this.topMatch.name} (${Math.round(this.topMatch.matchPercentage)}%)`, 20 * s, barY + 58 * s);
            }

            // Watermark
            ctx.fillStyle = '#94a3b8';
            ctx.font = `${14 * s}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'right';
            ctx.fillText('wahl-navi.de', size - 20 * s, barY + 36 * s);

            const shareUrl = this.getShareUrl();
            canvas.toBlob(blob => {
                if (!blob) return;
                const file = new File([blob], 'kompass.png', { type: 'image/png' });
                const shareData = {
                    files: [file],
                    title: 'Mein Politischer Kompass',
                    text: `Mein Politischer Kompass zur Münchner Kommunalwahl 2026. Mach auch den Test: ${shareUrl}`
                };
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    navigator.share(shareData).catch(() => {});
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'kompass.png'; a.click();
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');
        },

        copyLink() {
            const url = this.getShareUrl();
            const text = `Mein Wahl-Check für München: ${this.topMatch?.name} (${Math.round(this.topMatch?.matchPercentage)}%). Mach auch den Test: ${url}`;
            navigator.clipboard.writeText(text).then(() => {
                this.shareTextStatus = 'Kopiert!';
                setTimeout(() => this.shareTextStatus = '', 2000);
            }).catch(() => {
                alert('Link konnte nicht kopiert werden.');
            });
        },

        // --- Helpers ---

        getSelectedParty() {
            return this.results.find(p => p.id === this.selectedPartyId);
        },

        getFilteredTheses() {
            const party = this.getSelectedParty();
            if (!party) return [];

            return this.theses.filter(thesis => {
                if (this.answers[thesis.id] === undefined) return false;

                const partyPos = this.getPartyPosition(party, thesis.id);

                // Party has no position: only show in 'all' view
                if (partyPos === null) {
                    return this.detailFilter === 'all';
                }

                const userPos = this.answers[thesis.id];
                const diff = Math.abs(userPos - partyPos);

                if (this.detailFilter === 'all') return true;
                if (this.detailFilter === 'match') return diff <= 1;
                if (this.detailFilter === 'diff') return diff > 1;
                return true;
            });
        },

        getPartyPosition(party, thesisId) {
            if (!party || !party.positions || !party.positions[thesisId]) return null;
            return party.positions[thesisId].val;
        },

        getPartyQuote(party, thesisId) {
            if (!party || !party.positions || !party.positions[thesisId]) return null;
            return party.positions[thesisId].quote;
        },

        getIconSimple(value) {
            if (value === 1) return '<span class="text-emerald-600"><svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></span>';
            if (value === -1) return '<span class="text-rose-600"><svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></span>';
            return '<span class="text-slate-400"><svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg></span>';
        },

        getIcon(value) {
            if (value === 1) return '<span class="text-emerald-600 font-bold flex items-center gap-1"><svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Zustimmung</span>';
            if (value === -1) return '<span class="text-rose-600 font-bold flex items-center gap-1"><svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Ablehnung</span>';
            return '<span class="text-slate-500 font-bold flex items-center gap-1"><svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg> Neutral</span>';
        },

        getPositionMatchClass(userVal, partyVal) {
            if (partyVal === null) return 'border-slate-200 opacity-50';
            const diff = Math.abs(userVal - partyVal);
            if (diff === 0) return 'border-emerald-400 bg-emerald-50/30';
            if (diff === 1) return 'border-yellow-400';
            return 'border-rose-400 bg-rose-50/30';
        },

        getPartyColor(id) {
            const colors = {
                'gruene': '#16a34a', 'spd': '#dc2626', 'csu': '#0284c7', 'fdp': '#ca8a04',
                'afd': '#0ea5e9', 'linke': '#db2777', 'volt': '#7c3aed', 'oedp': '#ea580c',
                'partei': '#334155', 'rosa_liste': '#ec4899', 'muenchen_liste': '#0f766e',
                'bp': '#1e3a8a', 'bk': '#be185d', 'fw': '#f59e0b'
            };
            return colors[id] || '#64748b';
        },

        getPartySlogan(id) {
            const slogans = {
                'gruene': 'Für ein klimaneutrales München.', 'spd': 'Sozial und gerecht.',
                'csu': 'Näher am Menschen.', 'volt': 'Europäisch denken, lokal handeln.',
                'partei': 'Die Partei für Arbeit, Rechtsstaat...', 'oedp': 'Weniger ist mehr.',
                'muenchen_liste': 'Wachstum begrenzen.', 'fdp': 'Technologieoffen und frei.',
                'afd': 'Mut zur Wahrheit.', 'linke': 'München für alle.',
                'rosa_liste': 'Vielfalt in München.', 'bp': 'Leben und leben lassen.',
                'bk': 'Kultur ist alles.', 'fw': 'München gemeinsam besser.'
            };
            return slogans[id] || 'Kommunalwahl 2026';
        }
    }
}
