# Firestore Collections Spec — Feedback & Analytics

## Objetivo
Definir la estructura de colecciones y documentos para persistir feedback transaccional y analítica agregada del Asistente Genético Virtual.

---

## 1. Colección principal transaccional
### `feedback/{feedbackId}`
Cada documento representa una evaluación individual de una respuesta del asistente.
- **Propósito**: Fuente primaria de verdad y base para auditorías.
- **Campos**: Ver `feedback.schema.json`.

---

## 2. Resumen por usuario
### `users/{userId}/feedback_summary/current`
Documento agregado con métricas del usuario.
- **Campos**:
  - `user_id: string`
  - `feedback_count: number`
  - `averages: { functionality, technical_accuracy, link_relevance, usability, overall_satisfaction, quality_score }`
  - `would_use_again_rate: number`
  - `comment_rate: number`
  - `last_feedback_at: Timestamp`
  - `mode_breakdown: map<string, object>` (Métricas por `active_mode`)

---

## 3. Analítica global
### `analytics/global/current`
Documento agregado global para KPIs de alto nivel.
- **Campos**: Similares al resumen por usuario pero a nivel sistema.

---

## 4. Analítica por modo
### `analytics/modes/{modeId}`
Documento agregado por modo del sidebar para detectar secciones con bajo desempeño.

---

## 5. Analítica diaria
### `analytics/daily/{yyyyMMdd}`
Documento agregado por día para visualización de series temporales y tendencias.

---

## 6. Comentarios recientes (Desnormalizado)
### `analytics/recent_comments/{feedbackId}`
Copia ligera de documentos de feedback que contienen comentarios, optimizada para visualización rápida en dashboards de administración.
