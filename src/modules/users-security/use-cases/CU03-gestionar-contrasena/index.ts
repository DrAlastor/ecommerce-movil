/**
 * @caso-de-uso CU03 — Gestionar contraseña
 * @subsistema Usuarios y Seguridad
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Usuario -> formulario de contraseña -> controlador de credenciales -> servicio de recuperación -> Usuario/Token de recuperación.
 */
/**
 * CU04 — Gestionar contraseña (Móvil)
 */
export { default as ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
export { default as ResetPasswordScreen } from './screens/ResetPasswordScreen';
