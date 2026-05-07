# MCP Architecture Specification

## Overview
Model Context Protocol (MCP) allows the LLM to interact with external biological databases securely and predictably.

## Prepared Connectors
### 1. MCP PubMed
- **Endpoint**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`
- **Capabilities**: `search_papers`, `fetch_abstract`, `verify_pmid`.
- **Anti-Hallucination**: Cross-references generated PMIDs with actual Entrez records.

### 2. MCP OMIM
- **Endpoint**: `https://api.omim.org/api/`
- **Capabilities**: `search_diseases`, `fetch_gene_map`, `get_clinical_synopsis`.
- **Constraint**: Requires API Key (stored in environment).

### 3. MCP HPO
- **Endpoint**: `https://hpo.jax.org/api/`
- **Capabilities**: `get_term_details`, `search_phenotypes`, `get_gene_associations`.

## Execution Flow
1. LLM emits a `call_tool` request.
2. `ToolAllowlistResolver` checks if the tool is authorized.
3. `MCP_Proxy` executes the request and returns the raw data.
4. LLM parses the data and integrates it into the `StructuredResponse`.

## Error Handling
- If an MCP tool is down, the system must return a "Service Temporarily Unavailable" notice in the `evidence` section.
