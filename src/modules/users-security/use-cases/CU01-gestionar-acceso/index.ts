/**
 * @caso-de-uso CU01 — Gestionar acceso al sistema
 * @subsistema Usuarios y Seguridad
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Usuario -> interfaz de acceso -> controlador de autenticación -> servicio de acceso -> Usuario/Rol/Sesión/Bitácora.
 */
/**
 * CU01 — Iniciar sesión (Móvil)
 */
export { default as LoginScreen } from './screens/LoginScreen';
