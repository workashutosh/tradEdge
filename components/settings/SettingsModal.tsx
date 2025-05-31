import React from 'react';
import { View, Modal, SafeAreaView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '@/utils/theme';
import { SubSettingItem } from './SubSettingItem';
import { SettingCategory, SubOption } from './types';
import { useSettings } from '@/context/SettingsContext';

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  setting: SettingCategory;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  setting,
}) => {
  const colors = useTheme();
  const { settings, updateSetting } = useSettings();

  const renderSubSetting = ({ item }: { item: SubOption }) => {
    const currentValue = settings[item.id] ?? item.value;
    
    return (
      <SubSettingItem
        icon={item.icon}
        label={item.label}
        value={currentValue}
        showSwitch={item.showSwitch !== false}
        switchValue={typeof currentValue === 'boolean' ? currentValue : false}
        onSwitchChange={(value) => updateSetting(item.id, value)}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onClose}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              {setting.title}
            </ThemedText>
            <ThemedText style={[styles.description, { color: colors.text }]}>
              {setting.description}
            </ThemedText>
          </View>
        </View>
        
        <FlatList
          data={setting.subOptions}
          renderItem={renderSubSetting}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
}); 