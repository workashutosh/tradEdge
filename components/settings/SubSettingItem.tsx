import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/utils/theme';
import { SubSettingItemProps } from './types';

export const SubSettingItem: React.FC<SubSettingItemProps> = ({
  icon: Icon,
  label,
  value,
  onPress,
  showSwitch,
  switchValue,
  onSwitchChange,
}) => {
  const colors = useTheme();

  return (
    <TouchableOpacity 
      style={styles.subSettingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.tagBackground }]}>
        <Icon size={18} color={colors.text} />
      </View>
      <View style={styles.content}>
        <ThemedText style={[styles.label, { color: colors.text }]}>{label}</ThemedText>
        {typeof value === 'string' && (
          <ThemedText style={[styles.value, { color: colors.text }]}>{value}</ThemedText>
        )}
      </View>
      {showSwitch ? (
        <Switch
          value={typeof switchValue === 'boolean' ? switchValue : false}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor={colors.card}
        />
      ) : (
        <ChevronRight size={20} color={colors.text} style={{ opacity: 0.5 }} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  subSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
}); 