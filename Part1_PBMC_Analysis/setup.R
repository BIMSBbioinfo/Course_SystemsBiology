# setup.R — Install dependencies and download PBMC 3k data
# Run this script once before knitting PBMC_analysis.Rmd

# --- Install packages ---
install_if_missing <- function(pkg, ...) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    install.packages(pkg, ...)
  }
}

# CRAN packages
install_if_missing("Seurat")
install_if_missing("dplyr")
install_if_missing("ggplot2")
install_if_missing("patchwork")
install_if_missing("rmarkdown")

# --- Download PBMC 3k dataset ---
data_dir <- file.path("data", "pbmc3k")
dir.create(data_dir, recursive = TRUE, showWarnings = FALSE)

tar_file <- file.path("data", "pbmc3k_filtered_gene_bc_matrices.tar.gz")

if (!file.exists(file.path(data_dir, "filtered_gene_bc_matrices"))) {
  message("Downloading PBMC 3k dataset from 10x Genomics...")
  download.file(
    url = "https://cf.10xgenomics.com/samples/cell/pbmc3k/pbmc3k_filtered_gene_bc_matrices.tar.gz",
    destfile = tar_file,
    mode = "wb"
  )
  untar(tar_file, exdir = data_dir)
  message("Download complete.")
} else {
  message("PBMC 3k data already present.")
}

message("Setup complete! You can now knit PBMC_analysis.Rmd")
