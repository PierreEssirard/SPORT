// =====================
// DONNÉES LOCALES
// =====================
let mesures = JSON.parse(localStorage.getItem('ft_mesures') || '[]');
let seances = JSON.parse(localStorage.getItem('ft_seances') || '[]');
let seanceEnCours = JSON.parse(localStorage.getItem('ft_seance_cours') || '[]');
let selectedMuscle = null;
let lastProg = null;

// Date du jour
const today = new Date();
document.getElementById('today-date').textContent = today.toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long'
});

// =====================
// NAVIGATION
// =====================
function showTab(name, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'stats') renderStats();
  if (name === 'seance') { renderSeance(); renderSeanceHistory(); }
  if (name === 'muscles') renderMuscles();
}

// Initialisation
renderStats();
renderSeanceHistory();
renderMuscles();

// =====================
// STATS
// =====================
function saveMesure() {
  const poids = parseFloat(document.getElementById('input-poids').value);
  const taille = parseFloat(document.getElementById('input-taille').value);
  const graisse = parseFloat(document.getElementById('input-graisse').value);
  const tourTaille = parseFloat(document.getElementById('input-taille-tour').value);
  const poitrine = parseFloat(document.getElementById('input-poitrine').value);
  const bras = parseFloat(document.getElementById('input-bras').value);

  if (!poids) { alert('Entrez au moins votre poids.'); return; }

  const imc = taille ? parseFloat((poids / Math.pow(taille / 100, 2)).toFixed(1)) : null;

  const mesure = {
    date: today.toLocaleDateString('fr-FR'),
    poids,
    taille: taille || null,
    graisse: graisse || null,
    tourTaille: tourTaille || null,
    poitrine: poitrine || null,
    bras: bras || null,
    imc
  };

  mesures.unshift(mesure);
  localStorage.setItem('ft_mesures', JSON.stringify(mesures));

  ['input-poids', 'input-taille', 'input-graisse', 'input-taille-tour', 'input-poitrine', 'input-bras']
    .forEach(id => { document.getElementById(id).value = ''; });

  renderStats();
}

function renderStats() {
  const statPoids = document.getElementById('stat-poids');
  const statImc = document.getElementById('stat-imc');
  const statGraisse = document.getElementById('stat-graisse');

  if (mesures.length > 0) {
    const last = mesures[0];
    statPoids.textContent = last.poids || '—';
    statImc.textContent = last.imc || '—';
    statGraisse.textContent = last.graisse ? last.graisse + '' : '—';
  }

  const list = document.getElementById('history-list');
  if (mesures.length === 0) {
    list.innerHTML = '<div class="empty-state">Aucune mesure enregistrée</div>';
    return;
  }

  list.innerHTML = mesures.slice(0, 10).map(m => `
    <div class="history-item">
      <div class="history-date">${m.date}</div>
      <div class="history-vals">
        ${m.poids ? `<span class="history-val">${m.poids} kg</span>` : ''}
        ${m.imc ? `<span class="history-val">IMC ${m.imc}</span>` : ''}
        ${m.graisse ? `<span class="history-val">${m.graisse}%</span>` : ''}
        ${m.tourTaille ? `<span class="history-val">⌀ ${m.tourTaille}cm</span>` : ''}
      </div>
    </div>
  `).join('');
}

