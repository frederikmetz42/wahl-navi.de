function wahlomatApp() {
    return {
        step: 0,
        totalTheses: 0,
        theses: [],
        parties: [],
        answers: {}, // thesisId -> position (1, 0, -1)
        results: [],
        topMatch: null,
        selectedPartyId: null,
        modalOpen: false,
        detailFilter: 'all', // 'all', 'match', 'diff'
        userCoords: { x: 0, y: 0 },
        compassParties: [],
        shareTextStatus: '',

        init() {
            if (window.WAHLOMAT_DATA) {
                this.theses = window.WAHLOMAT_DATA.theses;
                this.parties = window.WAHLOMAT_DATA.parties;
                this.totalTheses = this.theses.length;
            } else {
                console.error("Daten nicht geladen!");
            }

            // Load from LocalStorage
            const saved = localStorage.getItem('wahlomat_answers');
            if (saved) {
                try {
                    this.answers = JSON.parse(saved);
                } catch(e) { console.error("Error loading saves", e); }
            }

            this.$watch('answers', val => {
                localStorage.setItem('wahlomat_answers', JSON.stringify(val));
            });
        },

        get currentThesis() {
            if (this.step < 1 || this.step > this.theses.length) return null;
            return this.theses[this.step - 1];
        },

        start() {
            this.step = 1;
            window.scrollTo(0,0);
            if (Object.keys(this.answers).length >= this.totalTheses) {
                this.calculateResults();
                this.step = 99;
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
                try {
                    this.calculateResults();
                    this.step = 99;
                } catch (e) {
                    console.error("Calculation error:", e);
                    alert("Fehler bei der Berechnung. Bitte neu laden.");
                }
            }
        },

        calculateResults() {
            try {
                const totalAnswered = Object.keys(this.answers).length;

                this.results = this.parties.map(party => {
                    let points = 0;
                    let maxPoints = totalAnswered * 2;

                    for (const [thesisId, userPos] of Object.entries(this.answers)) {
                        if (party.positions && party.positions[thesisId]) {
                            let partyPosData = party.positions[thesisId];
                            let partyPos = partyPosData.val !== undefined ? partyPosData.val : partyPosData.position;
                            let diff = Math.abs(userPos - partyPos);
                            points += (2 - diff);
                        } else {
                            // Missing position: treat as neutral (1 out of 2 points)
                            points += 1;
                        }
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
            // 1. Calculate User Coordinates
            let userX = 0, userY = 0;
            let weightSumX = 0, weightSumY = 0;

            for (const [thesisId, userPos] of Object.entries(this.answers)) {
                const thesis = this.theses.find(t => t.id == thesisId);
                if (thesis && thesis.axes) {
                    if (thesis.axes.x !== 0) {
                        userX += userPos * thesis.axes.x;
                        weightSumX += Math.abs(thesis.axes.x);
                    }
                    if (thesis.axes.y !== 0) {
                        userY += userPos * thesis.axes.y;
                        weightSumY += Math.abs(thesis.axes.y);
                    }
                }
            }

            // Normalize to -1...1
            this.userCoords = {
                x: weightSumX > 0 ? userX / weightSumX : 0,
                y: weightSumY > 0 ? userY / weightSumY : 0
            };

            // 2. Calculate Party Coordinates
            this.compassParties = this.parties.map(party => {
                let pX = 0, pY = 0;
                let pWeightX = 0, pWeightY = 0;

                this.theses.forEach(thesis => {
                    if (party.positions && party.positions[thesis.id] && thesis.axes) {
                        let partyPosData = party.positions[thesis.id];
                        let pos = partyPosData.val !== undefined ? partyPosData.val : partyPosData.position;

                        if (thesis.axes.x !== 0) {
                            pX += pos * thesis.axes.x;
                            pWeightX += Math.abs(thesis.axes.x);
                        }
                        if (thesis.axes.y !== 0) {
                            pY += pos * thesis.axes.y;
                            pWeightY += Math.abs(thesis.axes.y);
                        }
                    }
                });

                return {
                    id: party.id,
                    name: party.name,
                    x: pWeightX > 0 ? pX / pWeightX : 0,
                    y: pWeightY > 0 ? pY / pWeightY : 0
                };
            });
        },

        reset() {
            if(confirm("Möchten Sie wirklich neu starten? Ihre Antworten werden gelöscht.")) {
                this.step = 0;
                this.answers = {};
                this.results = [];
                this.topMatch = null;
                this.selectedPartyId = null;
                this.modalOpen = false;
                document.body.style.overflow = '';
                localStorage.removeItem('wahlomat_answers');
            }
        },

        openModal(id) {
            this.selectedPartyId = id;
            this.modalOpen = true;
            this.detailFilter = 'all';
            document.body.style.overflow = 'hidden';
        },

        closeModal() {
            this.modalOpen = false;
            this.selectedPartyId = null;
            document.body.style.overflow = '';
        },

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

        // Helpers
        getPartyPosition(party, thesisId) {
            if (!party || !party.positions || !party.positions[thesisId]) return null;
            return party.positions[thesisId].val;
        },

        getPartyQuote(party, thesisId) {
            if (!party || !party.positions || !party.positions[thesisId]) return null;
            return party.positions[thesisId].quote;
        },

        getIconSimple(value) {
            if (value === 1) return '<span class="text-emerald-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></span>';
            if (value === -1) return '<span class="text-rose-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></span>';
            return '<span class="text-slate-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg></span>';
        },

        getIcon(value) {
            if (value === 1) return '<span class="text-emerald-600 font-bold flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Zustimmung</span>';
            if (value === -1) return '<span class="text-rose-600 font-bold flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Ablehnung</span>';
            return '<span class="text-slate-500 font-bold flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg> Neutral</span>';
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
        },

        shareResults() {
            const top = this.topMatch ? this.topMatch.name : 'Unbekannt';
            const text = `Mein Top-Match beim Wahl-Navi München: ${top} (${Math.round(this.topMatch?.matchPercentage || 0)}%). Mach auch den Check: https://wahlnavi-muenchen.de`;

            if (navigator.share) {
                navigator.share({
                    title: 'Wahl-Navi München 2026',
                    text: text,
                    url: 'https://wahlnavi-muenchen.de'
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    this.shareTextStatus = 'In Zwischenablage kopiert!';
                    setTimeout(() => this.shareTextStatus = '', 3000);
                });
            }
        }
    }
}
