# Structured Response Builder Specification

## Overview
Assembles the final output following the mandatory JSON schema.

## UX Criteria for `render_as`
- **text**: Use for narrative explanations. Max 3 paragraphs per section.
- **list**: Use for symptoms, gene lists, or steps. Use bullet points.
- **table**: Use for comparing variants, genotypes, or studies. Must have clear headers.
- **chart**: (Future) Use for frequency data or expression levels.

## Section Construction Rules
1. **Title**: Must be concise and descriptive (e.g., "Pathogenicity Assessment").
2. **Content**: Must be in Markdown.
3. **Evidence Mapping**: Every section that makes a claim must link to at least one `source_id` in the `evidence` object.

## Evidence Object Requirements
- **sources**: Must include `id`, `title`, `url`, `source_type`, and `verified`.
- **verification_status**:
    - `verified`: All sources confirmed via MCP.
    - `partial`: Some sources confirmed, others from general knowledge.
    - `none`: No sources confirmed.

## Anti-Hallucination
- If the LLM generates a URL that doesn't exist or doesn't match the `source_type`, it must be stripped before final output.
