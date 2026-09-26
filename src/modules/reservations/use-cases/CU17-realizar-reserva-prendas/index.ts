/**
 * @caso-de-uso CU17 — Realizar reserva de prendas
 * @subsistema Reservas
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Cliente -> formulario de reserva -> controlador de reservas -> servicio de disponibilidad -> Reserva/DetalleReserva/Inventario/Sucursal.
 */
export * from './components/MobileReservationModal';
export * from './components/MobileReservationReceiptModal';
export * from './services/reservation.service';
export * from './types/reservation.types';
