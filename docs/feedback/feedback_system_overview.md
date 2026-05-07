# Genomic Assistant Feedback & Analytics System

## Overview
This system provides a robust, serverless architecture for collecting user feedback and aggregating it into real-time analytics. It uses Firebase Firestore for storage, Cloud Functions for data aggregation, and a structured schema to ensure data integrity.

## Architecture Components

### 1. Data Collection (Frontend)
- **`src/services/feedbackService.ts`**: Handles client-side validation, quality score calculation, and submission to Firestore.
- **`docs/feedback/feedback.schema.json`**: Defines the mandatory structure for all feedback entries.

### 2. Storage & Security (Firestore)
- **`firebase-blueprint.json`**: Defines the data entities and collection structure.
- **`firestore.rules`**: Enforces strict security policies:
  - Users can only create/read their own feedback.
  - Analytics collections are read-only for users and writable only by backend services.
  - Admin access is granted based on UID or specific email (e.g., `JL.Cribb@gmail.com`).
- **`docs/feedback/firestore_indexes_spec.md`**: Outlines the necessary composite indexes for efficient querying.

### 3. Real-Time Aggregation (Backend)
- **`src/functions/feedbackAggregations.ts`**: Contains the logic for Cloud Functions that trigger on new feedback.
- **Aggregated Documents**:
  - `users/{userId}/feedback_summary/current`: Personal user metrics.
  - `analytics/global/current`: System-wide KPIs.
  - `analytics/modes/{modeId}`: Performance metrics per application mode.
  - `analytics/daily/{yyyyMMdd}`: Time-series data for trend analysis.

### 4. Visualization (Dashboard)
- **`docs/feedback/feedback_dashboard_spec.md`**: Strategy for building personal and global dashboards using Recharts or D3.

## Scalability & Costs
- **Pre-calculation**: Aggregates are updated on-the-fly via Cloud Functions, ensuring that dashboard reads are extremely fast and cost-efficient (single document read).
- **Atomic Increments**: Uses `FieldValue.increment` to handle concurrent updates safely without expensive transactions.
- **TTL (Optional)**: For very high volume, a TTL policy could be applied to individual feedback documents while keeping the aggregates.

## Implementation Flow
1. User submits feedback via the UI.
2. `feedbackService.ts` validates and writes to the `feedback` collection.
3. `onFeedbackCreated` Cloud Function triggers.
4. Aggregated metrics are updated in `users`, `analytics/global`, `analytics/modes`, and `analytics/daily`.
5. Dashboards fetch the pre-calculated aggregate documents for immediate display.