// =====================
// PROGRAMME IA
// =====================
async function genererProgramme() {
  const objectif = document.getElementById('prog-objectif').value;
  const seancesN = document.getElementById('prog-seances').value;
  const niveau = document.getElementById('prog-niveau').value;
  const notes = document.getElementById('prog-notes').value;
  const resultat = document.getElementById('ai-result');

  resultat.innerHTML = `
    <div class="card">
      <div class="ai-loading">
        <div class="dot-pulse"><span></span><span></span><span></span></div>
        Génération du programme…
      </div>
    </div>`;

  const prompt = `Tu es un coach sportif expert en salle de sport. Génère un programme d'entraînement détaillé en JSON uniquement (sans markdown, sans backticks, sans texte avant ou après).

Paramètres:
- Objectif: ${objectif}
- Séances par semaine: ${seancesN}
- Niveau: ${niveau}
- Notes spécifiques: ${notes || 'aucune'}

Réponds UNIQUEMENT avec ce JSON valide:
{
  "titre": "nom du programme",
  "description": "courte description motivante",
  "jours": [
    {
      "jour": "Lundi",
      "focus": "groupe musculaire principal",
      "exercices": [
        {
          "nom": "nom de l'exercice",
          "machine": "nom exact de la machine ou du matériel",
          "series": 4,
          "repetitions": "10-12",
          "repos": "90s",
          "conseil": "conseil technique court et pratique"
        }
      ]
    }
  ]
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    const text = data.content.map(b => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const prog = JSON.parse(clean);
    lastProg = prog;
    renderProgramme(prog);

  } catch (e) {
    resultat.innerHTML = `<div class="card"><div class="error-msg">Erreur lors de la génération. Vérifie ta connexion et réessaie.</div></div>`;
    console.error(e);
  }
}

function renderProgramme(prog) {
  const el = document.getElementById('ai-result');
  el.innerHTML = `
    <div class="card">
      <div class="prog-titre">${prog.titre}</div>
      <div class="prog-desc">${prog.description}</div>
      ${prog.jours.map(j => `
        <div style="margin-bottom:18px">
          <div class="prog-jour-label">${j.jour} — ${j.focus}</div>
          ${j.exercices.map(e => `
            <div class="exercise-card">
              <div class="exercise-name">${e.nom}</div>
              <div class="exercise-machine">Machine: ${e.machine}</div>
              <div class="exercise-meta" style="margin-top:6px">
                <span class="exercise-tag">${e.series} séries</span>
                <span class="exercise-tag">${e.repetitions} reps</span>
                <span class="exercise-tag">Repos ${e.repos}</span>
              </div>
              ${e.conseil ? `<div class="conseil-text">${e.conseil}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `).join('')}
      <div class="btn-row" style="margin-top:8px">
        <button class="btn primary" style="width:100%" onclick="loadProgrammeInSeance()">Charger le jour 1 dans Ma Séance →</button>
      </div>
    </div>
  `;
}

function loadProgrammeInSeance() {
  if (!lastProg || !lastProg.jours) return;
  seanceEnCours = lastProg.jours[0].exercices.map(e => ({
    nom: e.nom,
    machine: e.machine,
    series: parseInt(e.series) || 3,
    reps: e.repetitions,
    sets: []
  }));
  localStorage.setItem('ft_seance_cours', JSON.stringify(seanceEnCours));

  // Switcher vers l'onglet séance
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="seance"]').classList.add('active');
  showTab('seance', null);
}

// =====================
// SÉANCE
// =====================
function renderSeance() {
  const container = document.getElementById('seance-exercises');
  if (seanceEnCours.length === 0) {
    container.innerHTML = '<div class="empty-state">Génère un programme ou ajoute des exercices</div>';
    return;
  }

  container.innerHTML = seanceEnCours.map((ex, i) => `
    <div class="exercise-card" id="ex-card-${i}">
      <div class="exercise-name">${ex.nom}</div>
      <div class="exercise-machine">Machine: ${ex.machine || '—'}</div>
      <div style="margin-top:12px">
        ${Array.from({ length: ex.series || 3 }, (_, s) => `
          <div class="set-row">
            <span class="set-label">Série ${s + 1}</span>
            <input type="number" placeholder="reps" id="reps-${i}-${s}" min="0">
            <span class="set-x">×</span>
            <input type="number" placeholder="kg" id="poids-${i}-${s}" min="0" step="0.5">
            <span style="font-size:12px;color:var(--text-sec)">kg</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function addExerciceManuel() {
  const nom = prompt('Nom de l\'exercice ?');
  if (!nom) return;
  const machine = prompt('Machine ou matériel ?') || '—';
  const seriesStr = prompt('Nombre de séries ? (défaut: 3)') || '3';
  const series = parseInt(seriesStr) || 3;

  seanceEnCours.push({ nom, machine, series, reps: '10-12', sets: [] });
  localStorage.setItem('ft_seance_cours', JSON.stringify(seanceEnCours));
  renderSeance();
}

function sauvegarderSeance() {
  if (seanceEnCours.length === 0) {
    alert('Aucun exercice dans la séance.');
    return;
  }

  const exercicesLog = seanceEnCours.map((ex, i) => {
    const sets = Array.from({ length: ex.series || 3 }, (_, s) => {
      const repsEl = document.getElementById(`reps-${i}-${s}`);
      const poidsEl = document.getElementById(`poids-${i}-${s}`);
      return {
        reps: repsEl ? repsEl.value : '',
        poids: poidsEl ? poidsEl.value : ''
      };
    });
    return { nom: ex.nom, machine: ex.machine, sets };
  });

  const seance = {
    date: today.toLocaleDateString('fr-FR'),
    exercices: exercicesLog
  };

  seances.unshift(seance);
  localStorage.setItem('ft_seances', JSON.stringify(seances));
  seanceEnCours = [];
  localStorage.setItem('ft_seance_cours', '[]');

  alert('Séance sauvegardée !');
  renderSeance();
  renderSeanceHistory();
}

function renderSeanceHistory() {
  const container = document.getElementById('seance-history');
  if (seances.length === 0) {
    container.innerHTML = '<div class="empty-state">Aucune séance enregistrée</div>';
    return;
  }

  container.innerHTML = seances.slice(0, 6).map(s => `
    <div class="seance-hist-item">
      <div>
        <div class="seance-hist-date">${s.date}</div>
        <div class="seance-hist-sub">${s.exercices.length} exercice(s)</div>
      </div>
      <div class="seance-hist-right">
        ${s.exercices.slice(0, 2).map(e => e.nom).join(', ')}${s.exercices.length > 2 ? '…' : ''}
      </div>
    </div>
  `).join('');
}

// =====================
// MACHINES PAR MUSCLE
// =====================
const machinesData = {
  'Pectoraux': [
    { nom: 'Développé couché', machine: 'Banc plat + barre', serie: '4×8-12', conseil: 'Coudes à 45° du corps, descendre jusqu\'à effleurer le sternum.' },
    { nom: 'Développé incliné haltères', machine: 'Banc incliné + haltères', serie: '3×10-12', conseil: 'Angle 30-45°, contrôle de la descente.' },
    { nom: 'Écartés aux câbles', machine: 'Machine câbles croisés', serie: '3×12-15', conseil: 'Légère flexion des coudes, tension constante.' },
    { nom: 'Pec-deck / Papillon', machine: 'Machine pec-deck', serie: '3×12-15', conseil: 'Contraction maximale au centre, pause 1s.' },
  ],
  'Dos': [
    { nom: 'Tirage poitrine', machine: 'Machine lat pulldown', serie: '4×10-12', conseil: 'Tirer vers le sternum, omoplattes serrées.' },
    { nom: 'Rowing machine', machine: 'Machine rowing assise', serie: '4×10-12', conseil: 'Dos droit, serrer les omoplattes en fin de mouvement.' },
    { nom: 'Tirage horizontal câble', machine: 'Câble basse poulie + triangle', serie: '3×12', conseil: 'Expirer à la traction, ne pas arrondir le dos.' },
    { nom: 'Hyperextensions', machine: 'Banc à lombaires', serie: '3×15', conseil: 'Ne pas dépasser l\'horizontale, contraction en haut.' },
  ],
  'Épaules': [
    { nom: 'Développé militaire machine', machine: 'Machine développé épaules', serie: '4×10-12', conseil: 'Ne pas verrouiller les coudes en extension.' },
    { nom: 'Élévations latérales', machine: 'Haltères ou machine dédiée', serie: '3×15', conseil: 'Légère avancée du buste, coudes légèrement fléchis.' },
    { nom: 'Face pull', machine: 'Câble haute poulie + corde', serie: '3×15-20', conseil: 'Tirer vers le visage, coudes à hauteur des épaules.' },
    { nom: 'Oiseau / élévations arrière', machine: 'Machine pec-deck à l\'envers', serie: '3×15', conseil: 'Amplitude contrôlée, ne pas balancer.' },
  ],
  'Biceps': [
    { nom: 'Curl barre EZ', machine: 'Barre EZ + disques', serie: '3×10-12', conseil: 'Coudes fixes contre le corps, supination complète.' },
    { nom: 'Curl poulie basse', machine: 'Câble basse poulie + barre droite', serie: '3×12', conseil: 'Tension constante tout au long du mouvement.' },
    { nom: 'Curl marteau', machine: 'Haltères', serie: '3×12', conseil: 'Prise neutre, pouce vers le plafond.' },
    { nom: 'Curl concentré', machine: 'Haltère + banc', serie: '3×12', conseil: 'Coude posé sur la cuisse, isolation maximale.' },
  ],
  'Triceps': [
    { nom: 'Pushdown câble barre droite', machine: 'Câble haute poulie + barre droite', serie: '3×12-15', conseil: 'Coudes fixes le long du corps, extension totale.' },
    { nom: 'Pushdown corde', machine: 'Câble haute poulie + corde', serie: '3×12-15', conseil: 'Écarter la corde en bas, supination des poignets.' },
    { nom: 'Extension nuque câble', machine: 'Câble + corde ou haltère', serie: '3×12', conseil: 'Coudes proches des oreilles, amplitude complète.' },
    { nom: 'Dips machine assistée', machine: 'Machine dips assistés', serie: '3×10', conseil: 'Légère inclinaison avant pour cibler plus les pecs.' },
  ],
  'Quadriceps': [
    { nom: 'Presse à cuisses', machine: 'Leg press', serie: '4×10-12', conseil: 'Pieds écartés largeur épaules, descendre à 90°.' },
    { nom: 'Leg extension', machine: 'Machine leg extension', serie: '3×12-15', conseil: 'Contraction maximale en extension, contrôle de la descente.' },
    { nom: 'Squat guidé', machine: 'Smith machine', serie: '4×8-10', conseil: 'Pieds légèrement avancés, descendre sous le parallèle.' },
    { nom: 'Hack squat', machine: 'Machine hack squat', serie: '3×10-12', conseil: 'Dos bien plaqué contre le dossier, pieds bas.' },
  ],
  'Ischio-jambiers': [
    { nom: 'Leg curl allongé', machine: 'Machine leg curl couché', serie: '3×12', conseil: 'Flexion complète, ne pas décoller les hanches.' },
    { nom: 'Leg curl assis', machine: 'Machine leg curl assis', serie: '3×12', conseil: 'Genou à 90° en position basse, contraction en haut.' },
    { nom: 'Romanian deadlift', machine: 'Barre + plaques ou haltères', serie: '3×10', conseil: 'Dos plat, hanches reculées, tension dans les ischio.' },
  ],
  'Fessiers': [
    { nom: 'Hip thrust', machine: 'Machine hip thrust ou banc + barre', serie: '4×12', conseil: 'Extension complète des hanches, contraction en haut.' },
    { nom: 'Abducteurs machine', machine: 'Machine abducteurs', serie: '3×15-20', conseil: 'Mouvement lent et contrôlé, pause en extension.' },
    { nom: 'Kickback câble', machine: 'Câble basse poulie + sangle cheville', serie: '3×15', conseil: 'Genou légèrement fléchi, pas de rotation du bassin.' },
    { nom: 'Bulgarian split squat', machine: 'Banc + haltères', serie: '3×10 / jambe', conseil: 'Genou avant dans l\'axe du pied, dos droit.' },
  ],
  'Mollets': [
    { nom: 'Mollets debout machine', machine: 'Machine mollets standing', serie: '4×15-20', conseil: 'Amplitude complète, descente lente, montée explosive.' },
    { nom: 'Mollets assis machine', machine: 'Machine mollets seated', serie: '3×15-20', conseil: 'Isole le soléaire, étirement complet en bas.' },
  ],
  'Abdominaux': [
    { nom: 'Crunch machine', machine: 'Machine crunch abdominaux', serie: '3×15-20', conseil: 'Expirer à la contraction, mouvement contrôlé.' },
    { nom: 'Relevé de jambes', machine: 'Station à bras / barre de traction', serie: '3×12', conseil: 'Dos plaqué contre le support, jambes tendues ou fléchies.' },
    { nom: 'Rotation obliques câble', machine: 'Câble avec corde', serie: '3×15', conseil: 'Rotation des hanches, coudes stables.' },
    { nom: 'Planche', machine: 'Au sol', serie: '3×45s', conseil: 'Corps aligné de la tête aux talons, respiration régulière.' },
  ],
};

function renderMuscles() {
  const grid = document.getElementById('muscle-grid');
  grid.innerHTML = Object.keys(machinesData).map(m => `
    <button class="muscle-btn ${selectedMuscle === m ? 'selected' : ''}" onclick="selectMuscle('${m}')">${m}</button>
  `).join('');

  if (selectedMuscle) {
    renderMachineList();
  } else {
    document.getElementById('machine-list').innerHTML = '';
  }
}

function selectMuscle(muscle) {
  selectedMuscle = selectedMuscle === muscle ? null : muscle;
  renderMuscles();
}

function renderMachineList() {
  const container = document.getElementById('machine-list');
  const exercises = machinesData[selectedMuscle] || [];

  container.innerHTML = `
    <div class="machine-divider">
      <div class="machine-section-label">${selectedMuscle}</div>
      ${exercises.map(e => `
        <div class="exercise-card">
          <div class="exercise-name">${e.nom}</div>
          <div class="exercise-machine">Machine: ${e.machine}</div>
          <div class="exercise-meta" style="margin-top:6px">
            <span class="exercise-tag">${e.serie}</span>
          </div>
          <div class="conseil-text">${e.conseil}</div>
          <div style="margin-top:10px">
            <button class="btn" style="width:100%;font-size:12px" onclick="addToSeance('${escapeQ(e.nom)}', '${escapeQ(e.machine)}')">
              + Ajouter à la séance
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addToSeance(nom, machine) {
  seanceEnCours.push({ nom, machine, series: 3, reps: '12', sets: [] });
  localStorage.setItem('ft_seance_cours', JSON.stringify(seanceEnCours));

  const btn = event.target;
  btn.textContent = '✓ Ajouté';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '+ Ajouter à la séance';
    btn.disabled = false;
  }, 1500);
}

function escapeQ(str) {
  return str.replace(/'/g, "\\'");
}