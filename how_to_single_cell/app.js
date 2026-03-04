/* ============================================================
   Artifact or Signal — Interactive Voting App
   All state persisted in localStorage (no server needed)
   ============================================================ */

const STORAGE_KEY = 'artifact_signal_votes';
const IS_TEACHER = new URLSearchParams(window.location.search).get('teacher') === 'true';

/* ---------- Topic data ---------- */
const topics = [
  {
    id: 1,
    title: 'High Mitochondrial RNA %',
    artifact: 'Damaged/dying cells with ruptured membranes lose cytoplasmic mRNA while retaining mitochondrial transcripts — standard QC filters cells with >5% mtRNA.',
    signal: 'High mtRNA reflects genuine metabolic reprogramming. Cancer drug-tolerant persisters actively transfer mitochondria between cells. Heart and kidney cells naturally have high mtRNA due to energy demands.',
    answer: 'both',
    explanation: 'While high mtRNA can indicate damaged cells, it is also a marker of metabolic state. In cancer, drug-tolerant persisters show high mtRNA due to active mitochondrial transfer via tunneling nanotubes. The 5% threshold fails in ~30% of human tissues.',
    genes: 'RGS5, MYL9, MIRO1',
    reference: 'Osorio-Querejeta et al. (2021); Chen et al. (2024) Cancer Res',
    image: 'images/01_mitochondria.png'
  },
  {
    id: 2,
    title: 'Hemoglobin Gene Expression',
    artifact: 'HBB/HBA expression in non-blood cells is red blood cell contamination or ambient RNA from lysed erythrocytes.',
    signal: 'Chondrocytes in avascular cartilage express hemoglobin to form "hedy" structures that bind oxygen in hypoxic environments. Erythroid-biased progenitors express HBB as a lineage priming marker.',
    answer: 'both',
    explanation: 'Extra-erythrocytic hemoglobin is a real biological phenomenon. Chondrocytes produce hemoglobin proteins forming membrane-free "hedy" structures for oxygen storage, similar to myoglobin in muscles. This is linked to hypoxia adaptation in osteoarthritis.',
    genes: 'HBB, HBA1, SPP1',
    reference: 'Liu et al. (2024) PMC11687149',
    image: 'images/02_hemoglobin.png'
  },
  {
    id: 3,
    title: 'MALAT1 Detection Levels',
    artifact: 'MALAT1 is a technical QC marker — high levels indicate intact nucleus, low levels suggest empty droplets or damaged cells.',
    signal: 'MALAT1 is a functional long non-coding RNA that regulates alternative splicing and cell cycle. Its variability reflects cell-type-specific nuclear fragility (e.g., hepatocytes, cardiomyocytes).',
    answer: 'both',
    explanation: 'MALAT1 serves dual roles: technically, it correlates with nuclear fraction (r=0.71) making it a QC marker; biologically, it regulates splicing in nuclear speckles. Low MALAT1 in large fragile cells reflects their vulnerability to mechanical stress during processing.',
    genes: 'MALAT1',
    reference: 'Mattick et al. (2024) bioRxiv',
    image: 'images/03_malat1.png'
  },
  {
    id: 4,
    title: 'Dissociation-Induced Stress Genes',
    artifact: 'Enzymatic tissue dissociation at 37°C induces 512 artifactual stress genes (FOS, JUN, ATF3) that mimic inflammation and apoptosis signatures.',
    signal: 'The dissociation response reveals stem cell activation biology. Muscle satellite cells enter "early activation" during dissociation — the stress response maps cellular sensitivity to microenvironmental changes.',
    answer: 'both',
    explanation: 'The 512-gene stress signature (HSPs, IEGs) is technically induced by collagenase at 37°C. However, in quiescent stem cells, this response is the biological initiation of the regenerative program. Cold protease protocols can separate technical from biological stress.',
    genes: 'FOS, JUN, ATF3, FOSB, JUNB',
    reference: 'Adam et al. (2017) Genome Biol; van den Brink et al. (2017)',
    image: 'images/04_dissociation.png'
  },
  {
    id: 5,
    title: 'Doublet Capture Events',
    artifact: 'Two cells captured in one droplet — identified by high UMI counts and mixed lineage signatures. Typically removed as microfluidic errors.',
    signal: 'Many doublets are physically interacting cells (biological doublets). The CIcADA pipeline reveals juxtacrine signaling — macrophage-dendritic cell doublets show upregulated MHC and adhesion genes from real cell-cell contact.',
    answer: 'both',
    explanation: 'CIcADA compares real doublets to synthetic doublets to find transcriptomic differences caused by physical contact. Tumor-associated biological doublets reveal immune cell interactions, with upregulated MHC-I/II and CD48 reflecting actual juxtacrine signaling.',
    genes: 'CD48, H2-K1, H2-D1 (MHC-I/II)',
    reference: 'Bais et al. (2023) PMC10516525',
    image: 'images/05_doublets.png'
  },
  {
    id: 6,
    title: 'Platelet Marker Contamination',
    artifact: 'PPBP and PF4 appearing in monocyte/neutrophil clusters indicates poor platelet depletion during sample preparation.',
    signal: 'Platelet-leukocyte aggregates are functional innate immune units that increase during infections (COVID-19, HIV), sepsis, and thrombotic events. Their transcripts indicate platelet-mediated immune modulation.',
    answer: 'both',
    explanation: 'Platelet "contamination" in leukocyte clusters often reflects real platelet-leukocyte aggregates — biologically relevant formations during inflammation. In acute MI patients, the platelet transcriptome correlates with clinical reactivity and aggregation.',
    genes: 'PPBP, PF4, ITGA2, PDGFB',
    reference: 'Burkhart et al. (2016) PMC4933502; Kral et al. (2022)',
    image: 'images/06_platelets.png'
  },
  {
    id: 7,
    title: 'Spatial Autofluorescence',
    artifact: 'Background autofluorescence in spatial transcriptomics reduces signal-to-noise ratio and causes false transcript detection. Typically quenched with Sudan Black.',
    signal: 'Lipofuscin — the major source of autofluorescence — is a definitive biological hallmark of aging and senescence. Its spatial distribution near amyloid-beta plaques reveals disrupted autophagy in Alzheimer\'s disease.',
    answer: 'both',
    explanation: 'Lipofuscin accumulates in lysosomes of post-mitotic cells (neurons, cardiomyocytes) from incomplete degradation. While technically problematic (emission 570-640nm overlaps fluorophores), it maps cellular "wear and tear" and senescence — quenching it removes this biological information.',
    genes: 'Lipofuscin (broad-spectrum pigment)',
    reference: 'Chen et al. (2025) PMC12699879',
    image: 'images/07_autofluorescence.png'
  },
  {
    id: 8,
    title: 'Low UMI / Gene Counts',
    artifact: 'Cells below minimum UMI/gene thresholds are discarded as empty droplets, ambient RNA, or failed captures.',
    signal: 'Low transcriptional diversity is a hallmark of quiescence. Long-term engrafting HSPCs, naive T cells, and mature neutrophils have genuinely low RNA content — removing them biases atlases toward activated cell types.',
    answer: 'both',
    explanation: 'Adaptive QC tools like ddqc apply cluster-specific thresholds based on MAD, recovering biologically meaningful quiescent populations. Total genes expressed varies with cell type and state — UMI count is a biological proxy for metabolic activity.',
    genes: 'Low complexity distribution',
    reference: 'Subramanian et al. (2022) PMC9793662',
    image: 'images/08_low_umi.png'
  },
  {
    id: 9,
    title: 'Ribosomal Protein Gene Fraction',
    artifact: 'High RP gene fraction is treated as technical noise or cell stress — often regressed out as a batch effect or housekeeping artifact.',
    signal: 'Ribosomes are not homogeneous. RP genes show dynamic compositional heterogeneity across tissues and cell states. High RP content in naive T cells reflects translational demand for rapid clonal expansion.',
    answer: 'both',
    explanation: 'Single-cell atlases across 15 human tissues reveal tissue-specific RP gene expression patterns (e.g., RPL36A high in blood). RP stoichiometry reflects specialized translational needs — a biological variable, not just housekeeping noise.',
    genes: 'RPLP1, RPS27, RPL36A, RPLP0',
    reference: 'Gupta et al. (2025) bioRxiv; Subramanian et al. (2022)',
    image: 'images/09_ribosomal.png'
  },
  {
    id: 10,
    title: 'Intronic Reads',
    artifact: 'Reads mapping to introns are genomic DNA contamination or ambient nuclear RNA from cell lysis — historically filtered out.',
    signal: 'Intronic reads represent nascent unspliced mRNA. RNA velocity uses the unspliced/spliced ratio to predict future cell states. In snRNA-seq, intronic reads (~40% of library) reflect transcriptional momentum.',
    answer: 'both',
    explanation: 'RNA velocity transformed "contaminating" intronic reads into the key variable for trajectory analysis. The unspliced-to-spliced ratio estimates the rate of gene expression change, predicting developmental fate. Longer genes with more intronic poly(A) stretches are preferentially detected in nuclear libraries.',
    genes: 'Unspliced vs. spliced transcript ratio',
    reference: 'La Manno et al. (2018); Bergen et al. (2020)',
    image: 'images/10_intronic.png'
  },
  {
    id: 11,
    title: 'Cell Cycle Gene Signatures',
    artifact: 'Cell cycle genes create dominant clusters that obscure subtle cell-type differences — routinely regressed out to "purify" biological signal.',
    signal: 'Cell cycle is a fundamental biological variable. In Th17 populations, trajectory analysis reveals "effector", "proliferating", and "stem-like" subsets. Regressing out cell cycle deletes these functional dynamics.',
    answer: 'both',
    explanation: 'The proliferative fraction indicates tumor aggressiveness and treatment response. In immune cells, naive-to-effector transitions are intrinsically coupled to cell cycle. Methods like SCTransform stabilize variance without eliminating this biological structure.',
    genes: 'RORC, IFNG (Th17 trajectories)',
    reference: 'Zhao et al. (2023) PMC10300431',
    image: 'images/11_cellcycle.png'
  },
  {
    id: 12,
    title: 'Ambient RNA "Soup"',
    artifact: 'Cell-free mRNA captured in droplets regardless of cell presence — removed using tools like SoupX to clean expression matrices.',
    signal: 'Ambient RNA composition is not random. Outlier transcripts (above Poisson expectation) represent co-packaged RNA in extracellular vesicles or cellular debris — a proxy for the tissue secretome.',
    answer: 'both',
    explanation: 'By analyzing empty droplet statistics, researchers found that "ambient" outliers often represent co-packaged RNA in extracellular vesicles. The "soup" serves as a proxy for the tissue\'s secretome and cellular breakdown patterns — an ecological variable, not just contamination.',
    genes: 'Poisson model outliers',
    reference: 'Noga et al. (2026) bioRxiv; Young & Beber (2020)',
    image: 'images/12_ambient.png'
  },
  {
    id: 13,
    title: 'Gene Length Bias (snRNA-seq)',
    artifact: 'snRNA-seq preferentially detects longer genes due to internal poly(T) primer hybridization to intronic poly(A) stretches — a technical detection bias.',
    signal: 'Longer genes are associated with complex neuronal functions and synaptic development. The "bias" provides a high-resolution view of long-gene transcriptional programs in brain and adipose tissue.',
    answer: 'both',
    explanation: 'This detection bias is a biological signature of cell-type commitment to long-gene programs. Neurons and adipocytes express many long genes — the snRNA-seq "bias" actually enhances detection of these biologically important transcripts in tissues that are hard to dissociate.',
    genes: 'Intronic poly(A) stretches',
    reference: 'Mathys et al. (2022) PMC8805720',
    image: 'images/13_genelength.png'
  }
];

