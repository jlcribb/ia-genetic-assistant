# Tool Allowlist Resolver Specification

## Overview
Determines which external tools/APIs are authorized for a specific query based on the active mode and intent.

## Tool Registry
- **mcp_pubmed**: Literature search and verification.
- **mcp_omim**: Clinical genetics and disease information.
- **mcp_hpo**: Phenotype terminology and associations.
- **mcp_uniprot**: Protein sequence and function.
- **mcp_clinvar**: Variant pathogenicity data.

## Allowlist Matrix
| Intent | Allowed Tools |
| :--- | :--- |
| variant_interpretation | mcp_clinvar, mcp_omim, mcp_pubmed |
| gene_lookup | mcp_uniprot, mcp_omim |
| phenotype_association | mcp_hpo, mcp_omim |
| literature_summary | mcp_pubmed |

## Resolution Logic
1. Get `active_mode` from `app_modes.json`.
2. Get `intent_id` from Intent Classifier.
3. Intersect `mode.mcp_requirements` with `intent.allowed_tools`.
4. Return the list of `authorized_tools`.

## Security
- Tools not in the `authorized_tools` list are blocked from execution even if the LLM requests them.
