# Domain Classifier Specification

## Overview
The Domain Classifier is responsible for identifying the high-level scientific or functional area of a user's query. This is the first step in the routing pipeline.

## Classification Taxonomy
- **genomics**: DNA sequencing, variants, SNPs, chromosomal abnormalities.
- **clinical_genetics**: Inherited diseases, family history, genetic counseling.
- **phenotyping**: HPO terms, clinical signs, symptoms, patient presentation.
- **molecular_biology**: Gene expression, protein function, cellular mechanisms.
- **pathways**: Metabolic pathways, signaling cascades, interactomes.
- **literature**: Search for specific papers, authors, or research trends.
- **education**: General knowledge requests, "how it works", terminology.

## Input
- `user_query`: The raw text input from the user.
- `context`: (Optional) Previous conversation history.

## Output
- `primary_domain`: One of the taxonomy values.
- `confidence_score`: 0.0 to 1.0.
- `sub_domains`: List of secondary domains identified.

## Logic Rules
1. If keywords like "variant", "rsID", "mutation" are present -> **genomics**.
2. If keywords like "patient", "symptoms", "syndrome" are present -> **phenotyping**.
3. If the query asks for a definition or explanation -> **education**.
4. If multiple domains are detected, the one with the highest semantic relevance to the main verb of the query is chosen as `primary_domain`.

## Anti-Hallucination
- If the query is outside the scope of genetics/biology, the classifier must return `null` or `out_of_scope`.
