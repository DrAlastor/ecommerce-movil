import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface VirtualFittingButtonProps {
  model3dUrl?: string | null;
  productId?: number;
  variantId?: number;
  onPress?: () => void;
}

export const VirtualFittingButton: React.FC<VirtualFittingButtonProps> = ({
  model3dUrl,
  productId,
  variantId,
  onPress,
}) => {
  const navigation = useNavigation<any>();
  if (!model3dUrl) return null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation) {
      navigation.navigate('VirtualFitting', {
        id_producto: productId,
        variantId: variantId,
      });
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.iconCircle}>
        <Text style={styles.cubeIcon}>📦</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Probar virtualmente en 3D</Text>
        <Text style={styles.subtitle}>Ver en avatar / Realidad Aumentada</Text>
      </View>
      <Text style={styles.arrowIcon}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cubeIcon: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3730A3',
  },
  subtitle: {
    fontSize: 11,
    color: '#4F46E5',
    marginTop: 1,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#4F46E5',
    fontWeight: '700',
  },
});
