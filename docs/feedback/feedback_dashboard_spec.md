# Feedback Dashboard Spec

## Objetivo
Visualizar la salud del sistema y la satisfacción del usuario mediante métricas claras y accionables.

---

## 1. Dashboard Personal (User View)
- **KPIs**: Total evaluaciones enviadas, Promedio personal de satisfacción.
- **Gráficos**:
  - Radar Chart: Promedio por dimensión (Funcionalidad, Precisión, etc.).
  - Line Chart: Evolución de su satisfacción en el tiempo.
- **Lista**: Últimos comentarios enviados.

---

## 2. Dashboard Analítico Global (Admin View)
- **KPIs**: NPS (derivado de `would_use_again`), Calidad Media Global, Tasa de Comentarios.
- **Gráficos**:
  - Bar Chart: Comparativa de calidad entre Modos (ej. 'genetic_assistant' vs 'report_interpreter').
  - Time Series: Tendencia diaria de feedback recibido.
  - Pie Chart: Distribución de `domain_status` (cuántos queries caen fuera de dominio).
- **Tabla**: Comentarios recientes con filtros por sentimiento (basado en `quality_score`).

---

## Estrategia de Gráficos (Recharts/D3)
- **Barras**: Para promedios por dimensión.
- **Líneas**: Para series temporales (Daily Analytics).
- **Donut**: Para `would_use_again_rate`.
- **Heatmap**: Para ver horas/días de mayor actividad de feedback.

---

## Filtros Requeridos
- Rango de fechas (Hoy, 7d, 30d, Custom).
- Modo del Sidebar.
- Verification Status (¿Son más precisas las respuestas verificadas?).
- Intent.
