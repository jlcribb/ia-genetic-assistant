# Policy Engine Specification

## Overview
The Policy Engine evaluates whether the identified domain and intent comply with safety, ethical, and operational guidelines.

## Core Policies
1. **Medical Advice Prohibition**:
   - *Rule*: Never provide a definitive diagnosis or treatment plan.
   - *Action*: If detected, trigger `elegant_rejection` with `fallback_action: "provide_general_info"`.

2. **Evidence Requirement**:
   - *Rule*: Every clinical or genomic claim must be backed by a source from the allowlist.
   - *Action*: If no evidence is found, the response must state "No verified evidence found".

3. **Hallucination Prevention (Bibliography)**:
   - *Rule*: PubMed IDs (PMIDs) and DOIs must be verified against the MCP PubMed tool.
   - *Action*: Remove any citation that fails verification.

4. **Privacy (PII)**:
   - *Rule*: Do not process queries containing names, DOBs, or specific patient identifiers.
   - *Action*: Reject query immediately.

## Evaluation Flow
1. Receive `Domain`, `Intent`, and `Entities`.
2. Run against `ForbiddenKeywords` list.
3. Check `app_modes.json` for mode-specific restrictions.
4. Return `is_allowed: boolean` and `rejection_reason: string | null`.
