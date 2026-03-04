# Research Plan: PBMC 3k scRNA-seq Analysis

## Project Description

Live demo analysis of the 10x Genomics PBMC 3k dataset for a single-cell data analysis course. The analysis follows the standard Seurat v5 tutorial workflow: loading 10x data, quality control, normalization, dimensionality reduction, clustering, marker identification, and cell type annotation. The final output is a self-contained HTML document.

## Environment Variables

- **project_name**: PBMC_Analysis
- **home_folder**: /home/vfranke/Presentation/course_Georg_260304/Part1_PBMC_Analysis

## Folder Structure

```
Part1_PBMC_Analysis/
├── data/                 # Downloaded PBMC 3k data from 10x Genomics [DONE]
├── results/              # Output figures
├── setup.R               # Environment setup and data download [DONE]
├── PBMC_analysis.Rmd     # Full Seurat analysis workflow [DONE]
└── research_plan.md      # This file
```

### Rules

- Downloaded data goes in `data/` with source documented in this plan
- `results/` holds output figures and intermediate files

## Data Source

- **Dataset**: PBMC 3k (peripheral blood mononuclear cells)
- **Source**: 10x Genomics
- **URL**: https://cf.10xgenomics.com/samples/cell/pbmc3k/pbmc3k_filtered_gene_bc_matrices.tar.gz
- **Description**: ~2,700 single cells from a healthy donor, sequenced on Illumina NextSeq 500
- **Reference genome**: hg19

## Computing Environment

### R

- R (version 4.x, system default)
- Reproducible environment via `renv` 
- Key packages:
  - **Seurat** (v5) — core scRNA-seq analysis
  - **dplyr** — data manipulation
  - **ggplot2** — visualization
  - **patchwork** — plot composition
  - **rmarkdown** — report rendering

### Platform

- Must be executable on a Mac laptop
- No Python dependencies
- No external data folder symlinks

## Git

- Git repository initialized in parent directory (`course_Georg_260304/`)
- `data/` directory excluded via `.gitignore`

## Scientific Analysis Plan

### 1. Data Loading [DONE — PBMC_analysis.Rmd]
- Read 10x Cell Ranger output (filtered gene/barcode matrices)
- Create Seurat object with minimum filtering (min.cells=3, min.features=200)

### 2. Quality Control [DONE — PBMC_analysis.Rmd]
- Calculate mitochondrial RNA percentage (`percent.mt`)
- Visualize QC metrics: violin plots (nFeature_RNA, nCount_RNA, percent.mt)
- Scatter plots: nCount vs percent.mt, nCount vs nFeature
- Filter: 200 < nFeature_RNA < 2500, percent.mt < 5%

### 3. Normalization & Feature Selection [DONE — PBMC_analysis.Rmd]
- LogNormalize (scale factor 10,000)
- FindVariableFeatures (VST method, 2000 features)
- Visualize top variable features

### 4. Dimensionality Reduction [DONE — PBMC_analysis.Rmd]
- ScaleData (all genes)
- RunPCA on variable features
- ElbowPlot to determine significant PCs
- Select top 10 PCs for downstream analysis

### 5. Clustering [DONE — PBMC_analysis.Rmd]
- FindNeighbors (dims 1:10)
- FindClusters (resolution 0.5)
- RunUMAP (dims 1:10)
- DimPlot visualization

### 6. Marker Identification [DONE — PBMC_analysis.Rmd]
- FindAllMarkers (positive markers, min.pct=0.25, logfc.threshold=0.25)
- Top 5 markers per cluster
- DoHeatmap visualization

### 7. Cell Type Annotation [DONE — PBMC_analysis.Rmd]
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

### 8. Visualization [DONE — PBMC_analysis.Rmd]
- Annotated UMAP
- FeaturePlot for key markers (MS4A1, GNLY, CD3E, CD14, FCER1A, FCGR3A, LYZ, PPBP, CD8A)
- DotPlot across cell types
- VlnPlot for selected markers (CD3D, MS4A1, CD14, FCGR3A)

### 9. Output [DONE — PBMC_analysis.Rmd]
- Knit RMarkdown to self-contained HTML (`self_contained: true`, theme: flatly, toc: floating)
- Session info for reproducibility

## Implementation Status

| Component | Status | File |
|-----------|--------|------|
| R package installation | DONE | `setup.R` |
| PBMC 3k data download | DONE | `setup.R` |
| Data loading & Seurat object | DONE | `PBMC_analysis.Rmd` |
| QC & filtering | DONE | `PBMC_analysis.Rmd` |
| Normalization & variable features | DONE | `PBMC_analysis.Rmd` |
| PCA & elbow plot | DONE | `PBMC_analysis.Rmd` |
| Clustering & UMAP | DONE | `PBMC_analysis.Rmd` |
| Marker identification | DONE | `PBMC_analysis.Rmd` |
| Cell type annotation | DONE | `PBMC_analysis.Rmd` |
| Visualization (feature/dot/violin) | DONE | `PBMC_analysis.Rmd` |
| HTML rendering | READY | Run execution commands below |

## Execution

```bash
# Step 1: Install packages and download data
Rscript setup.R

# Step 2: Render analysis to HTML
Rscript -e "rmarkdown::render('PBMC_analysis.Rmd')"
```