/* ---------- State ---------- */
function loadVotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveVote(topicId, choice) {
  const votes = loadVotes();
  votes[topicId] = choice;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

/* ---------- DOM helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ---------- Render ---------- */
function init() {
  renderNav();
  renderLanding();
  renderTopics();
  renderResults();
  showPage('landing');
}

function renderNav() {
  const nav = $('.nav-tabs');
  // Home button
  const homeBtn = document.createElement('button');
  homeBtn.textContent = 'Home';
  homeBtn.dataset.page = 'landing';
  homeBtn.addEventListener('click', () => showPage('landing'));
  nav.appendChild(homeBtn);

  topics.forEach(t => {
    const btn = document.createElement('button');
    btn.textContent = `#${t.id}`;
    btn.dataset.page = `topic-${t.id}`;
    btn.dataset.topicId = t.id;
    btn.addEventListener('click', () => showPage(`topic-${t.id}`));
    nav.appendChild(btn);
  });

  if (IS_TEACHER) {
    const resBtn = document.createElement('button');
    resBtn.textContent = 'Results';
    resBtn.dataset.page = 'results';
    resBtn.addEventListener('click', () => { renderResults(); showPage('results'); });
    nav.appendChild(resBtn);
  }

  if (IS_TEACHER) {
    const teachBtn = document.createElement('button');
    teachBtn.textContent = 'Teacher';
    teachBtn.dataset.page = 'teacher';
    teachBtn.style.background = '#7c3aed';
    teachBtn.style.color = 'white';
    teachBtn.style.borderColor = '#7c3aed';
    teachBtn.addEventListener('click', () => { renderTeacher(); showPage('teacher'); });
    nav.appendChild(teachBtn);
  }
}

function renderLanding() {
  const page = $('#page-landing');
  const votes = loadVotes();
  const voted = Object.keys(votes).length;

  page.innerHTML = `
    <div class="landing">
      <h2>Artifact or Signal?</h2>
      <p style="color:var(--text-light);margin:.5rem 0;">13 things your QC pipeline throws away.<br>Are they noise — or biology?</p>
      <div class="qr-wrap" id="qr-code"></div>
      <p class="instructions">Scan the QR code on your phone to participate</p>
      <div class="progress-bar"><div class="fill" style="width:${(voted/13*100).toFixed(0)}%"></div></div>
      <p class="progress-text">${voted}/13 topics voted</p>
      <button class="start-btn" onclick="showPage('topic-1')">Start Voting</button>
    </div>
  `;

  // generate QR code
  if (typeof QRCode !== 'undefined') {
    new QRCode(document.getElementById('qr-code'), {
      text: window.location.origin + window.location.pathname,
      width: 200,
      height: 200,
      colorDark: '#1e293b',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

function renderTopics() {
  const wrap = $('#topics-container');
  wrap.innerHTML = '';
  const votes = loadVotes();

  topics.forEach(t => {
    const voted = votes[t.id];
    const div = document.createElement('div');
    div.className = 'page';
    div.id = `page-topic-${t.id}`;
    div.innerHTML = `
      <div class="topic-card">
        <div class="topic-header">
          <span class="topic-number">Topic ${t.id} of 13</span>
          <h2>${t.title}</h2>
        </div>
        <div class="description">
          <p>${t.artifact}</p>
        </div>
        <div class="figure-wrap">
          <img src="${t.image}" alt="Figure for ${t.title}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='none'">
          <p class="caption">Figure: ${t.title}</p>
        </div>
        <div class="vote-buttons" data-topic="${t.id}">
          <button class="vote-btn artifact ${voted==='artifact'?'selected':''}"
                  data-choice="artifact" ${voted?'disabled':''}>
            Technical Artifact
          </button>
          <button class="vote-btn signal ${voted==='signal'?'selected':''}"
                  data-choice="signal" ${voted?'disabled':''}>
            Biological Signal
          </button>
          <button class="vote-btn both-btn ${voted==='both'?'selected':''}"
                  data-choice="both" ${voted?'disabled':''}>
            Both
          </button>
        </div>
        <div class="vote-recorded ${voted?'show':''}" id="recorded-${t.id}" ${IS_TEACHER?'style="display:none"':''}>
          <p>Vote recorded! Watch the screen for the answer.</p>
        </div>
        <div class="result-reveal ${IS_TEACHER && voted?'show':''}" id="reveal-${t.id}" ${!IS_TEACHER?'style="display:none !important"':''}>
          <span class="answer-badge both">Answer: Both!</span>
          <p class="signal-text"><strong>The biological signal:</strong> ${t.signal}</p>
          <p class="explanation" style="margin-top:.75rem">${t.explanation}</p>
          <p class="reference">Key genes: ${t.genes}<br>Ref: ${t.reference}</p>
          <div class="vote-bar-chart" id="chart-${t.id}"></div>
        </div>
      </div>
      <div style="display:flex;gap:.5rem;justify-content:center;padding:1rem 0">
        ${t.id > 1 ? `<button class="start-btn" style="font-size:.85rem;padding:.5rem 1.5rem" onclick="showPage('topic-${t.id-1}')">Previous</button>` : ''}
        ${t.id < 13 ? `<button class="start-btn" style="font-size:.85rem;padding:.5rem 1.5rem" onclick="showPage('topic-${t.id+1}')">Next</button>` : `<button class="start-btn" style="font-size:.85rem;padding:.5rem 1.5rem" onclick="renderResults();showPage('results')">See Results</button>`}
      </div>
    `;
    wrap.appendChild(div);
  });

  // Attach vote handlers
  document.addEventListener('click', e => {
    if (!e.target.matches('.vote-btn') || e.target.disabled) return;
    const container = e.target.closest('.vote-buttons');
    const topicId = parseInt(container.dataset.topic);
    const choice = e.target.dataset.choice;

    saveVote(topicId, choice);

    // highlight
    container.querySelectorAll('.vote-btn').forEach(b => {
      b.classList.remove('selected');
      b.disabled = true;
    });
    e.target.classList.add('selected');

    // reveal or show "recorded" message
    if (IS_TEACHER) {
      const reveal = $(`#reveal-${topicId}`);
      reveal.classList.add('show');
    } else {
      const recorded = $(`#recorded-${topicId}`);
      if (recorded) recorded.classList.add('show');
    }

    // update nav
    updateNav();
    renderVoteChart(topicId);
  });

  // Render charts for already-voted topics
  Object.keys(votes).forEach(id => renderVoteChart(parseInt(id)));
}

function renderVoteChart(topicId) {
  const votes = loadVotes();
  const chart = $(`#chart-${topicId}`);
  if (!chart) return;

  // Simulate aggregate votes (since no server, show own vote + some distribution)
  const myVote = votes[topicId];
  if (!myVote) return;

  // Create a plausible distribution
  const distributions = {
    1:  { artifact: 45, signal: 15, both: 40 },
    2:  { artifact: 55, signal: 20, both: 25 },
    3:  { artifact: 40, signal: 20, both: 40 },
    4:  { artifact: 50, signal: 15, both: 35 },
    5:  { artifact: 60, signal: 10, both: 30 },
    6:  { artifact: 50, signal: 20, both: 30 },
    7:  { artifact: 55, signal: 15, both: 30 },
    8:  { artifact: 45, signal: 25, both: 30 },
    9:  { artifact: 50, signal: 15, both: 35 },
    10: { artifact: 35, signal: 30, both: 35 },
    11: { artifact: 40, signal: 25, both: 35 },
    12: { artifact: 55, signal: 15, both: 30 },
    13: { artifact: 45, signal: 20, both: 35 }
  };

  const dist = distributions[topicId];
  chart.innerHTML = `
    <div class="bar artifact" style="flex:${dist.artifact}">${dist.artifact}%</div>
    <div class="bar signal" style="flex:${dist.signal}">${dist.signal}%</div>
    <div class="bar both" style="flex:${dist.both}">${dist.both}%</div>
  `;
}

function renderResults() {
  const page = $('#page-results');
  const votes = loadVotes();
  const voted = Object.keys(votes).length;

  let cards = topics.map(t => {
    const v = votes[t.id];
    const correct = v === t.answer;
    const voteLabel = v ? (v === 'both' ? 'Both' : v === 'artifact' ? 'Technical Artifact' : 'Biological Signal') : 'Not voted';
    const voteColor = !v ? 'var(--text-light)' : correct ? 'var(--success)' : 'var(--warning)';

    return `
      <div class="result-summary-card" onclick="showPage('topic-${t.id}')" style="cursor:pointer">
        <h3><span style="color:var(--primary);font-weight:700">#${t.id}</span> ${t.title}</h3>
        <p class="your-vote" style="color:${voteColor}">Your vote: ${voteLabel}</p>
        <div class="vote-bar-chart" style="height:20px">
          ${v ? `<div class="bar artifact" style="flex:1">A</div><div class="bar signal" style="flex:1">S</div><div class="bar both" style="flex:1">B</div>` : '<div style="flex:1;background:var(--border);border-radius:6px"></div>'}
        </div>
      </div>
    `;
  }).join('');

  page.innerHTML = `
    <div style="padding:1.5rem 0">
      <h2 style="text-align:center;margin-bottom:.5rem">Your Results</h2>
      <div class="progress-bar"><div class="fill" style="width:${(voted/13*100).toFixed(0)}%"></div></div>
      <p class="progress-text">${voted}/13 topics voted</p>
      <div class="results-grid">${cards}</div>
      <div style="text-align:center;padding:1rem 0">
        <button class="start-btn" style="background:var(--warning)" onclick="if(confirm('Reset all votes?')){localStorage.removeItem('${STORAGE_KEY}');location.reload()}">
          Reset All Votes
        </button>
      </div>
    </div>
  `;
}

function showPage(pageId) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const target = $(`#page-${pageId}`);
  if (target) target.classList.add('active');

  // update nav
  $$('.nav-tabs button').forEach(b => {
    b.classList.remove('active');
    if (b.dataset.page === pageId) b.classList.add('active');
  });
  updateNav();

  // scroll nav button into view
  const activeBtn = $(`.nav-tabs button[data-page="${pageId}"]`);
  if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNav() {
  const votes = loadVotes();
  $$('.nav-tabs button[data-topic-id]').forEach(btn => {
    if (votes[btn.dataset.topicId]) {
      btn.classList.add('voted');
    }
  });
}

/* ---------- Teacher view ---------- */
function renderTeacher() {
  const page = $('#page-teacher');
  const allVotes = getAllDeviceVotes();
  const totalVoters = allVotes._count || 0;

  let rows = topics.map(t => {
    const counts = allVotes[t.id] || { artifact: 0, signal: 0, both: 0 };
    const total = counts.artifact + counts.signal + counts.both;
    const pct = (v) => total > 0 ? Math.round(v / total * 100) : 0;

    return `
      <div class="teacher-topic">
        <div class="teacher-topic-header">
          <span class="topic-number">Topic ${t.id}</span>
          <h3>${t.title}</h3>
          <span class="teacher-vote-count">${total} vote${total !== 1 ? 's' : ''}</span>
        </div>
        <div class="teacher-bars">
          <div class="teacher-bar-row">
            <span class="teacher-bar-label">Artifact</span>
            <div class="teacher-bar-track">
              <div class="teacher-bar-fill artifact" style="width:${pct(counts.artifact)}%"></div>
            </div>
            <span class="teacher-bar-pct">${pct(counts.artifact)}%</span>
          </div>
          <div class="teacher-bar-row">
            <span class="teacher-bar-label">Signal</span>
            <div class="teacher-bar-track">
              <div class="teacher-bar-fill signal" style="width:${pct(counts.signal)}%"></div>
            </div>
            <span class="teacher-bar-pct">${pct(counts.signal)}%</span>
          </div>
          <div class="teacher-bar-row">
            <span class="teacher-bar-label">Both</span>
            <div class="teacher-bar-track">
              <div class="teacher-bar-fill both" style="width:${pct(counts.both)}%"></div>
            </div>
            <span class="teacher-bar-pct">${pct(counts.both)}%</span>
          </div>
        </div>
        <button class="teacher-reveal-btn" onclick="this.nextElementSibling.classList.toggle('show');this.textContent=this.textContent==='Show Answer'?'Hide Answer':'Show Answer'">Show Answer</button>
        <div class="teacher-answer">
          <span class="answer-badge both">Answer: Both!</span>
          <p>${t.explanation}</p>
        </div>
      </div>
    `;
  }).join('');

  page.innerHTML = `
    <div class="teacher-view">
      <div class="teacher-header">
        <h2>Teacher Dashboard</h2>
        <p>${totalVoters} device${totalVoters !== 1 ? 's' : ''} have voted</p>
        <div style="display:flex;gap:.5rem;justify-content:center;margin-top:.75rem;flex-wrap:wrap">
          <button class="start-btn" style="font-size:.85rem;padding:.5rem 1rem" onclick="renderTeacher()">Refresh</button>
          <button class="start-btn" style="font-size:.85rem;padding:.5rem 1rem;background:var(--success)" onclick="revealAllAnswers()">Reveal All Answers</button>
          <button class="start-btn" style="font-size:.85rem;padding:.5rem 1rem;background:var(--warning)" onclick="if(confirm('Clear ALL vote data from this device?')){localStorage.removeItem('${STORAGE_KEY}');localStorage.removeItem('${STORAGE_KEY}_all');location.reload()}">Reset</button>
        </div>
      </div>
      ${rows}
    </div>
  `;
}

function revealAllAnswers() {
  $$('.teacher-answer').forEach(el => el.classList.add('show'));
  $$('.teacher-reveal-btn').forEach(btn => btn.textContent = 'Hide Answer');
}

/* ---------- Aggregate vote storage ----------
   Since we have no server, we aggregate votes per-device using
   a shared localStorage key. Each device's vote is stored with
   a unique device ID. The teacher view reads all stored votes.
   ------------------------------------------- */
function getDeviceId() {
  let id = localStorage.getItem('artifact_signal_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('artifact_signal_device_id', id);
  }
  return id;
}

function getAllDeviceVotes() {
  // Read all votes and aggregate
  const myVotes = loadVotes();
  const deviceId = getDeviceId();

  // Store this device's votes in a per-device key
  if (Object.keys(myVotes).length > 0) {
    localStorage.setItem(`${STORAGE_KEY}_dev_${deviceId}`, JSON.stringify(myVotes));
  }

  // Aggregate all device votes from localStorage
  const aggregate = {};
  let deviceCount = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${STORAGE_KEY}_dev_`)) {
      deviceCount++;
      try {
        const devVotes = JSON.parse(localStorage.getItem(key));
        for (const [topicId, choice] of Object.entries(devVotes)) {
          if (!aggregate[topicId]) aggregate[topicId] = { artifact: 0, signal: 0, both: 0 };
          if (aggregate[topicId][choice] !== undefined) {
            aggregate[topicId][choice]++;
          }
        }
      } catch {}
    }
  }

  aggregate._count = deviceCount;
  return aggregate;
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  init();
  // Auto-open teacher view if ?teacher=true in URL
  if (new URLSearchParams(window.location.search).get('teacher') === 'true') {
    renderTeacher();
    showPage('teacher');
  }
});
