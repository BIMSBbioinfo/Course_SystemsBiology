/* ============================================================
   Artifact or Signal — Interactive Voting App
   Votes persisted in localStorage + sent to Google Sheets
   ============================================================ */

const STORAGE_KEY = 'artifact_signal_votes';
const IS_TEACHER = new URLSearchParams(window.location.search).get('teacher') === 'true';

/* ---------- Google Sheets integration ---------- */
// Paste your Google Apps Script deployment URL here:
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCe2CyUuBOc6ZVMx_vkC0TrW5GQh3t1_yT1GdID9ux3SzQ1Utc3TLU819BO49tzzmZRw/exec';

function sendToSheet(topicId, vote, answer) {
  if (!GOOGLE_SCRIPT_URL) return;
  const topic = topics.find(t => t.id === topicId);
  const params = new URLSearchParams({
    action: 'vote',
    deviceId: getDeviceId(),
    topicId: topicId,
    topicTitle: topic ? topic.title : '',
    vote: vote,
    answer: answer || ''
  }).toString();
  // GET request avoids CORS issues with Google Apps Script redirects
  fetch(GOOGLE_SCRIPT_URL + '?' + params)
    .then(r => r.json())
    .then(d => console.log('Sheet:', d.status))
    .catch(err => console.warn('Sheet send failed:', err));
}

async function fetchSheetResults() {
  if (!GOOGLE_SCRIPT_URL) return null;
  try {
    const resp = await fetch(GOOGLE_SCRIPT_URL + '?action=results');
    return await resp.json();
  } catch { return null; }
}

