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
        savedStep: 0,
        revisedAnswers: [],
        _modalTrigger: null,
        topicScores: {},
        topicBreakdownOpen: {},
        isEmbedMode: false,
        embedCodeVisible: false,
        profileSummary: '',
        resultsRevealed: false,
        compassAnimated: false,
        milestoneShown: null,
        prefersReducedMotion: false,
        mobileResultTab: 'overview',

        init() {
            if (window.WAHLOMAT_DATA) {
                this.theses = window.WAHLOMAT_DATA.theses;
                this.parties = window.WAHLOMAT_DATA.parties;
                this.totalTheses = this.theses.length;
                const seen = new Set();
                this.theses.forEach(t => { if (!seen.has(t.topic)) { seen.add(t.topic); this.topics.push(t.topic); } });
                this.topics.forEach(t => { this.topicWeights[t] = 1; this.topicBreakdownOpen[t] = false; });
            } else {
                console.error("Daten nicht geladen!");
            }

            this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            this.$watch('answers', val => {
                if (!this.isSharedView && !this.isEmbedMode) {
                    localStorage.setItem('wahlomat_answers', JSON.stringify(val));
                }
            });

            this.$watch('step', val => {
                if (val > 0 && !this.isSharedView && !this.isEmbedMode) {
                    localStorage.setItem('wn_step', val);
                }
            });

            this.$watch('topicWeights', val => {
                if (!this.isSharedView && !this.isEmbedMode) {
                    localStorage.setItem('wn_weights', JSON.stringify(val));
                }
            }, { deep: true });

            // Check URL params for shared results
            const params = new URLSearchParams(window.location.search);
            const r = params.get('r');
            const w = params.get('w');
            if (r && this.decodeResults(r, w)) {
                this.isSharedView = true;
                this.calculateResults();
                this.step = 99;
                this.resultsRevealed = true;
                this.compassAnimated = true;
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

            const savedStep = localStorage.getItem('wn_step');
            if (savedStep) {
                this.savedStep = parseInt(savedStep, 10) || 0;
            }

            const savedWeights = localStorage.getItem('wn_weights');
            if (savedWeights) {
                try {
                    const w = JSON.parse(savedWeights);
                    if (w && typeof w === 'object') {
                        Object.assign(this.topicWeights, w);
                    }
                } catch(e) { /* ignore */ }
            }
        },

        get currentThesis() {
            if (this.step < 1 || this.step > this.theses.length) return null;
            return this.theses[this.step - 1];
        },

        start() {
            this.savedStep = 0;
            this.step = 1;
            window.scrollTo(0,0);
            if (Object.keys(this.answers).length >= this.totalTheses) {
                this.step = 98;
            }
        },

        resumeQuiz() {
            this.step = this.savedStep;
            this.savedStep = 0;
            window.scrollTo(0,0);
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
                this.checkMilestone();
            } else {
                this.step = 98;
                window.scrollTo(0,0);
            }
        },

        checkMilestone() {
            if (this.prefersReducedMotion) return;
            const pct = Math.round((this.step / this.totalTheses) * 100);
            const milestones = [25, 50, 75];
            const hit = milestones.find(m => pct >= m && pct < m + (100 / this.totalTheses) + 1);
            if (hit && this.milestoneShown !== hit) {
                this.milestoneShown = hit;
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-[env(safe-area-inset-bottom,24px)] left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg animate-toast-in';
                toast.textContent = `${hit}% geschafft!`;
                document.body.appendChild(toast);
                // Announce to screen readers
                const liveRegion = document.getElementById('aria-live-region');
                if (liveRegion) liveRegion.textContent = `${hit}% geschafft!`;
                setTimeout(() => {
                    toast.classList.remove('animate-toast-in');
                    toast.classList.add('animate-toast-out');
                    setTimeout(() => toast.remove(), 300);
                }, 1500);
            }
        },

        showResults() {
            try {
                this.resultsRevealed = false;
                this.compassAnimated = false;
                this.calculateResults();
                this.step = 99;
                window.scrollTo(0,0);
                if (!this.prefersReducedMotion) {
                    setTimeout(() => { this.resultsRevealed = true; }, 100);
                    setTimeout(() => { this.compassAnimated = true; }, 300);
                } else {
                    this.resultsRevealed = true;
                    this.compassAnimated = true;
                }
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
                this.calculateTopicScores();
                this.calculateProfileSummary();

            } catch (e) {
                console.error("Inner calculation error", e);
                throw e;
            }
        },

        calculateTopicScores() {
            const scores = {};
            this.topics.forEach(topic => {
                const topicTheses = this.theses.filter(t => t.topic === topic);
                const answered = topicTheses.filter(t => this.answers[t.id] !== undefined);
                const parties = {};
                this.parties.forEach(party => {
                    let points = 0;
                    let maxPoints = 0;
                    answered.forEach(thesis => {
                        const userPos = this.answers[thesis.id];
                        const tw = this.topicWeights[thesis.topic] || 1;
                        if (party.positions && party.positions[thesis.id]) {
                            const partyPosData = party.positions[thesis.id];
                            const partyPos = partyPosData.val !== undefined ? partyPosData.val : partyPosData.position;
                            const diff = Math.abs(userPos - partyPos);
                            points += (2 - diff) * tw;
                        } else {
                            points += 1 * tw;
                        }
                        maxPoints += 2 * tw;
                    });
                    parties[party.id] = {
                        score: points,
                        maxScore: maxPoints,
                        percent: maxPoints > 0 ? (points / maxPoints) * 100 : 0
                    };
                });
                scores[topic] = {
                    thesisIds: topicTheses.map(t => t.id),
                    answeredCount: answered.length,
                    totalCount: topicTheses.length,
                    parties
                };
            });
            this.topicScores = scores;
        },

        toggleTopicBreakdown(topic) {
            this.topicBreakdownOpen[topic] = !this.topicBreakdownOpen[topic];
        },

        getTopTopicParty(topic) {
            const ts = this.topicScores[topic];
            if (!ts) return null;
            let best = null;
            let bestPct = -1;
            Object.entries(ts.parties).forEach(([pid, data]) => {
                if (data.percent > bestPct) { bestPct = data.percent; best = pid; }
            });
            return best;
        },

        calculateProfileSummary() {
            const x = this.userCoords.x;
            const y = this.userCoords.y;
            let econText = '';
            if (x < -0.4) econText = 'wirtschaftlich eher links';
            else if (x < -0.15) econText = 'wirtschaftlich leicht links der Mitte';
            else if (x > 0.4) econText = 'wirtschaftlich eher wirtschaftsliberal';
            else if (x > 0.15) econText = 'wirtschaftlich leicht rechts der Mitte';
            else econText = 'wirtschaftlich in der Mitte';

            let socialText = '';
            if (y > 0.4) socialText = 'gesellschaftlich eher konservativ';
            else if (y > 0.15) socialText = 'gesellschaftlich leicht konservativ';
            else if (y < -0.4) socialText = 'gesellschaftlich eher progressiv';
            else if (y < -0.15) socialText = 'gesellschaftlich leicht progressiv';
            else socialText = 'gesellschaftlich in der Mitte';

            // For centrist users, provide a meaningful summary
            const isCentrist = Math.abs(x) <= 0.15 && Math.abs(y) <= 0.15;
            let summary = '';
            if (isCentrist) {
                summary = 'Dein Profil liegt nah an der politischen Mitte';
            } else {
                summary = 'Dein Profil: ' + econText + ' und ' + socialText;
            }

            // Strongest topic — based on user's OWN highest-scoring topic across all parties
            let bestTopic = null;
            let bestPct = 0;
            Object.entries(this.topicScores).forEach(([topic, data]) => {
                // Find the user's average match across all parties for this topic
                let topicBest = 0;
                Object.values(data.parties).forEach(p => {
                    if (p.percent > topicBest) topicBest = p.percent;
                });
                if (topicBest > bestPct) { bestPct = topicBest; bestTopic = topic; }
            });
            if (bestTopic && (bestPct > 75 || isCentrist)) {
                summary += '. Besonders interessiert am Thema ' + bestTopic;
            }

            this.profileSummary = summary + '.';
        },

        // --- Radar Chart Methods ---

        radarPolygonString(partyId, radius) {
            const cx = 150, cy = 150;
            const n = this.topics.length;
            const points = this.topics.map((topic, i) => {
                const pct = (this.topicScores[topic]?.parties[partyId]?.percent || 0) / 100;
                const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                const r = pct * radius;
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            });
            return points.join(' ');
        },

        radarGridRingPoints(fraction, radius) {
            const cx = 150, cy = 150;
            const n = this.topics.length;
            const points = [];
            for (let i = 0; i < n; i++) {
                const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                const r = fraction * radius;
                points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
            }
            return points.join(' ');
        },

        getRadarAxisEndpoints(radius) {
            const cx = 150, cy = 150;
            const n = this.topics.length;
            return this.topics.map((topic, i) => {
                const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                return {
                    topic,
                    x1: cx, y1: cy,
                    x2: cx + radius * Math.cos(angle),
                    y2: cy + radius * Math.sin(angle),
                    labelX: cx + (radius + 18) * Math.cos(angle),
                    labelY: cy + (radius + 18) * Math.sin(angle)
                };
            });
        },

        getRadarSVG() {
            if (!this.topMatch || this.topics.length === 0) return '';
            const r = 110;
            let svg = '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style="width:100%">';
            // Grid rings
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                svg += `<polygon points="${this.radarGridRingPoints(frac, r)}" fill="none" stroke="#e2e8f0" stroke-width="1"/>`;
            });
            // Axis lines + labels
            this.getRadarAxisEndpoints(r).forEach(a => {
                svg += `<line x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="#cbd5e1" stroke-width="1"/>`;
                svg += `<text x="${a.labelX}" y="${a.labelY}" text-anchor="middle" dominant-baseline="central" fill="#64748b" font-size="9" font-weight="500">${a.topic.split(/[\s,&]+/)[0]}</text>`;
            });
            // Top match polygon
            const color = this.getPartyColor(this.topMatch.id);
            svg += `<polygon points="${this.radarPolygonString(this.topMatch.id, r)}" fill="${color}33" stroke="${color}" stroke-width="2"/>`;
            svg += '</svg>';
            return svg;
        },

        getEmbedCode() {
            return '<iframe src="https://wahl-navi.de/muc/embed.html" width="100%" height="700" style="border:none;max-width:500px;" title="WahlNavi München 2026"></iframe>';
        },

        copyEmbedCode() {
            navigator.clipboard.writeText(this.getEmbedCode()).then(() => {
                this.embedCodeVisible = false;
            }).catch(() => {
                alert('Code konnte nicht kopiert werden.');
            });
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
            if(confirm("Möchtest du wirklich neu starten? Deine Antworten werden gelöscht.")) {
                this.step = 0;
                this.answers = {};
                this.results = [];
                this.topMatch = null;
                this.selectedPartyId = null;
                this.modalOpen = false;
                this.isSharedView = false;
                this.savedStep = 0;
                this.revisedAnswers = [];
                document.body.style.overflow = '';
                localStorage.removeItem('wahlomat_answers');
                localStorage.removeItem('wn_step');
                localStorage.removeItem('wn_weights');
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
            this.savedStep = 0;
            this.revisedAnswers = [];
            this.topics.forEach(t => { this.topicWeights[t] = 1; });
            localStorage.removeItem('wahlomat_answers');
            localStorage.removeItem('wn_step');
            localStorage.removeItem('wn_weights');
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
            ctx.fillText('GESELLSCHAFTLICH KONSERVATIV', cx, pad - 10 * s);
            ctx.fillText('GESELLSCHAFTLICH PROGRESSIV', cx, size - pad + 22 * s);
            ctx.save(); ctx.translate(pad - 16 * s, cy); ctx.rotate(-Math.PI / 2); ctx.fillText('WIRTSCHAFTLICH LINKS', 0, 0); ctx.restore();
            ctx.save(); ctx.translate(size - pad + 16 * s, cy); ctx.rotate(Math.PI / 2); ctx.fillText('WIRTSCHAFTLICH RECHTS', 0, 0); ctx.restore();

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

            // Caveat
            ctx.fillStyle = '#94a3b8';
            ctx.font = `${11 * s}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'left';
            ctx.fillText('Basiert auf 25 Thesen zur Münchner Kommunalwahl 2026', 20 * s, barY + 74 * s);

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

        // --- Answer Revision ---

        reviseAnswer(thesisId, value) {
            this.answers[thesisId] = value;
            if (!this.revisedAnswers.includes(thesisId)) {
                this.revisedAnswers.push(thesisId);
            }
            this.calculateResults();
            const liveRegion = document.getElementById('aria-live-region');
            if (liveRegion) {
                const thesis = this.theses.find(t => t.id == thesisId);
                const label = value === 1 ? 'Zustimmung' : value === -1 ? 'Ablehnung' : 'Neutral';
                liveRegion.textContent = `Antwort für "${thesis?.short_title}" geändert zu ${label}. Ergebnisse aktualisiert.`;
            }
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
