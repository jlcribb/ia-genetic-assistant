# Elegant Rejection Specification

## Overview
Handles queries that violate policies or fall outside the domain scope without being abrasive.

## Rejection Schema
- **reason**: Clear explanation of why the request cannot be fulfilled (e.g., "Medical advice policy").
- **fallback_action**:
    - `provide_general_info`: Shift to educational mode.
    - `suggest_alternative_query`: Ask the user to rephrase.
    - `redirect_to_professional`: Suggest consulting a doctor/geneticist.

## Tone Guidelines
- Empathetic but firm.
- Professional and clinical.
- Avoid "I'm sorry" (use "As an AI assistant, my scope is limited to...").

## Example Rejection
```json
{
  "sections": [
    {
      "title": "Policy Notice",
      "content": "I cannot provide a specific diagnosis for your symptoms as that requires a clinical examination."
    }
  ],
  "evidence": {
    "used": false,
    "fallback_action": "redirect_to_professional"
  }
}
```