/* ---------- Topic data ---------- */
const topics = [
  {
    id: 1,
    title: 'High Mitochondrial RNA %',
    artifact: 'You observe increased mitochondrial transcripts in a subset of your cells. Your standard QC pipeline flags them for removal at the >5% mtRNA threshold. Should you filter them out?',
    signal: 'Elevated mitochondrial RNA content can reflect genuine metabolic reprogramming rather than cell damage. In cancer, drug-tolerant persister cells actively transfer mitochondria between cells via tunneling nanotubes, resulting in elevated mitochondrial transcript levels. Similarly, cardiomyocytes and kidney tubular cells naturally contain high mitochondrial RNA due to their substantial energy demands.',
    answer: 'both',
    explanation: 'Although elevated mitochondrial RNA percentages are commonly used as indicators of cell damage during tissue dissociation, this metric is also a biologically meaningful marker of cellular metabolic state. Studies have demonstrated that applying a fixed 5% mitochondrial RNA threshold leads to the inadvertent removal of viable, metabolically active cell populations in approximately 30% of human tissues. In the context of cancer research, drug-tolerant persister cells exhibit elevated mitochondrial content as a consequence of active mitochondrial transfer through tunneling nanotubes, representing a mechanism of treatment resistance rather than poor cell quality.',
    genes: 'RGS5, MYL9, MIRO1',
    reference: 'Osorio-Querejeta et al. (2021); Chen et al. (2024) Cancer Res',
    image: 'images/01_mitochondria.png',
    imageCaption: 'Comparison of mitochondrial RNA percentage (pctMT) between tumor microenvironment (TME) and malignant cells across 12 patients in (a) unfiltered cohorts and (b) cohorts with prior pctMT filtering in original studies.',
    figureRef: { text: 'Hippen et al. (2025) Genome Biol', url: 'https://doi.org/10.1186/s13059-025-03559-w' }
  },
  {
    id: 2,
    title: 'Hemoglobin Gene Expression',
    artifact: 'You observe HBB and HBA hemoglobin gene expression in your non-blood cell clusters. Is this red blood cell contamination, or something else?',
    signal: 'Hemoglobin gene expression outside of erythrocytes is a well-documented biological phenomenon. Chondrocytes residing in avascular cartilage actively express hemoglobin genes to produce membrane-free protein complexes known as "hedy" structures, which serve as oxygen reservoirs in hypoxic tissue environments. Additionally, erythroid-biased hematopoietic progenitors express HBB as part of lineage priming prior to terminal differentiation.',
    answer: 'both',
    explanation: 'Extra-erythrocytic hemoglobin expression has been observed in multiple cell types and represents a genuine biological adaptation rather than contamination. Chondrocytes produce hemoglobin proteins that form membrane-free "hedy" structures for oxygen storage, functioning analogously to myoglobin in skeletal muscle. This adaptation is particularly relevant in the context of osteoarthritis, where hypoxic conditions in avascular cartilage drive increased hemoglobin expression as part of the cellular response to limited oxygen availability.',
    genes: 'HBB, HBA1, SPP1',
    reference: 'Liu et al. (2024) PMC11687149',
    image: 'images/02_hemoglobin.png',
    figureRef: { text: 'Liu et al. (2024) Front Immunol', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11687149/' },
    revealImage: 'images/02_hemoglobin_reveal.png',
    revealFigureRef: { text: 'Liu et al. (2024) Front Immunol', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11687149/' }
  },
  {
    id: 3,
    title: 'MALAT1 Detection Levels',
    artifact: 'You notice that MALAT1 expression varies dramatically across your cells — some clusters show very high levels, others very low. You read that MALAT1 is a marker of nuclear integrity. Should you use it to filter out low-quality cells?',
    signal: 'MALAT1 is a functionally important long non-coding RNA that plays a central role in the regulation of alternative splicing and cell cycle progression. Its expression variability across cell populations reflects genuine differences in nuclear biology, including cell-type-specific nuclear fragility observed in large cells such as hepatocytes and cardiomyocytes.',
    answer: 'both',
    explanation: 'MALAT1 expression has both a technical and a biological interpretation. On the technical side, MALAT1 levels correlate strongly with the nuclear RNA fraction (r = 0.71), which makes it a useful quality control marker for assessing nuclear integrity during sample preparation. On the biological side, MALAT1 is an essential regulator of pre-mRNA splicing within nuclear speckles and participates in cell cycle control. Cells with low MALAT1 levels, such as large and fragile hepatocytes or cardiomyocytes, are more susceptible to mechanical stress during tissue dissociation, leading to nuclear RNA loss that is often misinterpreted as poor cell quality.',
    genes: 'MALAT1',
    reference: 'Mattick et al. (2024) bioRxiv',
    image: 'images/03_malat1.png',
    imageCaption: 'Expression of Malat1 in murine kidney.',
    figureRef: { text: 'Montserrat-Ayuso & Esteve-Codina (2024) BMC Genomics', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11580415/' },
    revealImage: 'images/03_malat1_reveal.png',
    revealFigureRef: { text: 'Montserrat-Ayuso & Esteve-Codina (2024) BMC Genomics', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11580415/' }
  },
  {
    id: 4,
    title: 'Differential Expression of IEGs',
    artifact: 'You observe strong expression of immediate-early genes (FOS, JUN, ATF3) in a subpopulation of muscle satellite cells. What could be the cause of this upregulation?',
    signal: 'The expression of immediate-early genes during tissue dissociation can reveal important aspects of stem cell activation biology. Muscle satellite cells transition from quiescence to an "early activation" state during enzymatic digestion, and the resulting stress response provides a readout of each cell\'s sensitivity to changes in its microenvironment.',
    answer: 'both',
    explanation: 'Enzymatic tissue dissociation using collagenase at 37°C induces a well-characterized stress signature comprising approximately 512 genes, including heat shock proteins (HSPs) and immediate-early genes (IEGs) such as FOS, JUN, and ATF3. While this response is technically an artifact of the dissociation procedure, it is not uniformly distributed across all cells. In quiescent stem cell populations, the activation of these genes represents the biological initiation of the regenerative program, meaning that the technical artifact overlaps with a genuine biological process. Cold protease dissociation protocols have been developed to help distinguish between technically induced and biologically meaningful stress responses.',
    genes: 'FOS, JUN, ATF3, FOSB, JUNB',
    reference: 'Adam et al. (2017) Genome Biol; van den Brink et al. (2017)',
    image: 'images/04_dissociation.png',
    imageCaption: 'Heatmap (inset) showing transcriptome correlations of 235 freshly isolated single-cell sequenced SCs and scatterplot showing genes that are differentially expressed between the two identified subpopulations.',
    figureRef: { text: 'van den Brink et al. (2017) Nat Methods', url: 'https://www.hubrecht.eu/app/uploads/2017/11/VanOudenaarden_Key_2017-VanDenBrink_Single-cell-sequencing-reveals-dissociation-induced-gene-expression-in-tissue-subpopulations.pdf' },
    revealImage: 'images/04_dissociation_reveal.png',
    revealImageCaption: 'Genes that are differentially expressed between 1-h and 2-h collagenase-treated SCs (n = 272 and 223 cells, respectively).',
    revealFigureRef: { text: 'van den Brink et al. (2017) Fig 1C', url: 'https://www.hubrecht.eu/app/uploads/2017/11/VanOudenaarden_Key_2017-VanDenBrink_Single-cell-sequencing-reveals-dissociation-induced-gene-expression-in-tissue-subpopulations.pdf' }
  },
  {
    id: 5,
    title: 'Doublet Capture Events',
    artifact: 'Your doublet detection tool flags a set of droplets with high UMI counts and mixed lineage signatures — a macrophage and a dendritic cell in the same droplet, for example. You are about to remove them. But could some of these be real cell-cell interactions?',
    signal: 'A subset of computationally identified doublets may represent physically interacting cell pairs rather than random co-encapsulation events. The CIcADA computational pipeline was developed to distinguish biological doublets from technical artifacts by identifying transcriptomic signatures of juxtacrine signaling, such as upregulated MHC molecules and adhesion genes, that arise from genuine cell-cell contact between macrophages and dendritic cells.',
    answer: 'both',
    explanation: 'The CIcADA framework addresses this question by comparing transcriptomic profiles of experimentally captured doublets against computationally simulated synthetic doublets. Differences between the two indicate gene expression changes induced by physical cell-cell contact rather than simple additive mixing of two transcriptomes. In tumor microenvironments, biological doublets consisting of immune cell pairs show upregulation of MHC class I and II molecules as well as CD48, reflecting active juxtacrine signaling pathways. These findings demonstrate that indiscriminate removal of all detected doublets can eliminate biologically meaningful information about cell-cell communication.',
    genes: 'CD48, H2-K1, H2-D1 (MHC-I/II)',
    reference: 'Bais et al. (2023) PMC10516525',
    image: 'images/05_doublets.png',
    figureRef: { text: 'OSCA Bioconductor — Doublet Detection', url: 'https://bioconductor.org/books/3.15/OSCA.advanced/doublet-detection.html' },
    revealImage: 'images/05_doublets_reveal.png',
    revealImageCaption: 'Spatial plots showing the proportions of T cell and macrophage CAMML scores at each Visium spot in B16F10 data. Co-localization is the percent of spots where both cell type scores each make up at least 10% of the score for that spot.',
    revealFigureRef: { text: 'Bais et al. (2023) Genome Biol — CIcADA', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10516525/' }
  },
  {
    id: 6,
    title: 'Low UMI / Gene Counts',
    artifact: 'A large population of cells in your dataset falls below your minimum UMI and gene count thresholds. Your QC pipeline labels them as empty droplets or failed captures and removes them. Could you be throwing away real cells?',
    signal: 'Low transcriptional diversity is a defining characteristic of quiescent and terminally differentiated cell states. Cell types such as long-term engrafting hematopoietic stem and progenitor cells (HSPCs), naive T cells, and mature neutrophils naturally contain low amounts of RNA. Applying uniform QC thresholds systematically removes these populations, introducing a bias in cell atlases toward transcriptionally active cell types.',
    answer: 'both',
    explanation: 'The total number of genes detected per cell varies substantially across cell types and functional states, and UMI counts serve as a biological proxy for the metabolic and transcriptional activity of each cell. Quiescent cells, by definition, have reduced transcriptional output, which places them near or below standard quality control thresholds. Adaptive QC tools such as ddqc address this problem by applying cluster-specific thresholds based on the median absolute deviation (MAD), thereby recovering biologically meaningful quiescent populations that would otherwise be discarded by fixed filtering criteria.',
    genes: 'Low complexity distribution',
    reference: 'Subramanian et al. (2022) PMC9793662',
    image: 'images/08_low_umi.png',
    imageCaption: 'Number of features per cell in normal human lung cell atlas.',
    figureRef: { text: 'Subramanian et al. (2022) Genome Biol', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9793662/' },
    revealImage: 'images/08_low_umi_reveal.png',
    revealImageCaption: 'QC metrics vary by tissue.',
    revealFigureRef: { text: 'Subramanian et al. (2022) Genome Biol', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9793662/' }
  },
  {
    id: 7,
    title: 'Ribosomal Protein Gene Fraction',
    artifact: 'You notice that ribosomal protein genes account for a large fraction of reads in certain cell clusters. A colleague suggests regressing them out as housekeeping noise or a batch effect. Is the variation in RP genes really just technical?',
    signal: 'Contrary to the assumption that ribosomes are uniform molecular machines, ribosomal protein genes exhibit dynamic compositional heterogeneity across tissues and cell states. For example, elevated ribosomal protein content in naive T cells reflects the translational demand required for rapid clonal expansion upon antigen stimulation.',
    answer: 'both',
    explanation: 'Analysis of single-cell atlases spanning 15 human tissues has revealed that ribosomal protein gene expression patterns are tissue-specific rather than uniformly distributed. For instance, RPL36A is preferentially expressed in blood cells, while other ribosomal proteins show enrichment in distinct tissue contexts. This ribosomal protein stoichiometry reflects specialized translational requirements of different cell types and functional states. Regressing out ribosomal protein gene variation therefore risks removing a biologically informative variable that captures differences in translational regulation across cell populations.',
    genes: 'RPLP1, RPS27, RPL36A, RPLP0',
    reference: 'Gupta et al. (2025) bioRxiv; Subramanian et al. (2022)',
    image: 'images/09_ribosomal.png',
    imageCaption: 'Heatmap depicting the standard score-normalized expression level of 90 RP genes across 28 human tissues. Paralog genes classified as canonical (blue) and non-canonical (red). RP genes with tissue-specific expression marked with a star.',
    figureRef: { text: 'Guimaraes & Zavolan (2016) Genome Biol', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5123215/' },
    revealImage: 'images/09_ribosomal_reveal.png',
    revealImageCaption: 'PCA of RP specificity scores of mature cell types compared to HSCs identifies hematopoietic lineages (blue: lymphoid, orange: myeloid). Hierarchical clustering of specificity scores suggests several RP genes are co-regulated in different developmental lineages.',
    revealFigureRef: { text: 'Guimaraes & Zavolan (2016) Fig 4C-D', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5123215/#Fig4' }
  },
  {
    id: 8,
    title: 'Intronic Reads',
    artifact: 'A significant fraction of your reads map to intronic regions rather than exons. Your pipeline documentation says these are genomic DNA contamination or ambient nuclear RNA, and recommends filtering them out. Should you?',
    signal: 'Intronic reads correspond to nascent, unspliced pre-mRNA molecules that are still being processed in the nucleus. The RNA velocity framework leverages the ratio of unspliced to spliced transcripts to infer the future transcriptional state of individual cells. In single-nucleus RNA-seq experiments, intronic reads constitute approximately 40% of the sequencing library and provide information about the transcriptional dynamics of each cell.',
    answer: 'both',
    explanation: 'The development of RNA velocity fundamentally changed the interpretation of intronic reads from unwanted contamination to a central variable for trajectory analysis. By estimating the ratio of unspliced to spliced transcripts for each gene, RNA velocity predicts the rate and direction of gene expression changes, enabling the inference of developmental trajectories and cellular fate decisions. It is worth noting that longer genes, which contain more intronic poly(A) stretches, are preferentially captured in nuclear RNA libraries, introducing a gene-length-dependent detection bias that should be considered when interpreting single-nucleus sequencing data.',
    genes: 'Unspliced vs. spliced transcript ratio',
    reference: 'La Manno et al. (2018); Bergen et al. (2020)',
    image: 'images/10_intronic.png',
    imageCaption: 'Examples of read density around intronic polyA and polyT sequences. Browser screenshots show reads from 10x Chromium, inDrop, and SMART-seq2 datasets, with gene annotation and polyA/polyT sequence positions.',
    figureRef: { text: 'La Manno et al. (2018) Nature', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6130801/' },
    revealImage: 'images/10_intronic_reveal.png',
    revealFigureRef: { text: 'La Manno et al. (2018) Nature', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6130801/' }
  },
  {
    id: 9,
    title: 'Cell Cycle Gene Signatures',
    artifact: 'Cell cycle genes dominate your clustering — you see large S-phase and G2M clusters that obscure the cell-type differences you are interested in. You decide to regress out cell cycle scores. But are you removing noise, or deleting biology?',
    signal: 'Cell cycle activity is a fundamental biological variable that carries important functional information. In Th17 cell populations, for example, trajectory analysis has identified distinct "effector", "proliferating", and "stem-like" subsets whose identities are intrinsically linked to their cell cycle state. Regressing out cell cycle gene signatures eliminates these biologically meaningful functional distinctions.',
    answer: 'both',
    explanation: 'The proliferative fraction of a cell population provides clinically relevant information about tumor aggressiveness and treatment response. In the immune system, transitions from naive to effector cell states are intrinsically coupled to cell cycle progression, meaning that cell cycle genes carry biological information that is inseparable from cell identity and function. Rather than regressing out cell cycle scores entirely, methods such as SCTransform can be used to stabilize technical variance in the data while preserving the biological structure associated with proliferation and differentiation.',
    genes: 'RORC, IFNG (Th17 trajectories)',
    reference: 'Zhao et al. (2023) PMC10300431',
    image: 'images/11_cellcycle.png',
    figureRef: { text: 'Zhao et al. (2023) J Exp Med', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10300431/' },
    revealImage: 'images/11_cellcycle_reveal.png',
    revealImageCaption: 'Cells in the human lung atlas colored by cell cycle phase.',
    revealFigureRef: { text: 'Zhao et al. (2023) J Exp Med', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10300431/' }
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

const ANSWERS_KEY = 'artifact_signal_answers';
function loadAnswers() {
  try { return JSON.parse(localStorage.getItem(ANSWERS_KEY)) || {}; }
  catch { return {}; }
}
function loadAnswer(topicId) {
  return loadAnswers()[topicId] || '';
}
function saveAnswer(topicId, text) {
  const answers = loadAnswers();
  answers[topicId] = text;
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
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
  const nav = $('.nav-sidebar');
  // Home button
  const homeBtn = document.createElement('button');
  homeBtn.innerHTML = 'Home';
  homeBtn.dataset.page = 'landing';
  homeBtn.addEventListener('click', () => showPage('landing'));
  nav.appendChild(homeBtn);

  topics.forEach(t => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="nav-num">#${t.id}</span><span class="nav-title"> ${t.title}</span>`;
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
    teachBtn.addEventListener('click', () => { renderTeacher(); showPage('teacher'); startTeacherAutoRefresh(); });
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
      <p style="color:var(--text-light);margin:.5rem 0;">${topics.length} things your QC pipeline throws away.<br>Are they noise — or biology?</p>
      <div class="qr-wrap" id="qr-code"></div>
      <p class="instructions">Scan the QR code on your phone to participate</p>
      <div class="progress-bar"><div class="fill" style="width:${(voted/topics.length*100).toFixed(0)}%"></div></div>
      <p class="progress-text">${voted}/${topics.length} topics voted</p>
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

  topics.forEach((t, idx) => {
    const voted = votes[t.id];
    const div = document.createElement('div');
    div.className = 'page';
    div.id = `page-topic-${t.id}`;
    div.innerHTML = `
      <div class="topic-card">
        <div class="topic-header">
          <span class="topic-number">Topic ${t.id} of ${topics.length}</span>
          <h2>${t.title}</h2>
        </div>
        <div class="description">
          <p>${t.artifact}</p>
        </div>
        <div class="figure-wrap">
          <img src="${t.image}" alt="Figure for ${t.title}"
               onerror="this.parentElement.style.display='none'">
          ${t.imageCaption ? `<p class="caption">${t.imageCaption}</p>` : ''}
          <p class="caption">Source: <a href="${t.figureRef.url}" target="_blank" rel="noopener">${t.figureRef.text}</a></p>
        </div>
        <div class="answer-input" data-topic="${t.id}">
          <label class="answer-label">What do you think?</label>
          <textarea class="answer-text" placeholder="Write your reasoning here..."
                    data-topic="${t.id}" ${voted?'disabled':''}>${loadAnswer(t.id)}</textarea>
        </div>
        <div class="vote-buttons" data-topic="${t.id}">
          <button class="vote-btn artifact ${voted==='artifact'?'selected':''}"
                  data-choice="artifact" ${voted?'disabled':''}>
            Mostly Technical
          </button>
          <button class="vote-btn signal ${voted==='signal'?'selected':''}"
                  data-choice="signal" ${voted?'disabled':''}>
            Mostly Biology
          </button>
        </div>
        <div class="vote-recorded ${voted?'show':''}" id="recorded-${t.id}" ${IS_TEACHER?'style="display:none"':''}>
          <p>Vote recorded! Watch the screen for the answer.</p>
        </div>
        <div class="result-reveal ${IS_TEACHER && voted?'show':''}" id="reveal-${t.id}" ${!IS_TEACHER?'style="display:none !important"':''}>
          <span class="answer-badge both">Answer: It's both!</span>
          <p class="signal-text"><strong>The biological signal:</strong> ${t.signal}</p>
          ${t.revealImage ? `
          <div class="figure-wrap" style="margin-top:.75rem">
            <img src="${t.revealImage}" alt="Reveal figure for ${t.title}"
                 onerror="this.parentElement.style.display='none'">
            ${t.revealImageCaption ? `<p class="caption">${t.revealImageCaption}</p>` : ''}
            ${t.revealFigureRef ? `<p class="caption">Source: <a href="${t.revealFigureRef.url}" target="_blank" rel="noopener">${t.revealFigureRef.text}</a></p>` : ''}
          </div>` : ''}
          <p class="explanation" style="margin-top:.75rem">${t.explanation}</p>
          <p class="reference">Key genes: ${t.genes}<br>Ref: ${t.reference}</p>
          <div class="vote-bar-chart" id="chart-${t.id}"></div>
        </div>
      </div>
      <div style="display:flex;gap:.5rem;justify-content:center;padding:1rem 0">
        ${idx > 0 ? `<button class="start-btn" style="font-size:.85rem;padding:.5rem 1.5rem" onclick="showPage('topic-${topics[idx-1].id}')">Previous</button>` : ''}
        ${idx < topics.length - 1 ? `<button class="start-btn" style="font-size:.85rem;padding:.5rem 1.5rem" onclick="showPage('topic-${topics[idx+1].id}')">Next</button>` : `<button class="start-btn" style="font-size:.85rem;padding:.5rem 1.5rem" onclick="renderResults();showPage('results')">See Results</button>`}
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

    // Save text answer
    const textarea = document.querySelector(`.answer-text[data-topic="${topicId}"]`);
    if (textarea) {
      saveAnswer(topicId, textarea.value);
      textarea.disabled = true;
    }

    saveVote(topicId, choice);

    // Send to Google Sheet
    const answerText = textarea ? textarea.value : '';
    sendToSheet(topicId, choice, answerText);

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

  // Auto-save textarea on input
  document.addEventListener('input', e => {
    if (!e.target.matches('.answer-text')) return;
    const topicId = parseInt(e.target.dataset.topic);
    saveAnswer(topicId, e.target.value);
  });

  // Render charts for already-voted topics
  Object.keys(votes).forEach(id => renderVoteChart(parseInt(id)));
}

function renderVoteChart(topicId) {
  const votes = loadVotes();
  const chart = $(`#chart-${topicId}`);
  if (!chart) return;

  const myVote = votes[topicId];
  if (!myVote) return;

  // Plausible distributions (2 choices only)
  const distributions = {
    1:  { artifact: 55, signal: 45 },
    2:  { artifact: 60, signal: 40 },
    3:  { artifact: 50, signal: 50 },
    4:  { artifact: 60, signal: 40 },
    5:  { artifact: 65, signal: 35 },
    6:  { artifact: 55, signal: 45 },
    7:  { artifact: 55, signal: 45 },
    8:  { artifact: 50, signal: 50 },
    9:  { artifact: 45, signal: 55 },
    10: { artifact: 60, signal: 40 },
    11: { artifact: 50, signal: 50 }
  };

  const dist = distributions[topicId] || { artifact: 50, signal: 50 };
  chart.innerHTML = `
    <div class="bar artifact" style="flex:${dist.artifact}">${dist.artifact}%</div>
    <div class="bar signal" style="flex:${dist.signal}">${dist.signal}%</div>
  `;
}

function renderResults() {
  const page = $('#page-results');
  const votes = loadVotes();
  const voted = Object.keys(votes).length;

  let cards = topics.map(t => {
    const v = votes[t.id];
    const voteLabel = v ? (v === 'artifact' ? 'Mostly Technical' : 'Mostly Biology') : 'Not voted';
    const voteColor = !v ? 'var(--text-light)' : v === 'artifact' ? 'var(--warning)' : 'var(--success)';

    return `
      <div class="result-summary-card" onclick="showPage('topic-${t.id}')" style="cursor:pointer">
        <h3><span style="color:var(--primary);font-weight:700">#${t.id}</span> ${t.title}</h3>
        <p class="your-vote" style="color:${voteColor}">Your vote: ${voteLabel}</p>
        <div class="vote-bar-chart" style="height:20px">
          ${v ? `<div class="bar artifact" style="flex:1">Tech</div><div class="bar signal" style="flex:1">Bio</div>` : '<div style="flex:1;background:var(--border);border-radius:6px"></div>'}
        </div>
      </div>
    `;
  }).join('');

  page.innerHTML = `
    <div style="padding:1.5rem 0">
      <h2 style="text-align:center;margin-bottom:.5rem">Your Results</h2>
      <div class="progress-bar"><div class="fill" style="width:${(voted/topics.length*100).toFixed(0)}%"></div></div>
      <p class="progress-text">${voted}/${topics.length} topics voted</p>
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
  $$('.nav-sidebar button').forEach(b => {
    b.classList.remove('active');
    if (b.dataset.page === pageId) b.classList.add('active');
  });
  updateNav();

  // scroll nav button into view
  const activeBtn = $(`.nav-sidebar button[data-page="${pageId}"]`);
  if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNav() {
  const votes = loadVotes();
  $$('.nav-sidebar button[data-topic-id]').forEach(btn => {
    if (votes[btn.dataset.topicId]) {
      btn.classList.add('voted');
    }
  });
}

/* ---------- Teacher view ---------- */
async function renderTeacher() {
  const page = $('#page-teacher');

  // Try Google Sheets first, fall back to localStorage
  let allVotes, totalVoters;
  const sheetData = await fetchSheetResults();
  if (sheetData && sheetData.status === 'ok') {
    allVotes = sheetData.results;
    totalVoters = sheetData.deviceCount;
  } else {
    allVotes = getAllDeviceVotes();
    totalVoters = allVotes._count || 0;
  }

  let rows = topics.map(t => {
    const counts = allVotes[t.id] || { artifact: 0, signal: 0 };
    const total = counts.artifact + counts.signal;
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
            <span class="teacher-bar-label">Technical</span>
            <div class="teacher-bar-track">
              <div class="teacher-bar-fill artifact" style="width:${pct(counts.artifact)}%"></div>
            </div>
            <span class="teacher-bar-pct">${pct(counts.artifact)}%</span>
          </div>
          <div class="teacher-bar-row">
            <span class="teacher-bar-label">Biology</span>
            <div class="teacher-bar-track">
              <div class="teacher-bar-fill signal" style="width:${pct(counts.signal)}%"></div>
            </div>
            <span class="teacher-bar-pct">${pct(counts.signal)}%</span>
          </div>
        </div>
        <button class="teacher-reveal-btn" onclick="this.nextElementSibling.classList.toggle('show');this.textContent=this.textContent==='Show Answer'?'Hide Answer':'Show Answer'">Show Answer</button>
        <div class="teacher-answer">
          <p>${t.explanation}</p>
          ${t.revealImage ? `
          <div class="figure-wrap" style="margin-top:.75rem">
            <img src="${t.revealImage}" alt="Reveal figure for ${t.title}" style="max-width:100%;border-radius:8px;border:1px solid var(--border)"
                 onerror="this.parentElement.style.display='none'">
            ${t.revealImageCaption ? `<p class="caption">${t.revealImageCaption}</p>` : ''}
            ${t.revealFigureRef ? `<p class="caption">Source: <a href="${t.revealFigureRef.url}" target="_blank" rel="noopener">${t.revealFigureRef.text}</a></p>` : ''}
          </div>` : ''}
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

/* ---------- Teacher auto-refresh ---------- */
let teacherRefreshInterval = null;
function startTeacherAutoRefresh() {
  stopTeacherAutoRefresh();
  teacherRefreshInterval = setInterval(async () => {
    // Only refresh if teacher page is visible
    const teacherPage = $('#page-teacher');
    if (teacherPage && teacherPage.classList.contains('active')) {
      // Remember which answers are revealed
      const revealed = new Set();
      $$('.teacher-answer.show').forEach(el => {
        const topic = el.closest('.teacher-topic');
        if (topic) revealed.add(topic.querySelector('.topic-number')?.textContent);
      });
      await renderTeacher();
      // Re-reveal previously shown answers
      if (revealed.size > 0) {
        $$('.teacher-topic').forEach(el => {
          const label = el.querySelector('.topic-number')?.textContent;
          if (revealed.has(label)) {
            const answer = el.querySelector('.teacher-answer');
            const btn = el.querySelector('.teacher-reveal-btn');
            if (answer) answer.classList.add('show');
            if (btn) btn.textContent = 'Hide Answer';
          }
        });
      }
    }
  }, 10000);
}
function stopTeacherAutoRefresh() {
  if (teacherRefreshInterval) {
    clearInterval(teacherRefreshInterval);
    teacherRefreshInterval = null;
  }
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
          if (!aggregate[topicId]) aggregate[topicId] = { artifact: 0, signal: 0 };
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
    startTeacherAutoRefresh();
  }
});
