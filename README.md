# GestorSuscripciones

Primera versión funcional de un gestor personal de suscripciones.

## Qué incluye

- Dashboard con gasto mensual equivalente y previsión anual.
- Próxima renovación y gasto previsto para los próximos 30 días.
- Alta manual de suscripciones.
- Frecuencia mensual, trimestral, anual o pago único.
- Calendario de cobros para los próximos 12 meses.
- Marcado de servicios que quieres cancelar antes de renovar.
- Filtros y búsqueda.
- Persistencia local mediante `localStorage`.
- Diseño responsive para escritorio y móvil.

## Cómo probarlo

No necesita instalación ni dependencias. Abre `index.html` directamente en el navegador o sirve la carpeta con cualquier servidor estático.

Por ejemplo, con Python:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000`.

## Próximas fases

1. Backend y cuenta de usuario para sincronizar datos entre dispositivos.
2. Notificaciones reales antes de cada renovación.
3. Historial de pagos y cambios de precio.
4. Importación de recibos o detección desde correo electrónico.
5. PWA / app móvil instalable.
