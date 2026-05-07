# Cloud Functions Spec — Feedback Aggregations

## Objetivo
Actualizar automáticamente resúmenes y métricas agregadas al crear feedback mediante triggers de Firestore.

---

## Trigger principal: `onFeedbackCreated`
**Evento**: `feedback/{feedbackId}` onCreate

### Responsabilidades:
1. **Validación**: Verificar que el documento cumple con el schema.
2. **Cálculo de Score**: Recalcular `quality_score` para asegurar integridad.
3. **Agregación Atómica**: Actualizar los siguientes documentos usando `FieldValue.increment`:
   - `users/{userId}/feedback_summary/current`
   - `analytics/global/current`
   - `analytics/modes/{modeId}`
   - `analytics/daily/{yyyyMMdd}`
4. **Desnormalización**: Si `has_comment` es true, crear entrada en `analytics/recent_comments/`.

---

## Estrategia de Agregación
Para evitar lecturas masivas y costos elevados:
- Mantener contadores (`feedback_count`) y sumas acumuladas (`sum_functionality`, `sum_quality_score`, etc.).
- Derivar promedios (`averages.*`) en cada actualización.
- Usar transacciones o `writeBatch` para asegurar consistencia entre los 4-5 documentos afectados.

---

## Alertas Analíticas (Opcional)
Función programada (Cron) que revisa si:
- `technical_accuracy` media cae bajo 3.0 en algún modo.
- `would_use_again_rate` cae significativamente.
- Acción: Crear documento en `analytics/alerts/` o enviar notificación.
