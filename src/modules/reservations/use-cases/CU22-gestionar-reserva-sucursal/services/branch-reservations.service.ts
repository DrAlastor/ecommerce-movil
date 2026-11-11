import api from '../../../../../services/api';
import type {
  StaffBranch,
  BranchReservationsResponse,
  QueryBranchReservationsParams,
  UpdateBranchReservationStatusPayload,
  BranchReservation,
} from '../types/branch-reservations.types';

export const branchReservationsService = {
  /**
   * Obtiene la lista de sucursales a las que el empleado o admin tiene acceso
   */
  async getMyBranches(): Promise<StaffBranch[]> {
    const response = await api.get<StaffBranch[]>('/reservations/branch/my-branches');
    return response.data;
  },

  /**
   * Consulta el listado de reservas de la sucursal
   */
  async getBranchReservations(
    params?: QueryBranchReservationsParams,
  ): Promise<BranchReservationsResponse> {
    const response = await api.get<BranchReservationsResponse>('/reservations/branch/list', {
      params,
    });
    return response.data;
  },

  /**
   * Actualiza el estado de una reserva en sucursal (Preparada, Atendida, Completada, Cancelada)
   */
  async updateReservationStatus(
    id: number,
    payload: UpdateBranchReservationStatusPayload,
  ): Promise<{ success: boolean; message: string; reserva: BranchReservation }> {
    const response = await api.patch<{ success: boolean; message: string; reserva: BranchReservation }>(
      `/reservations/branch/${id}/status`,
      payload,
    );
    return response.data;
  },

  /**
   * Busca una reserva directamente por su código de retiro
   */
  async getReservationByCode(code: string): Promise<BranchReservation> {
    const response = await api.get<BranchReservation>(`/reservations/code/${encodeURIComponent(code)}`);
    return response.data;
  },
};
