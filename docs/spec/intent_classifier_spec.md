# Intent Classifier Specification

## Overview
The Intent Classifier determines the specific action the user wants to perform within a domain.

## Intent Taxonomy
- **variant_interpretation**: Assessing the pathogenicity of a specific variant.
- **gene_lookup**: Finding information about a specific gene (location, function).
- **pathway_analysis**: Explaining how genes interact in a biological process.
- **phenotype_association**: Linking symptoms to potential genetic causes.
- **literature_summary**: Summarizing research on a specific topic.
- **clinical_guideline_retrieval**: Finding ACMG or similar guidelines.

## Input
- `user_query`: Raw text.
- `primary_domain`: Output from Domain Classifier.

## Output
- `intent_id`: One of the taxonomy values.
- `parameters`: Extracted entities (e.g., Gene Name, rsID, HPO ID).

## Mapping Matrix (Domain -> Intent)
| Domain | Allowed Intents |
| :--- | :--- |
| genomics | variant_interpretation, gene_lookup |
| clinical_genetics | clinical_guideline_retrieval, phenotype_association |
| phenotyping | phenotype_association |
| pathways | pathway_analysis |
| literature | literature_summary |

## Logic Rules
1. **Entity Extraction**: Must identify biological entities (HGNC symbols, rsIDs) before finalizing intent.
2. **Constraint**: If an intent is requested that doesn't match the domain, the classifier should flag a "Domain-Intent Mismatch".
