import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { ChevronRight, AlertCircle } from 'lucide-react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/utils/theme';
import { SettingItemProps } from './types';

export const SettingItem: React.FC<SettingItemProps> = ({
  icon: Icon,
  label,
  value,
  onPress,
  showSwitch,
  switchValue,
  onSwitchChange,
  showChevron = true,
  showAlert = false
}) => {
  const colors = useTheme();

  return (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={showSwitch}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.tagBackground }]}>
        <Icon size={20} color={colors.text} />
      </View>
      <View style={styles.settingItemContent}>
        <View style={styles.settingLabelContainer}>
          <ThemedText style={[styles.settingLabel, { color: colors.text }]}>{label}</ThemedText>
          {showAlert && (
            <View style={[styles.alertBadge, { backgroundColor: colors.error }]}>
              <AlertCircle size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        {value && <ThemedText style={[styles.settingValue, { color: colors.text }]}>{value}</ThemedText>}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor={colors.card}
        />
      ) : showChevron && <ChevronRight size={20} color={colors.text} style={{ opacity: 0.5 }} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingItemContent: {
    flex: 1,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  alertBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 