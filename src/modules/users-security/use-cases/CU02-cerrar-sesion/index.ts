/**
 * CU02 — Cerrar sesión (Móvil)
 *
 * Permite al usuario autenticado finalizar su sesión activa en la aplicación móvil,
 * notificando al backend (POST /auth/logout) para registrar el cierre en la bitácora
 * y marcar al usuario como 'Desconectado', además de purgar el token JWT y estado local.
 */
import { authService } from '../../shared/services/auth.service';

export const logoutUser = async (): Promise<void> => {
  await authService.logout();
};

export default logoutUser;
