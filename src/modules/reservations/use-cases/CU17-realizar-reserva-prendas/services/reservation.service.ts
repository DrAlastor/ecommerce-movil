/**
 * @caso-de-uso CU17 — Realizar reserva de prendas
 * @subsistema Reservas
 * @capa Service/Gateway — Aplicación móvil
 * @responsabilidad Encapsula la comunicación con la API o integración externa y transforma su respuesta para la capa de presentación.
 * @secuencia Cliente -> formulario de reserva -> controlador de reservas -> servicio de disponibilidad -> Reserva/DetalleReserva/Inventario/Sucursal.
 */
import api from '../../../../../services/api';
import type {
  CreateReservationPayload,
  ReservationReceipt,
  VariantAvailabilityResponse,
} from '../types/reservation.types';

export const mobileReservationService = {
  /**
   * Consulta las sucursales físicas activas con existencias de una variante
   */
  async getBranchAvailability(variantId: number): Promise<VariantAvailabilityResponse> {
    const response = await api.get<VariantAvailabilityResponse>(
      `/reservations/branch-availability/${variantId}`,
    );
    return response.data;
  },

  /**
   * Registra una nueva reserva temporal de prendas (CU17)
   */
  async createReservation(payload: CreateReservationPayload): Promise<ReservationReceipt> {
    const response = await api.post<ReservationReceipt>('/reservations', payload);
    return response.data;
  },

  /**
   * Consulta el comprobante completo de una reserva por su ID
   */
  async getReservationById(id: number): Promise<ReservationReceipt> {
    const response = await api.get<ReservationReceipt>(`/reservations/${id}`);
    return response.data;
  },
};

export default mobileReservationService;
