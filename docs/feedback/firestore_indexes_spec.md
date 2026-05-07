# Firestore Indexes Spec — Feedback & Analytics

## Índices recomendados para `feedback`

### 1. Historial por usuario
- **Campos**: `user_id ASC`, `created_at DESC`
- **Uso**: Listar feedback reciente de un usuario.

### 2. Historial por modo
- **Campos**: `active_mode ASC`, `created_at DESC`
- **Uso**: Listar feedback reciente por modo.

### 3. Feedback por respuesta
- **Campos**: `response_id ASC`, `created_at DESC`
- **Uso**: Auditoría de una respuesta específica.

### 4. Feedback por usuario y modo
- **Campos**: `user_id ASC`, `active_mode ASC`, `created_at DESC`
- **Uso**: Ver historial del usuario en una sección específica.

### 5. Ranking por satisfacción en modo
- **Campos**: `active_mode ASC`, `ratings.overall_satisfaction DESC`, `created_at DESC`
- **Uso**: Revisar extremos o calidad por modo.

### 6. Feedback con comentarios
- **Campos**: `has_comment ASC`, `created_at DESC`
- **Uso**: Tabla de comentarios recientes.

### 7. Filtrado temporal general
- **Campos**: `created_at DESC`
- **Uso**: Ventanas temporales y reportes.

---

## Nota
Los documentos bajo `analytics/*` y `users/*/feedback_summary/*` normalmente no requieren índices compuestos complejos, porque se consultan por ID directo.
