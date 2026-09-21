import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  ElegantAlertModal,
  type AlertType,
} from '../components/ElegantAlertModal';

export interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  type?: AlertType;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Referencia global para llamadas estáticas fuera de componentes
let globalShowAlert: ((options: AlertOptions) => void) | null = null;
let globalShowConfirm: ((options: ConfirmOptions) => void) | null = null;

export const ElegantAlert = {
  show: (title: string, message: string, type: AlertType = 'info', onPrimaryPress?: () => void) => {
    if (globalShowAlert) {
      globalShowAlert({ title, message, type, onPrimaryPress });
    }
  },
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    type: AlertType = 'warning',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ) => {
    if (globalShowConfirm) {
      globalShowConfirm({
        title,
        message,
        type,
        primaryButtonText: confirmText,
        secondaryButtonText: cancelText,
        onConfirm,
        onCancel,
      });
    }
  },
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    primaryButtonText: string;
    secondaryButtonText?: string;
    onPrimaryPress: () => void;
    onSecondaryPress?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    primaryButtonText: 'Entendido',
    onPrimaryPress: () => {},
  });

  const hideAlert = useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showAlert = useCallback(
    ({
      title,
      message,
      type = 'info',
      primaryButtonText = 'Entendido',
      onPrimaryPress,
    }: AlertOptions) => {
      setModalState({
        visible: true,
        type,
        title,
        message,
        primaryButtonText,
        secondaryButtonText: undefined,
        onPrimaryPress: () => {
          hideAlert();
          if (onPrimaryPress) onPrimaryPress();
        },
      });
    },
    [hideAlert]
  );

  const showConfirm = useCallback(
    ({
      title,
      message,
      type = 'warning',
      primaryButtonText = 'Confirmar',
      secondaryButtonText = 'Cancelar',
      onConfirm,
      onCancel,
    }: ConfirmOptions) => {
      setModalState({
        visible: true,
        type,
        title,
        message,
        primaryButtonText,
        secondaryButtonText,
        onPrimaryPress: () => {
          hideAlert();
          onConfirm();
        },
        onSecondaryPress: () => {
          hideAlert();
          if (onCancel) onCancel();
        },
      });
    },
    [hideAlert]
  );

  // Registrar listeners globales
  globalShowAlert = showAlert;
  globalShowConfirm = showConfirm;

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, hideAlert }}>
      {children}
      <ElegantAlertModal
        visible={modalState.visible}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        primaryButtonText={modalState.primaryButtonText}
        secondaryButtonText={modalState.secondaryButtonText}
        onPrimaryPress={modalState.onPrimaryPress}
        onSecondaryPress={modalState.onSecondaryPress}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe ser utilizado dentro de un AlertProvider');
  }
  return context;
};
