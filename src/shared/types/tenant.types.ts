export interface TenantInfo {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  logoUrl: string;
  localLogo: any;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  backgroundColor: string;
}

export const AVAILABLE_TENANTS: Record<string, TenantInfo> = {
  saas: {
    id: 'saas',
    name: 'FashionStore SaaS Platform',
    tagline: 'Super Administrador Global',
    category: 'Administración SaaS',
    description: 'Gestión centralizada de inquilinos, monitoreo en tiempo real, auditoría global y métricas de Machine Learning.',
    logoUrl: 'https://fashionstorestorages.blob.core.windows.net/media/logo-fashionstore.png',
    localLogo: require('../../assets/logo-fashionstore.png'),
    primaryColor: '#0F172A',
    accentColor: '#6366F1',
    surfaceColor: '#F8FAFC',
    backgroundColor: '#FFFFFF',
  },
  dressly: {
    id: 'dressly',
    name: 'Dressly Fashion Store',
    tagline: 'Colección Femenina y Masculina',
    category: 'Moda y Ropa Contemporánea',
    description: 'Boutique de alta costura, vestidos, sastrería y accesorios con vestidor interactivo 3D.',
    logoUrl: 'https://fashionstorestorages.blob.core.windows.net/media/logo-dressly.jpg',
    localLogo: require('../../assets/logo-dressly.jpg'),
    primaryColor: '#1A1A1A',
    accentColor: '#9C6B40',
    surfaceColor: '#FAF8F5',
    backgroundColor: '#FFFFFF',
  },
  'aura-sport': {
    id: 'aura-sport',
    name: 'Aura Athletics & Sportswear',
    tagline: 'Alto Rendimiento y Fitness',
    category: 'Deportivo y Running',
    description: 'Indumentaria técnica para running, entrenamiento funcional, compresión Dry-Fit y calzado.',
    logoUrl: 'https://fashionstorestorages.blob.core.windows.net/media/logo-aura.jpg',
    localLogo: require('../../assets/logo-aura.jpg'),
    primaryColor: '#0F172A',
    accentColor: '#0D9488',
    surfaceColor: '#F8FAFC',
    backgroundColor: '#FFFFFF',
  },
  urbanly: {
    id: 'urbanly',
    name: 'Urbanly Fashion Store',
    tagline: 'Streetwear & Oversize',
    category: 'Moda Urbana Contemporánea',
    description: 'Prendas oversize, hoodies pesados de 500 GSM, pantalones cargo tácticos y estética urbana.',
    logoUrl: 'https://fashionstorestorages.blob.core.windows.net/media/logo-urbanly.png',
    localLogo: require('../../assets/logo-urbanly.png'),
    primaryColor: '#171717',
    accentColor: '#D97706',
    surfaceColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
};

export const DEFAULT_TENANT_ID = 'dressly';

