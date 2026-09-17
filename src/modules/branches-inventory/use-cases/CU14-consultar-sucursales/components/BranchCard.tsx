import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { MobileBranch } from '../types';
import { isBranchOpenNow } from '../hooks/useMobileBranches';

interface BranchCardProps {
  branch: MobileBranch;
  isSelectMode: boolean;
  onSelectBranch?: (branch: MobileBranch) => void;
  onOpenMaps: (branch: MobileBranch) => void;
  onCall: (phone: string) => void;
}

export const BranchCard: React.FC<BranchCardProps> = React.memo(({
  branch,
  isSelectMode,
  onSelectBranch,
  onOpenMaps,
  onCall,
}) => {
  const status = isBranchOpenNow(branch.hora_apertura, branch.hora_cierre);

  return (
    <TouchableOpacity
      style={[styles.branchCard, isSelectMode && styles.branchCardSelectable]}
      onPress={() => isSelectMode && onSelectBranch && onSelectBranch(branch)}
      activeOpacity={isSelectMode ? 0.7 : 1}
    >
      {/* Encabezado: Ciudad y Estado */}
      <View style={styles.cardHeader}>
        <View style={styles.cityBadge}>
          <Text style={styles.cityBadgeText}>📍 {branch.ciudad.nombre}</Text>
        </View>
        <View style={[styles.statusBadge, status.isOpen ? styles.statusOpen : styles.statusClosed]}>
          <View style={[styles.statusDot, status.isOpen ? styles.dotOpen : styles.dotClosed]} />
          <Text style={[styles.statusText, status.isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
            {status.isOpen ? 'Abierto' : 'Cerrado'}
          </Text>
        </View>
      </View>

      {/* Nombre de la sucursal */}
      <Text style={styles.branchName}>{branch.nombre}</Text>

      {/* Detalles de atención */}
      <View style={styles.detailsContainer}>
        {/* Dirección */}
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🏢</Text>
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Dirección</Text>
            <Text style={styles.detailValue}>{branch.direccion}</Text>
          </View>
        </View>

        {/* Horario */}
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🕒</Text>
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Horario de atención</Text>
            <Text style={styles.detailValue}>
              {branch.hora_apertura || '10:00'} - {branch.hora_cierre || '21:00'}
            </Text>
            <Text style={styles.statusSubtext}>{status.message}</Text>
          </View>
        </View>

        {/* Teléfono */}
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📞</Text>
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Teléfono</Text>
            <Text style={styles.detailValue}>{branch.telefono || 'Sin teléfono'}</Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.mapButton]}
          onPress={() => onOpenMaps(branch)}
          activeOpacity={0.8}
        >
          <Text style={styles.mapButtonText}>📍 Cómo llegar</Text>
        </TouchableOpacity>

        {Boolean(branch.telefono) && (
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => onCall(branch.telefono)}
            activeOpacity={0.8}
          >
            <Text style={styles.callButtonText}>📞 Llamar</Text>
          </TouchableOpacity>
        )}

        {isSelectMode && (
          <TouchableOpacity
            style={[styles.actionButton, styles.selectButton]}
            onPress={() => onSelectBranch && onSelectBranch(branch)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectButtonText}>Elegir esta ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

BranchCard.displayName = 'BranchCard';

const styles = StyleSheet.create({
  branchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE7E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
  },
  branchCardSelectable: {
    borderColor: '#C4956A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cityBadge: {
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E4929',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusOpen: {
    backgroundColor: '#ECFDF5',
  },
  statusClosed: {
    backgroundColor: '#FFFBEB',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOpen: {
    backgroundColor: '#10B981',
  },
  dotClosed: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextOpen: {
    color: '#065F46',
  },
  statusTextClosed: {
    color: '#92400E',
  },
  branchName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1510',
    marginBottom: 14,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#8C827A',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#2D2520',
    fontWeight: '500',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#71717A',
    fontStyle: 'italic',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F5F2EC',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButton: {
    backgroundColor: '#F8F5F1',
    borderWidth: 1,
    borderColor: '#ECE7E0',
  },
  mapButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#332B25',
  },
  callButton: {
    backgroundColor: '#FAF4ED',
    borderWidth: 1,
    borderColor: '#EEDDCD',
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5E34',
  },
  selectButton: {
    backgroundColor: '#C4956A',
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
