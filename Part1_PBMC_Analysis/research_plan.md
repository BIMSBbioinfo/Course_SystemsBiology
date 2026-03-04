# Research Plan: PBMC 3k scRNA-seq Analysis

## Project Description

Live demo analysis of the 10x Genomics PBMC 3k dataset for a single-cell data analysis course. The analysis follows the standard Seurat v5 tutorial workflow: loading 10x data, quality control, normalization, dimensionality reduction, clustering, marker identification, and cell type annotation. The final output is a self-contained HTML document.

## Environment Variables

- **project_name**: PBMC_Analysis
- **home_folder**: /home/vfranke/Presentation/course_Georg_260304/Part1_PBMC_Analysis

## Folder Structure

```
Part1_PBMC_Analysis/
├── Scripts/
│   ├── Bin/          # All functions and executables
│   └── Reports/      # All R Markdown reports
├── Results/          # All figures created by reports
├── data/             # Downloaded PBMC 3k data from 10x Genomics
├── setup.R           # Environment setup and data download
└── research_plan.md  # This file
```

### Rules

- Downloaded data goes in `data/` with source documented in this plan
- `Results/` subdirectories are named after the report that generates them
- Figure filenames follow: `<date>_<figure_type>_<data_description>.pdf`

## Data Source

- **Dataset**: PBMC 3k (peripheral blood mononuclear cells)
- **Source**: 10x Genomics
- **URL**: https://cf.10xgenomics.com/samples/cell/pbmc3k/pbmc3k_filtered_gene_bc_matrices.tar.gz
- **Description**: ~2,700 single cells from a healthy donor, sequenced on Illumina NextSeq 500
- **Reference genome**: hg19

## Computing Environment

### R

- R (version 4.x, system default)
- Reproducible environment via `renv` (optional for course demo)
- Key packages:
  - **Seurat** (v5) — core scRNA-seq analysis
  - **dplyr** — data manipulation
  - **ggplot2** — visualization
  - **patchwork** — plot composition
  - **rmarkdown** — report rendering

### Platform

- Must be executable on a Mac laptop
- No Python dependencies
- No cacheR
- No external data folder symlinks

## Git

- Git repository initialized in parent directory (`course_Georg_260304/`)
- `data/` directory excluded via `.gitignore`

## Scientific Analysis Plan

### 1. Data Loading
- Read 10x Cell Ranger output (filtered gene/barcode matrices)
- Create Seurat object with minimum filtering (min.cells=3, min.features=200)

### 2. Quality Control
- Calculate mitochondrial RNA percentage (`percent.mt`)
- Visualize QC metrics: violin plots (nFeature_RNA, nCount_RNA, percent.mt)
- Scatter plots: nCount vs percent.mt, nCount vs nFeature
- Filter: 200 < nFeature_RNA < 2500, percent.mt < 5%

### 3. Normalization & Feature Selection
- LogNormalize (scale factor 10,000)
- FindVariableFeatures (VST method, 2000 features)
- Visualize top variable features

### 4. Dimensionality Reduction
- ScaleData (all genes)
- RunPCA on variable features
- ElbowPlot to determine significant PCs
- Select top 10 PCs for downstream analysis

### 5. Clustering
- FindNeighbors (dims 1:10)
- FindClusters (resolution 0.5)
- RunUMAP (dims 1:10)
- DimPlot visualization

### 6. Marker Identification
- FindAllMarkers (positive markers, min.pct=0.25, logfc.threshold=0.25)
- Top 5 markers per cluster
- DoHeatmap visualization

### 7. Cell Type Annotation
- Manual annotation based on canonical PBMC markers:
  - **Naive CD4 T**: IL7R, CCR7
  - **CD14+ Monocytes**: CD14, LYZ
  - **Memory CD4 T**: IL7R, S100A4
  - **B cells**: MS4A1
  - **CD8 T**: CD8A
  - **FCGR3A+ Monocytes**: FCGR3A, MS4A7
  - **NK cells**: GNLY, NKG7
  - **Dendritic cells**: FCER1A, CST3
  - **Platelets**: PPBP

### 8. Visualization
- Annotated UMAP
- FeaturePlot for key markers
- DotPlot across cell types
- VlnPlot for selected markers

### 9. Output
- Knit RMarkdown to self-contained HTML (`self_contained: true`)
- Session info for reproducibility

## Execution

```bash
# Step 1: Install packages and download data
Rscript setup.R

# Step 2: Render analysis to HTML
Rscript -e "rmarkdown::render('PBMC_analysis.Rmd')"
```
