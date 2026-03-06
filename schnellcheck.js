function schnellcheck() {
    // Randomise display order for each question (primacy bias mitigation)
    function shuffleAB() {
        return Math.random() < 0.5 ? ['a', 'b'] : ['b', 'a'];
    }

    const questionDefs = [
        {
            id: 16, topic: 'Wirtschaft & Finanzen', title: 'Sparkurs oder Investition?',
            optionA: 'Haushalt konsolidieren und Neuverschuldung stoppen, auch wenn Projekte warten.',
            optionB: 'Weiter in Schulen, Wohnungsbau und Infrastruktur investieren, auch wenn die Schulden wachsen.',
            labelA: 'Sparsamkeit', labelB: 'Investition',
            aVal: 1, bVal: -1
        },
        {
            id: 8, topic: 'Wohnen & Mietmarkt', title: 'Städtisches Bauen: Nur bezahlbar oder auch Markt?',
            optionA: 'Münchner Wohnen soll ausschließlich bezahlbare Wohnungen bauen.',
            optionB: 'Münchner Wohnen soll auch marktübliche Wohnungen bauen, um sich teilweise selbst zu finanzieren.',
            labelA: 'Gemeinwohl', labelB: 'Rendite',
            aVal: 1, bVal: -1
        },
        {
            id: 5, topic: 'Mobilität & Verkehr', title: 'ÖPNV: Günstiger oder besser ausgebaut?',
            optionA: 'ÖPNV-Fahrpreise in München deutlich senken, auch wenn die Stadt dafür mehr Geld zuschießen muss.',
            optionB: 'ÖPNV-Fahrpreise stabil halten, damit das Geld in den Ausbau des Netzes fließen kann.',
            labelA: 'Sozial', labelB: 'Haushaltsdisziplin',
            aVal: 1, bVal: -1
        },
        {
            id: 7, topic: 'Wohnen & Mietmarkt', title: 'Wohnungen zurückkaufen oder neu bauen?',
            optionA: 'Die Stadt soll Wohnungen von Immobilienkonzernen zurückkaufen, um Mieten zu kontrollieren.',
            optionB: 'Die Stadt soll stattdessen Neubau und Regulierung stärken, statt Bestand teuer zurückzukaufen.',
            labelA: 'Staat', labelB: 'Markt',
            aVal: 1, bVal: -1
        },
        {
            id: 11, topic: 'Bauen, Klima & Stadtplanung', title: 'Neue Stadtquartiere am Stadtrand?',
            optionA: 'Neue Stadtquartiere am Stadtrand bauen, um Tausende Wohnungen zu schaffen.',
            optionB: 'Ackerflächen und Grünflächen im Stadtgebiet erhalten, auch wenn weniger gebaut wird.',
            labelA: 'Wohnraum', labelB: 'Naturschutz',
            aVal: 1, bVal: -1
        },
        {
            id: 12, topic: 'Bauen, Klima & Stadtplanung', title: 'Hochhäuser in München?',
            optionA: 'Hochhäuser über 100 Meter in München erlauben, um Platz effizienter zu nutzen.',
            optionB: 'Münchens Stadtbild bewahren und keine Hochhäuser über 100 Meter zulassen.',
            labelA: 'Flächeneffizienz', labelB: 'Stadtbild',
            aVal: 1, bVal: -1
        },
        {
            id: 22, topic: 'Gesellschaft, Migration & Sicherheit', title: 'Drogenkonsumräume einrichten?',
            optionA: 'Medizinisch begleitete Drogenkonsumräume einrichten, um Abhängige zu schützen.',
            optionB: 'Auf Prävention und Ordnungsmaßnahmen setzen statt Konsumräume zu eröffnen.',
            labelA: 'Hilfe', labelB: 'Ordnung',
            aVal: 1, bVal: -1
        },
        {
            id: 23, topic: 'Gesellschaft, Migration & Sicherheit', title: 'Ordnung oder Sozialarbeit?',
            optionA: 'Im öffentlichen Raum stärker durchgreifen: mehr Kontrollen, Platzverweise, Strafen.',
            optionB: 'Soziale Ursachen angehen statt Symptome zu bekämpfen: Streetwork, Beratung, Hilfsangebote.',
            labelA: 'Kontrolle', labelB: 'Prävention',
            aVal: 1, bVal: -1
        }
    ];

    // Add randomised display order to each question
    const questions = questionDefs.map(q => ({ ...q, displayOrder: shuffleAB() }));

    return {
        step: 0,
        questions: questions,
        answers: {},
        results: [],

        answer(thesisId, val) {
            this.answers[thesisId] = val;
        },

        nextStep() {
            this.step++;
            if (this.step > 8) {
                this.calculateResults();
                this.step = 99;
            }
        },

        calculateResults() {
            const data = window.WAHLOMAT_DATA;
            if (!data) return;

            this.results = data.parties.map(party => {
                let points = 0;
                let maxPoints = 0;

                for (const [thesisId, userPos] of Object.entries(this.answers)) {
                    const weight = (userPos === 0) ? 0.5 : 1;
                    if (party.positions && party.positions[thesisId]) {
                        const partyPos = party.positions[thesisId].val;
                        const diff = Math.abs(userPos - partyPos);
                        points += (2 - diff) * weight;
                    } else {
                        points += 1 * weight;
                    }
                    maxPoints += 2 * weight;
                }

                return {
                    id: party.id,
                    name: party.name,
                    pct: maxPoints > 0 ? (points / maxPoints) * 100 : 0
                };
            }).sort((a, b) => b.pct - a.pct);
        },

        getColor(id) {
            const colors = {
                'gruene': '#16a34a', 'spd': '#dc2626', 'csu': '#0284c7', 'fdp': '#ca8a04',
                'afd': '#0ea5e9', 'linke': '#db2777', 'volt': '#7c3aed', 'oedp': '#ea580c',
                'partei': '#334155', 'rosa_liste': '#ec4899', 'muenchen_liste': '#0f766e',
                'bp': '#1e3a8a', 'bk': '#be185d', 'fw': '#f59e0b'
            };
            return colors[id] || '#64748b';
        }
    };
}
