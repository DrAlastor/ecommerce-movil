/**
 * @caso-de-uso CU02 — Registrar y gestionar perfil de cliente
 * @subsistema Usuarios y Seguridad
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Cliente -> formulario de perfil -> controlador de perfil -> servicio de clientes -> Usuario/Cliente/Rol.
 */
/**
 * CU03 — Gestionar perfil de usuario (Móvil)
 */
export { default as ProfileScreen } from './screens/ProfileScreen';
export { default as RegisterScreen } from './screens/RegisterScreen';
