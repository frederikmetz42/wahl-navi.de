function wahlomatApp() {
    return {
        step: 0,
        totalTheses: 0,
        theses: [],
        parties: [],
        answers: {},
        results: [],
        topMatch: null,
        surpriseMatches: [],
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
        resultTab: 'compass',
        showBackground: false,
        showShareCTA: false,
        celebrationActive: false,
        shareSheetOpen: false,
        shareFormat: 'feed',
        shareCard: 'results',
        feedbackGiven: false,
        exitIntentShown: false,

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
            this.feedbackGiven = !!localStorage.getItem('mucwahl_feedback');
            this.initExitIntent();

            this.$watch('answers', val => {
                if (!this.isSharedView && !this.isEmbedMode) {
                    localStorage.setItem('wahlomat_answers', JSON.stringify(val));
                }
            });

            this.$watch('step', val => {
                if (val > 0 && val <= this.totalTheses && !this.isSharedView && !this.isEmbedMode) {
                    localStorage.setItem('wn_step', val);
                }
            });

            this.$watch('topicWeights', val => {
                if (!this.isSharedView && !this.isEmbedMode) {
                    localStorage.setItem('wn_weights', JSON.stringify(val));
                }
            }, { deep: true });

            // Check URL for shared results: fragment first (#r=), query-params as fallback (?r= for old links)
            const hash = window.location.hash;
            let r, w;
            if (hash && hash.length > 1) {
                const hp = new URLSearchParams(hash.substring(1));
                r = hp.get('r');
                w = hp.get('w');
            }
            if (!r) {
                const qp = new URLSearchParams(window.location.search);
                r = qp.get('r');
                w = qp.get('w');
            }
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
                        this.topics.forEach(t => {
                            this.topicWeights[t] = Math.max(0, Math.min(4, this.topicWeights[t] || 1));
                        });
                        let sum = this.topics.reduce((s, t) => s + this.topicWeights[t], 0);
                        if (sum > 10) {
                            this.topics.forEach(t => { this.topicWeights[t] = 1; });
                        }
                    }
                } catch(e) { /* ignore */ }
            }
        },

        get currentThesis() {
            if (this.step < 1 || this.step > this.theses.length) return null;
            return this.theses[this.step - 1];
        },

        get budgetUsed() {
            return this.topics.reduce((sum, t) => sum + (this.topicWeights[t] || 0), 0);
        },

        get budgetRemaining() {
            return 10 - this.budgetUsed;
        },

        get daysUntilElection() {
            const today = new Date(); today.setHours(0,0,0,0);
            const election = new Date('2026-03-08'); election.setHours(0,0,0,0);
            const diff = Math.round((election - today) / 86400000);
            return diff >= 0 ? diff : null;
        },
        get isElectionDay() { return this.daysUntilElection === 0; },
        get isElectionSeason() { return this.daysUntilElection !== null && this.daysUntilElection <= 30; },

        incrementWeight(topic) {
            if (this.topicWeights[topic] < 4 && this.budgetRemaining > 0) {
                this.topicWeights[topic]++;
            }
        },

        decrementWeight(topic) {
            if (this.topicWeights[topic] > 0) {
                this.topicWeights[topic]--;
            }
        },

        goToStimmzettel() {
            this.step = 97;
            window.scrollTo(0, 0);
        },

        start() {
            this.savedStep = 0;
            this.step = 98;
            window.scrollTo(0,0);
        },

        resumeQuiz() {
            this.step = this.savedStep;
            this.savedStep = 0;
            window.scrollTo(0,0);
        },

        answer(value) {
            if (!this.currentThesis) return;
            this.showBackground = false;
            this.answers[this.currentThesis.id] = value;
            this.nextStep();
        },

        skip() {
            if (!this.currentThesis) return;
            this.showBackground = false;
            delete this.answers[this.currentThesis.id];
            this.nextStep();
        },

        nextStep() {
            if (this.step < this.totalTheses) {
                this.step++;
                this.checkMilestone();
            } else {
                this.showResults();
            }
        },

        checkMilestone() {
            if (this.prefersReducedMotion) return;
            const pct = Math.round((this.step / this.totalTheses) * 100);
            const milestones = [25, 50, 75];
            const hit = milestones.find(m => pct >= m && pct < m + (100 / this.totalTheses) + 1);
            if (hit && this.milestoneShown !== hit) {
                this.milestoneShown = hit;
                const remaining = this.totalTheses - this.step;
                const messages = {
                    25: 'Gut warm geworden!',
                    50: 'Halbzeit! Schon eine Tendenz?',
                    75: `Fast geschafft. Noch ${remaining} Thesen.`
                };
                const msg = messages[hit] || `${hit}% geschafft!`;
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-[env(safe-area-inset-bottom,24px)] left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg animate-toast-in';
                toast.textContent = msg;
                document.body.appendChild(toast);
                const liveRegion = document.getElementById('aria-live-region');
                if (liveRegion) liveRegion.textContent = msg;
                setTimeout(() => {
                    toast.classList.remove('animate-toast-in');
                    toast.classList.add('animate-toast-out');
                    setTimeout(() => toast.remove(), 300);
                }, 1800);
            }
        },

        showResults() {
            try {
                this.resultsRevealed = false;
                this.compassAnimated = false;
                this.showShareCTA = false;
                this.celebrationActive = false;
                this.calculateResults();
                this.step = 99;
                window.scrollTo(0,0);
                if (!this.prefersReducedMotion) {
                    setTimeout(() => { this.resultsRevealed = true; }, 100);
                    setTimeout(() => { this.celebrationActive = true; }, 200);
                    setTimeout(() => { this.compassAnimated = true; }, 300);
                    setTimeout(() => { this.showShareCTA = true; }, 1000);
                } else {
                    this.resultsRevealed = true;
                    this.compassAnimated = true;
                    this.showShareCTA = true;
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

                // Surprise matches: small parties ranking outside top 3 with >55%
                const bigSix = ['csu', 'gruene', 'spd', 'afd', 'fdp', 'linke'];
                this.surpriseMatches = this.results
                    .slice(3)
                    .filter(p => p.matchPercentage > 55 && !bigSix.includes(p.id));

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
            // Grid rings with % labels
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                svg += `<polygon points="${this.radarGridRingPoints(frac, r)}" fill="none" stroke="#e2e8f0" stroke-width="1"/>`;
                svg += `<text x="153" y="${150 - frac * r + 3}" fill="#94a3b8" font-size="7" font-weight="400">${Math.round(frac * 100)}%</text>`;
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
            return '<iframe src="https://mucwahl.de/embed.html" width="100%" height="700" style="border:none;max-width:500px;" title="MUCwahl München 2026"></iframe>';
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
                w += this.topicWeights[t];
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

            if (w && w.length === this.topics.length && /^[0-4]+$/.test(w)) {
                for (let i = 0; i < w.length; i++) {
                    this.topicWeights[this.topics[i]] = parseInt(w[i], 10);
                }
            }

            return Object.keys(this.answers).length > 0;
        },

        getShareUrl() {
            const { r, w } = this.encodeResults();
            return `https://mucwahl.de/#r=${r}&w=${w}`;
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
            document.body.style.overflow = '';
            if (this.resultTab === 'compare' && this.topMatch) {
                this.selectedPartyId = this.topMatch.id;
            } else {
                this.selectedPartyId = null;
            }
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
            if (this.shareSheetOpen) {
                if (event.key === 'Escape') { this.closeShareSheet(); event.preventDefault(); }
                return;
            }
            if (this.modalOpen) {
                if (event.key === 'Escape') { this.closeModal(); event.preventDefault(); }
                return;
            }
            if (this.step > 0 && this.step <= this.totalTheses) {
                if (event.key === '1') { this.answer(1); event.preventDefault(); }
                else if (event.key === '2') { this.answer(0); event.preventDefault(); }
                else if (event.key === '3') { this.answer(-1); event.preventDefault(); }
                else if (event.key === 'i' || event.key === 'I') { this.showBackground = !this.showBackground; event.preventDefault(); }
                else if (event.key === 'Backspace') { this.showBackground = false; if (this.step > 1) { this.step--; } else { this.step = 98; window.scrollTo(0, 0); } event.preventDefault(); }
                return;
            }
            if (this.step === 0 && event.key === 'Enter') { this.start(); event.preventDefault(); }
            if (this.step === 98 && event.key === 'Enter') {
                if (Object.keys(this.answers).length === 0) { this.step = 1; window.scrollTo(0, 0); }
                else { this.showResults(); }
                event.preventDefault();
            }
        },

        // --- PDF Export ---

        printResults() {
            window.print();
        },

        // --- Sharing ---

        shareResults() {
            if (!this.topMatch) return;
            // Check font readiness
            const fontReady = document.fonts ? document.fonts.check('bold 32px Inter') : true;
            if (!fontReady) {
                // Fallback to text share if font not ready
                this._shareTextFallback();
                return;
            }

            const W = 1080, H = 1350;
            const canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, W, H);

            // Header bar
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W, 120);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('MUCwahl München 2026', 48, 76);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '24px Inter, system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('mucwahl.de', W - 48, 76);

            // Top match card
            const matchColor = this.getPartyColor(this.topMatch.id);
            ctx.fillStyle = '#ffffff';
            this._roundRectFill(ctx, 48, 168, W - 96, 240, 24);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            this._roundRect(ctx, 48, 168, W - 96, 240, 24);
            ctx.stroke();

            // Match color accent bar
            ctx.fillStyle = matchColor;
            ctx.fillRect(48, 168, 8, 240);

            ctx.fillStyle = '#64748b';
            ctx.font = '22px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Höchste Übereinstimmung', 96, 220);

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 56px Inter, system-ui, sans-serif';
            ctx.fillText(this.topMatch.name, 96, 295);

            // Percentage circle
            const circleX = W - 168, circleY = 288, circleR = 72;
            ctx.beginPath();
            ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
            ctx.fillStyle = '#f1f5f9';
            ctx.fill();
            const pct = this.topMatch.matchPercentage / 100;
            ctx.beginPath();
            ctx.arc(circleX, circleY, circleR, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
            ctx.strokeStyle = matchColor;
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 40px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(this.topMatch.matchPercentage) + '%', circleX, circleY + 14);

            // Top 3 bars
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 28px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Top 3', 48, 476);

            const top3 = this.results.slice(0, 3);
            top3.forEach((party, i) => {
                const y = 510 + i * 100;
                const barW = W - 96;
                const color = this.getPartyColor(party.id);

                ctx.fillStyle = '#0f172a';
                ctx.font = '24px Inter, system-ui, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(party.name, 48, y + 28);

                ctx.font = 'bold 24px Inter, system-ui, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(Math.round(party.matchPercentage) + '%', W - 48, y + 28);

                // Bar background
                ctx.fillStyle = '#f1f5f9';
                this._roundRectFill(ctx, 48, y + 42, barW, 24, 12);
                // Bar fill
                ctx.fillStyle = color;
                const fillW = Math.max(24, (party.matchPercentage / 100) * barW);
                this._roundRectFill(ctx, 48, y + 42, fillW, 24, 12);
            });

            // Radar chart (compact)
            if (this.topics.length > 0) {
                const radarCx = W / 2, radarCy = 980, radarR = 200;
                const n = this.topics.length;

                // Grid rings
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 1;
                [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                    ctx.beginPath();
                    for (let i = 0; i <= n; i++) {
                        const angle = (Math.PI * 2 * (i % n) / n) - Math.PI / 2;
                        const rr = frac * radarR;
                        const x = radarCx + rr * Math.cos(angle);
                        const y = radarCy + rr * Math.sin(angle);
                        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                });

                // Axes + labels
                ctx.fillStyle = '#64748b';
                ctx.font = '18px Inter, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                this.topics.forEach((topic, i) => {
                    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                    ctx.strokeStyle = '#cbd5e1';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(radarCx, radarCy);
                    ctx.lineTo(radarCx + radarR * Math.cos(angle), radarCy + radarR * Math.sin(angle));
                    ctx.stroke();
                    const labelR = radarR + 30;
                    ctx.fillText(topic.split(/[\s,&]+/)[0], radarCx + labelR * Math.cos(angle), radarCy + labelR * Math.sin(angle));
                });

                // Top match polygon
                ctx.beginPath();
                this.topics.forEach((topic, i) => {
                    const topicPct = (this.topicScores[topic]?.parties[this.topMatch.id]?.percent || 0) / 100;
                    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                    const rr = topicPct * radarR;
                    const x = radarCx + rr * Math.cos(angle);
                    const y = radarCy + rr * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                });
                ctx.closePath();
                ctx.fillStyle = matchColor + '33';
                ctx.fill();
                ctx.strokeStyle = matchColor;
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Watermark
            ctx.fillStyle = '#94a3b8';
            ctx.font = '20px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText('mucwahl.de · Kommunalwahl München 2026', W / 2, H - 36);

            this._shareCanvas(canvas, 'mucwahl-ergebnis.png', 'Mein MUCwahl Ergebnis',
                `Mein Wahl-Check für München: ${this.topMatch.name} (${Math.round(this.topMatch.matchPercentage)}%). Mach auch den Test:`);
        },

        _shareTextFallback() {
            const title = 'MUCwahl München 2026';
            const url = this.getShareUrl();
            const text = `Mein Wahl-Check für München: ${this.topMatch?.name} (${Math.round(this.topMatch?.matchPercentage)}%). Mach auch den Test!`;
            if (navigator.share) {
                navigator.share({ title, text, url }).catch(console.error);
            } else {
                this.copyLink();
            }
        },

        _roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        },

        _roundRectFill(ctx, x, y, w, h, r) {
            this._roundRect(ctx, x, y, w, h, r);
            ctx.fill();
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
            ctx.fillText('mucwahl.de', size - 20 * s, barY + 36 * s);

            this._shareCanvas(canvas, 'kompass.png', 'Mein Politischer Kompass',
                'Mein Politischer Kompass zur Münchner Kommunalwahl 2026. Mach auch den Test:');
        },

        shareRadar() {
            if (!this.topMatch || this.topics.length === 0) return;
            const s = 2;
            const svgSize = 300 * s;
            const canvas = document.createElement('canvas');
            canvas.width = svgSize;
            canvas.height = svgSize + 80 * s;
            const ctx = canvas.getContext('2d');
            const cx = svgSize / 2, cy = svgSize / 2;
            const r = 110 * s;
            const n = this.topics.length;

            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1 * s;
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                ctx.beginPath();
                for (let i = 0; i <= n; i++) {
                    const angle = (Math.PI * 2 * (i % n) / n) - Math.PI / 2;
                    const rr = frac * r;
                    const x = cx + rr * Math.cos(angle);
                    const y = cy + rr * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            });

            ctx.fillStyle = '#64748b';
            ctx.font = `${9 * s}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            this.topics.forEach((topic, i) => {
                const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 1 * s;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
                ctx.stroke();
                const labelR = r + 18 * s;
                ctx.fillText(topic.split(/[\s,&]+/)[0], cx + labelR * Math.cos(angle), cy + labelR * Math.sin(angle));
            });

            const color = this.getPartyColor(this.topMatch.id);
            ctx.beginPath();
            this.topics.forEach((topic, i) => {
                const pct = (this.topicScores[topic]?.parties[this.topMatch.id]?.percent || 0) / 100;
                const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                const rr = pct * r;
                const x = cx + rr * Math.cos(angle);
                const y = cy + rr * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fillStyle = color + '33';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 * s;
            ctx.stroke();

            const barY = svgSize;
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${20 * s}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText('Themen-Radar', 20 * s, barY + 36 * s);
            if (this.topMatch) {
                ctx.fillStyle = '#64748b';
                ctx.font = `${13 * s}px Inter, system-ui, sans-serif`;
                ctx.fillText(`Top-Match: ${this.topMatch.name} (${Math.round(this.topMatch.matchPercentage)}%)`, 20 * s, barY + 58 * s);
            }
            ctx.fillStyle = '#94a3b8';
            ctx.font = `${11 * s}px Inter, system-ui, sans-serif`;
            ctx.fillText('Dein politisches Profil nach Themengebieten', 20 * s, barY + 74 * s);
            ctx.font = `${14 * s}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'right';
            ctx.fillText('mucwahl.de', svgSize - 20 * s, barY + 36 * s);

            this._shareCanvas(canvas, 'radar.png', 'Mein Themen-Radar',
                'Mein Themen-Radar zur Münchner Kommunalwahl 2026. Mach auch den Test:');
        },

        _shareCanvas(canvas, filename, title, text) {
            const shareUrl = this.getShareUrl();
            const fullText = `${text} ${shareUrl}`;
            canvas.toBlob(blob => {
                if (!blob) { this._shareTextFallback(); return; }
                const file = new File([blob], filename, { type: 'image/png' });
                const shareData = { files: [file], title, text: fullText };
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    navigator.share(shareData).catch(() => {});
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = filename; a.click();
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');
        },

        shareResultsStory() {
            if (!this.topMatch) return;
            const fontReady = document.fonts ? document.fonts.check('bold 32px Inter') : true;
            if (!fontReady) { this._shareTextFallback(); return; }

            const W = 1080, H = 1920;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            const matchColor = this.getPartyColor(this.topMatch.id);

            // Dark background
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W, H);

            // Header
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('MUCwahl München 2026', 60, 100);
            ctx.fillStyle = '#64748b';
            ctx.font = '24px Inter, system-ui, sans-serif';
            ctx.fillText('Kommunalwahl · Mein Ergebnis', 60, 140);

            // Top match - oversized
            ctx.fillStyle = matchColor;
            this._roundRectFill(ctx, 60, 200, W - 120, 380, 32);
            ctx.fillStyle = '#ffffff';
            ctx.font = '28px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Höchste Übereinstimmung', 100, 260);
            ctx.font = 'bold 72px Inter, system-ui, sans-serif';
            ctx.fillText(this.topMatch.name, 100, 360);

            // Percentage ring
            const circX = W - 200, circY = 390, circR = 90;
            ctx.beginPath(); ctx.arc(circX, circY, circR, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
            const pct = this.topMatch.matchPercentage / 100;
            ctx.beginPath(); ctx.arc(circX, circY, circR, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 52px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(this.topMatch.matchPercentage) + '%', circX, circY + 18);

            // Top 3 bars
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 26px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('TOP 3', 60, 660);

            const top3 = this.results.slice(0, 3);
            top3.forEach((party, i) => {
                const y = 700 + i * 110;
                const barW = W - 120;
                const color = this.getPartyColor(party.id);

                ctx.fillStyle = '#e2e8f0';
                ctx.font = '26px Inter, system-ui, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(party.name, 60, y + 30);
                ctx.font = 'bold 26px Inter, system-ui, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(Math.round(party.matchPercentage) + '%', W - 60, y + 30);

                ctx.fillStyle = '#1e293b';
                this._roundRectFill(ctx, 60, y + 46, barW, 28, 14);
                ctx.fillStyle = color;
                this._roundRectFill(ctx, 60, y + 46, Math.max(28, (party.matchPercentage / 100) * barW), 28, 14);
            });

            // Compact radar
            if (this.topics.length > 0) {
                const radarCx = W / 2, radarCy = 1300, radarR = 220;
                const n = this.topics.length;

                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 1;
                [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                    ctx.beginPath();
                    for (let i = 0; i <= n; i++) {
                        const angle = (Math.PI * 2 * (i % n) / n) - Math.PI / 2;
                        const rr = frac * radarR;
                        const x = radarCx + rr * Math.cos(angle);
                        const y = radarCy + rr * Math.sin(angle);
                        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    }
                    ctx.closePath(); ctx.stroke();
                });

                ctx.fillStyle = '#94a3b8';
                ctx.font = '20px Inter, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                this.topics.forEach((topic, i) => {
                    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(radarCx, radarCy);
                    ctx.lineTo(radarCx + radarR * Math.cos(angle), radarCy + radarR * Math.sin(angle)); ctx.stroke();
                    const labelR = radarR + 32;
                    ctx.fillText(topic.split(/[\s,&]+/)[0], radarCx + labelR * Math.cos(angle), radarCy + labelR * Math.sin(angle));
                });

                ctx.beginPath();
                this.topics.forEach((topic, i) => {
                    const topicPct = (this.topicScores[topic]?.parties[this.topMatch.id]?.percent || 0) / 100;
                    const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                    const rr = topicPct * radarR;
                    const x = radarCx + rr * Math.cos(angle);
                    const y = radarCy + rr * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                });
                ctx.closePath();
                ctx.fillStyle = matchColor + '44'; ctx.fill();
                ctx.strokeStyle = matchColor; ctx.lineWidth = 3; ctx.stroke();
            }

            // Watermark
            ctx.fillStyle = '#64748b';
            ctx.font = '22px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText('mucwahl.de · Kommunalwahl München 2026', W / 2, H - 50);

            this._shareCanvas(canvas, 'mucwahl-story.png', 'Mein MUCwahl Ergebnis',
                `Mein Wahl-Check für München: ${this.topMatch.name} (${Math.round(this.topMatch.matchPercentage)}%). Mach auch den Test:`);
        },

        shareTopMatchCard() {
            if (!this.topMatch) return;
            const W = 1080, H = 1080;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            const matchColor = this.getPartyColor(this.topMatch.id);

            // Background
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W, H);

            // Color accent bar
            ctx.fillStyle = matchColor;
            ctx.fillRect(0, 0, W, 8);

            // Label
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 28px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('MEIN TOP-MATCH', W / 2, 200);

            // Party name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 80px Inter, system-ui, sans-serif';
            ctx.fillText(this.topMatch.name, W / 2, 440);

            // Percentage
            ctx.fillStyle = matchColor;
            ctx.font = 'bold 160px Inter, system-ui, sans-serif';
            ctx.fillText(Math.round(this.topMatch.matchPercentage) + '%', W / 2, 640);

            // Subtitle
            ctx.fillStyle = '#64748b';
            ctx.font = '26px Inter, system-ui, sans-serif';
            ctx.fillText('Übereinstimmung', W / 2, 700);

            // Branding
            ctx.fillStyle = '#475569';
            ctx.font = '24px Inter, system-ui, sans-serif';
            ctx.fillText('MUCwahl · Kommunalwahl München 2026', W / 2, H - 60);
            ctx.fillStyle = '#64748b';
            ctx.font = '20px Inter, system-ui, sans-serif';
            ctx.fillText('mucwahl.de', W / 2, H - 30);

            this._shareCanvas(canvas, 'mucwahl-topmatch.png', 'Mein Top-Match',
                `Mein Top-Match: ${this.topMatch.name} (${Math.round(this.topMatch.matchPercentage)}%). Mach auch den Test:`);
        },

        shareRadarCard() {
            if (!this.topMatch || this.topics.length === 0) return;
            const W = 1080, H = 1080;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            const matchColor = this.getPartyColor(this.topMatch.id);
            const n = this.topics.length;
            const cx = W / 2, cy = 480, r = 300;

            // Background
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, W, H);

            // Title
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 40px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Themen-Radar', W / 2, 70);
            ctx.fillStyle = '#64748b';
            ctx.font = '24px Inter, system-ui, sans-serif';
            ctx.fillText('Dein politisches Profil nach Themengebieten', W / 2, 110);

            // Grid rings
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
            [0.25, 0.5, 0.75, 1.0].forEach(frac => {
                ctx.beginPath();
                for (let i = 0; i <= n; i++) {
                    const angle = (Math.PI * 2 * (i % n) / n) - Math.PI / 2;
                    const rr = frac * r;
                    const x = cx + rr * Math.cos(angle);
                    const y = cy + rr * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.closePath(); ctx.stroke();
            });

            // Axes + labels
            ctx.fillStyle = '#64748b';
            ctx.font = '22px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            this.topics.forEach((topic, i) => {
                const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(cx, cy);
                ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle)); ctx.stroke();
                const labelR = r + 36;
                ctx.fillText(topic.split(/[\s,&]+/)[0], cx + labelR * Math.cos(angle), cy + labelR * Math.sin(angle));
            });

            // Polygon
            ctx.beginPath();
            this.topics.forEach((topic, i) => {
                const topicPct = (this.topicScores[topic]?.parties[this.topMatch.id]?.percent || 0) / 100;
                const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                const rr = topicPct * r;
                const x = cx + rr * Math.cos(angle);
                const y = cy + rr * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fillStyle = matchColor + '33'; ctx.fill();
            ctx.strokeStyle = matchColor; ctx.lineWidth = 3; ctx.stroke();

            // Legend
            ctx.fillStyle = matchColor;
            this._roundRectFill(ctx, W / 2 - 100, 840, 16, 16, 4);
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 22px Inter, system-ui, sans-serif';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText(this.topMatch.name + ' · ' + Math.round(this.topMatch.matchPercentage) + '%', W / 2 - 76, 849);

            // Watermark
            ctx.fillStyle = '#94a3b8';
            ctx.font = '20px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
            ctx.fillText('mucwahl.de · Kommunalwahl München 2026', W / 2, H - 30);

            this._shareCanvas(canvas, 'mucwahl-radar.png', 'Mein Themen-Radar',
                `Mein Themen-Radar zur Münchner Kommunalwahl 2026. Mach auch den Test:`);
        },

        shareSurpriseCard() {
            if (!this.surpriseMatches || this.surpriseMatches.length === 0) return;
            const surprise = this.surpriseMatches[0];
            const W = 1080, H = 1080;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            const matchColor = this.getPartyColor(surprise.id);

            // Background
            ctx.fillStyle = '#fffbeb';
            ctx.fillRect(0, 0, W, H);

            // Accent bar
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(0, 0, W, 8);

            // Lightbulb icon area
            ctx.fillStyle = '#fbbf24';
            ctx.font = '120px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💡', W / 2, 260);

            // Title
            ctx.fillStyle = '#92400e';
            ctx.font = 'bold 36px Inter, system-ui, sans-serif';
            ctx.fillText('Unerwartetes Match', W / 2, 360);

            // Party name
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 72px Inter, system-ui, sans-serif';
            ctx.fillText(surprise.name, W / 2, 520);

            // Percentage
            ctx.fillStyle = matchColor;
            ctx.font = 'bold 140px Inter, system-ui, sans-serif';
            ctx.fillText(Math.round(surprise.matchPercentage) + '%', W / 2, 720);

            // Subtitle
            ctx.fillStyle = '#92400e';
            ctx.font = '26px Inter, system-ui, sans-serif';
            ctx.fillText('Übereinstimmung', W / 2, 780);

            // Branding
            ctx.fillStyle = '#b45309';
            ctx.font = '22px Inter, system-ui, sans-serif';
            ctx.fillText('mucwahl.de · Kommunalwahl München 2026', W / 2, H - 40);

            this._shareCanvas(canvas, 'mucwahl-surprise.png', 'Mein Überraschungstreffer',
                `Mein Überraschungstreffer: ${surprise.name} (${Math.round(surprise.matchPercentage)}%). Mach auch den Test:`);
        },

        openShareSheet(preselect) {
            if (preselect) this.shareCard = preselect;
            this.shareSheetOpen = true;
            document.body.style.overflow = 'hidden';
        },

        closeShareSheet() {
            this.shareSheetOpen = false;
            document.body.style.overflow = '';
        },

        executeShare() {
            const card = this.shareCard;
            const format = this.shareFormat;

            if (card === 'results' && format === 'story') { this.shareResultsStory(); }
            else if (card === 'results') { this.shareResults(); }
            else if (card === 'topmatch') { this.shareTopMatchCard(); }
            else if (card === 'radar') { this.shareRadarCard(); }
            else if (card === 'compass') { this.shareCompass(); }
            else if (card === 'surprise') { this.shareSurpriseCard(); }

            this.closeShareSheet();
        },

        get hasNativeShare() {
            return !!(navigator.share);
        },

        shareViaWhatsApp() {
            const url = this.getShareUrl();
            const text = `Mein Wahl-Check für München: ${this.topMatch?.name} (${Math.round(this.topMatch?.matchPercentage)}%). Mach auch den Test: ${url}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            this.closeShareSheet();
        },

        shareViaTelegram() {
            const url = this.getShareUrl();
            const text = `Mein Wahl-Check für München: ${this.topMatch?.name} (${Math.round(this.topMatch?.matchPercentage)}%). Mach auch den Test!`;
            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
            this.closeShareSheet();
        },

        shareViaTwitter() {
            const url = this.getShareUrl();
            const text = `Mein Wahl-Check für München: ${this.topMatch?.name} (${Math.round(this.topMatch?.matchPercentage)}%). Mach auch den Test!`;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            this.closeShareSheet();
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

        // --- Feedback ---
        sendFeedback(answer) {
            this.feedbackGiven = true;
            localStorage.setItem('mucwahl_feedback', 'true');
            const formBase = 'https://docs.google.com/forms/d/e/1FAIpQLSfzHyCavD3Orj3BXsIUBdNsi3-R6KhFWJ1XDKgJfkJHOlxNzg/viewform';
            window.open(`${formBase}?usp=pp_url&entry.2079116199=${encodeURIComponent(answer)}`, '_blank', 'noopener');
        },

        initExitIntent() {
            if (localStorage.getItem('mucwahl_feedback')) { this.feedbackGiven = true; return; }
            let armed = false;
            setTimeout(() => { armed = true; }, 15000);
            document.addEventListener('mouseout', (e) => {
                if (!armed || this.exitIntentShown || this.feedbackGiven || this.step !== 99) return;
                if (e.clientY > 5 || e.relatedTarget || e.toElement) return;
                this.exitIntentShown = true;
            }, { passive: true });
        },

        dismissExitIntent() {
            this.exitIntentShown = false;
            localStorage.setItem('mucwahl_feedback', 'dismissed');
            this.feedbackGiven = true;
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
