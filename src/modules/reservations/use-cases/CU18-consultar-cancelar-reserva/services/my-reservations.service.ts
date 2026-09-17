import api from '../../../../../services/api';
import type {
  MyReservationListItem,
  CancelReservationResponse,
  ReservationReceipt,
} from '../types/my-reservations.types';

export const mobileMyReservationsService = {
  /**
   * Obtiene la lista de reservas del cliente autenticado
   */
  async getMyReservations(filtro?: 'activas' | 'historico' | string): Promise<MyReservationListItem[]> {
    const response = await api.get<MyReservationListItem[]>('/reservations/my-reservations', {
      params: { filtro },
    });
    return response.data;
  },

  /**
   * Cancela una reserva activa
   */
  async cancelReservation(id: number, motivo?: string): Promise<CancelReservationResponse> {
    const response = await api.patch<CancelReservationResponse>(
      `/reservations/${id}/cancel`,
      { motivo },
    );
    return response.data;
  },

  /**
   * Obtiene comprobante completo de una reserva por su ID
   */
  async getReservationById(id: number): Promise<ReservationReceipt> {
    const response = await api.get<ReservationReceipt>(`/reservations/${id}`);
    return response.data;
  },
};

export default mobileMyReservationsService;
