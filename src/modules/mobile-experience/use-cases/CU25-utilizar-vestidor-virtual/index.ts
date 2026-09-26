/**
 * @caso-de-uso CU25 — Utilizar vestidor virtual
 * @subsistema Experiencia Móvil
 * @capa Fachada del módulo — Aplicación móvil
 * @responsabilidad Expone la API pública del caso de uso y centraliza sus exportaciones para el resto de la aplicación.
 * @secuencia Cliente -> vestidor virtual -> controlador de experiencia -> servicios de cámara y renderizado -> Producto/Variante/Recursos 3D.
 */
/**
 * CU25 — Utilizar Vestidor Virtual (Móvil)
 * Exclusivo Móvil: Realidad aumentada / Prueba virtual interactiva de prendas sobre silueta o avatar
 */
export * from './types/virtual-fitting.types';
export * from './services/virtual-fitting.service';
export * from './hooks/useMobileVirtualFitting';
export * from './components/CalibrationStep';
export * from './components/FittingCanvas';
export * from './components/FittingVariantSelector';
export * from './components/FittingBottomActions';
export * from './screens/VirtualFittingScreen';
export { default } from './screens/VirtualFittingScreen';
