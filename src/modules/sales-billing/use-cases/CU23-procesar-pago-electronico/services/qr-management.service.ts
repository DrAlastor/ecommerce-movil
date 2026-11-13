import api from '../../../../../services/api';

export interface CompanyQrSettings {
  codigo_empresa: string;
  nombre_comercial: string;
  razon_social: string;
  nit: string;
  qr_cuenta_banco?: string;
  qr_numero_cuenta?: string;
  qr_titular?: string;
  qr_documento_titular?: string;
  qr_imagen_url?: string;
  qr_tipo_cobro?: 'cuenta' | 'imagen';
}

export const qrManagementService = {
  /**
   * Obtiene la configuración de pago por QR de la tienda activa
   */
  async getCompanyQrSettings(tenantKey?: string): Promise<CompanyQrSettings> {
    const activeTenant = tenantKey || 'dressly';
    const res = await api.get<CompanyQrSettings>(`/users-security/company/public/${activeTenant}`);
    return res.data;
  },

  /**
   * Actualiza el QR oficial configurado por el Administrador / Cajero / Encargado
   */
  async updateCompanyQr(
    settings: {
      qr_cuenta_banco?: string;
      qr_numero_cuenta?: string;
      qr_titular?: string;
      qr_documento_titular?: string;
      qr_imagen_url?: string;
      qr_tipo_cobro?: 'cuenta' | 'imagen';
    },
    tenantKey?: string,
  ): Promise<CompanyQrSettings> {
    const activeTenant = tenantKey || 'dressly';
    const res = await api.put<{ success: boolean; data: CompanyQrSettings }>(
      '/users-security/company',
      settings,
      { params: { tenant: activeTenant } }
    );
    return res.data?.data || res.data;
  },
};

