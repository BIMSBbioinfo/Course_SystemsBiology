# Implementation Plan: Single-Cell Course for Georg (2026-03-04)

## Overview
Two-part course on single-cell data analysis:
- **Part 1**: Live demo of PBMC 3k scRNA-seq analysis using Claude Code + R (Mac-compatible)
- **Part 2**: Static interactive voting website — attendees vote on whether "technical artifacts" are biological signals (phone access via QR code)

---

## Part 1: PBMC Data Analysis with Claude Code

### Step 1: Project scaffolding [DONE]
- Folder structure:
  ```
  Part1_PBMC_Analysis/
  ├── data/
  ├── results/
  ├── PBMC_analysis.Rmd
  └── setup.R
  ```
- Git repo initialized in `course_Georg_260304/`
- `.gitignore` created (ignores `data/`, `.Rhistory`, `*.html`, etc.)

### Step 2: R setup script (`setup.R`) [DONE]
- Installs Seurat v5, dplyr, ggplot2, patchwork, rmarkdown
- Downloads PBMC 3k filtered gene/barcode matrices from 10x Genomics into `data/`
- No cacheR, no Python, no `/local` folder (per requirements)

### Step 3: RMarkdown analysis (`PBMC_analysis.Rmd`) [DONE]
Standard Seurat PBMC tutorial workflow:
1. Load 10x data → Seurat object
2. QC: violin plots of nFeature_RNA, nCount_RNA, percent.mt → filtering
3. Normalization (LogNormalize) & FindVariableFeatures
4. ScaleData → RunPCA → ElbowPlot
5. FindNeighbors → FindClusters → RunUMAP
6. DimPlot (UMAP)
7. FindAllMarkers → top markers per cluster
8. Cell type annotation (known PBMC markers: CD3D, MS4A1, CD14, FCGR3A, etc.)
9. Feature plots + violin plots + dot plot
10. Knit to self-contained HTML

---

## Part 2: Interactive Voting Website (Static HTML)

### Step 4: Website structure [DONE]
```
how_to_single_cell/
├── index.html          # Landing page with QR code + navigation
├── style.css           # Mobile-first responsive styling
├── app.js              # Voting logic (localStorage), navigation
└── images/             # Figures from publications (13 PNGs downloaded)
```

### Step 5: Website content — 13 topic pages [DONE]
Single-page app with card-based navigation. Each card presents:
- A brief description of the **technical artifact only** (not the biological signal)
- A relevant figure from the cited publication
- Vote buttons: "Technical Artifact" / "Biological Signal" / "Both"
- After voting, reveal the biological signal explanation

**Required changes from research_plan.md:**
- [x] ~~Website created with 13 topics~~
- [x] **Remove "As biological signal" text from pre-vote view** — only show the technical issue description before voting
- [x] **Biological signal text appears only after voting is closed** — move signal text into the reveal section
- [x] **Teacher/presenter results view** — add ability for teacher to show aggregate voting results to students

The 13 topics (from documentation):
1. High mitochondrial RNA % → Cancer metabolism / drug resistance
2. Hemoglobin expression → Hypoxia adaptation in cartilage
3. MALAT1 detection → Splicing regulation & nuclear integrity
4. Dissociation-induced stress genes → Stem cell activation
5. Doublet capture → Juxtacrine cell-cell signaling
6. Platelet marker contamination → Platelet-leukocyte aggregates
7. Spatial autofluorescence → Lipofuscin / aging
8. Low UMI counts → Quiescent / dormant cell states
9. Ribosomal protein gene fraction → Specialized ribosomes
10. Intronic reads → RNA velocity / nascent transcription
11. Cell cycle gene confounding → Functional Th17/tumor subsets
12. Ambient RNA "soup" → Extracellular vesicles / secretome
13. Gene length bias (snRNA-seq) → Neuronal/adipose programs

### Step 6: QR code [DONE]
- QR code generated dynamically via `qrcode.js` CDN
- Landing page displays QR prominently
- Auto-updates to current URL

### Step 7: Publication figures [DONE]
- 13 figures downloaded from PMC open-access papers
- Placed in `images/` directory (01–13 naming convention)
- Fallback: images hide gracefully on error via `onerror` handler

### Step 8: Voting functionality [DONE]
- [x] localStorage-based per-device voting
- [x] Vote distribution bar chart after each vote
- [x] "Results" page showing votes across all topics
- [x] Reset functionality
- [x] **Teacher view**: presenter-facing page to show aggregate results to class

---

## Completed Fixes

### Fix 1: Hide biological signal text before voting [DONE]
- Students only see the technical artifact description before voting
- Biological signal text appears in the reveal section after voting

### Fix 2: Teacher/presenter results view [DONE]
- Teacher view accessible via `?teacher=true` URL parameter
- Teacher Dashboard with per-topic horizontal bar charts + reveal buttons
- "Reveal All Answers" button for classroom presentation
- Teacher/Results nav buttons hidden from student view

### Fix 3: Teacher-controlled answer reveal [DONE]
- Students see "Vote recorded! Watch the screen for the answer." after voting
- Answers only visible on teacher's projected screen (`?teacher=true`)
- QR code always points to student URL (without `?teacher`)

### Fix 4: Increase font on the question [TODO]
**Files**: `style.css`
- Increase font size of the technical artifact description text in `.topic-card .description`

### Fix 5: Fix publication figures [TODO]
**Files**: `images/`, `app.js`
- Review each of the 13 figures for relevance and correctness
- Replace irrelevant or cluttered figures with correct high-resolution ones (1 per topic)
- Each figure should clearly showcase the specific technical artifact / biological signal example

---

## Deployment

### GitHub Pages [DONE]
- **Repo**: `git@github.com:BIMSBbioinfo/Course_SystemsBiology.git`
- **Website folder**: `how_to_single_cell/`
- **Student URL**: `https://bioinformatics.mdc-berlin.de/Course_SystemsBiology/how_to_single_cell/`
- **Teacher URL**: `https://bioinformatics.mdc-berlin.de/Course_SystemsBiology/how_to_single_cell/?teacher=true`

### Part 1 Execution
```bash
cd Part1_PBMC_Analysis
Rscript setup.R                                          # install + download data
PATH="/usr/bin:$PATH" Rscript -e "Sys.setenv(RSTUDIO_PANDOC='/usr/bin'); rmarkdown::render('PBMC_analysis.Rmd')"
```
Note: Use system pandoc (`/usr/bin/pandoc`) — Guix pandoc has a stack smashing bug.

## Constraints
- **No `rm` or `mv` commands** (project rule)
- Must work on Mac laptop
- Website must be phone-friendly (responsive CSS)
- No server backend — all client-side with localStorage
