# Propuesta de Implementación: Subsistema de Feedback y Analítica

Este documento detalla la implementación completa del sistema de feedback para el Asistente Genético Virtual, alineado con las especificaciones técnicas proporcionadas.

## 1. Esquema de Datos (Firestore)

### Colección `feedback/{feedbackId}`
Almacena cada evaluación individual.
- `feedback_id`: UUID
- `user_id`: UID del usuario
- `session_id`: ID de sesión
- `response_id`: ID de la respuesta evaluada
- `active_mode`: Modo activo (ej: `genetic_assistant`)
- `ratings`: Objeto con 5 dimensiones (1-5)
  - `functionality`
  - `technical_accuracy`
  - `link_relevance`
  - `usability`
  - `overall_satisfaction`
- `quality_score`: Promedio ponderado (1-5)
- `would_use_again`: Boolean
- `written_comment`: String (opcional)
- `has_comment`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `app_version`: String (ej: "2.0.0")
- `response_meta`: Metadatos de la respuesta (domain_status, intent, etc.)

## 2. Cloud Functions (TypeScript)

Las agregaciones se realizan de forma asíncrona mediante Cloud Functions para optimizar el rendimiento de lectura.

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const onFeedbackCreated = functions.firestore
  .document('feedback/{feedbackId}')
  .onCreate(async (snap, context) => {
    const feedback = snap.data();
    const { user_id, active_mode, created_at } = feedback;
    const dateKey = formatDateKey(created_at.toDate());

    const updates = [
      updateAggregate(db.doc(`users/${user_id}/feedback_summary/current`), feedback),
      updateAggregate(db.doc('analytics/global/data/current'), feedback),
      updateAggregate(db.doc(`analytics/modes/data/${active_mode}`), feedback),
      updateAggregate(db.doc(`analytics/daily/data/${dateKey}`), feedback)
    ];

    await Promise.all(updates);
  });

async function updateAggregate(ref: admin.firestore.DocumentReference, feedback: any) {
  return db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    const current = snap.exists ? snap.data() : buildEmptyAggregate();
    const next = applyFeedbackAggregate(current, feedback);
    transaction.set(ref, next, { merge: true });
  });
}
```

## 3. Reglas de Seguridad (Firestore)

```javascript
match /feedback/{feedbackId} {
  allow create: if isSignedIn() && request.resource.data.user_id == request.auth.uid;
  allow read: if isOwner(resource.data.user_id) || isAdmin();
  allow update, delete: if false;
}

match /analytics/{document=**} {
  allow read: if isSignedIn();
  allow write: if false; // Solo Cloud Functions
}
```

## 4. Estrategia de Dashboard

El dashboard utiliza **Recharts** para visualizar:
- **Radar Chart**: Comparativa de las 5 dimensiones de calidad (Global vs Personal).
- **Bar Chart**: Uso por modo del asistente.
- **KPI Cards**: Métricas clave (Total Feedback, Calidad Media, Tasa de Reuso).
- **Pie Chart**: Distribución de satisfacción (sería implementable en una vista extendida).

## 5. Decisiones de Escalabilidad y Costos
- **Pre-agregación**: Al usar Cloud Functions para calcular promedios, las consultas del dashboard son `O(1)` (lectura de un solo documento), lo que minimiza costos de lectura en Firestore.
- **Atomicidad**: Se utilizan transacciones para asegurar que los contadores globales sean precisos incluso con múltiples envíos simultáneos.
- **Serverless**: La arquitectura escala automáticamente con el uso de la aplicación.
