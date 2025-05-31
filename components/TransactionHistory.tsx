import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SectionList } from 'react-native';
import TransactionItem from './TransactionItem';

interface TransactionHistoryProps {
  sections: any[];
  expandedSections: { [key: string]: boolean };
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onToggleSection: (sectionTitle: string) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  sections,
  expandedSections,
  searchQuery,
  onSearchChange,
  onToggleSection,
}) => {
  const colors = useTheme();

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => {
    const isExpanded = !!expandedSections[title];
    return (
      <TouchableOpacity 
        onPress={() => onToggleSection(title)} 
        style={[styles.sectionHeader, { backgroundColor: colors.background }]}
      >
        <ThemedText style={[styles.sectionHeaderText, { color: colors.text }]}>{title}</ThemedText>
        <MaterialIcons
          name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    return <TransactionItem item={item} />;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
      marginHorizontal: 10,
      marginBottom: 10,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderColor: colors.border,
    },
    filterButtonText: {
      marginRight: 4,
      fontSize: 14,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderWidth: 1,
      borderRadius: 20,
      marginHorizontal: 10,
      marginBottom: 10,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 16,
      paddingVertical: 0,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    sectionHeaderText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    tableBody: {
      paddingBottom: 20,
    },
  });

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <ThemedView style={[styles.filterContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
          <ThemedText style={[styles.filterButtonText, { color: colors.text }]}>Status</ThemedText>
          <MaterialIcons name="arrow-drop-down" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
          <ThemedText style={[styles.filterButtonText, { color: colors.text }]}>Payment method</ThemedText>
          <MaterialIcons name="arrow-drop-down" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
          <ThemedText style={[styles.filterButtonText, { color: colors.text }]}>Date</ThemedText>
          <MaterialIcons name="arrow-drop-down" size={20} color={colors.text} />
        </TouchableOpacity>
      </ThemedView>

      {/* Search Bar */}
      <ThemedView style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="search" size={24} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search transactions"
          placeholderTextColor={colors.text}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </ThemedView>

      {/* Section List */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.payment_id?.toString() || index.toString()}
        renderItem={({ item, section }) => {
          if (expandedSections[section.title]) {
            return renderItem({ item });
          } else {
            return null;
          }
        }}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.tableBody}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
};

export default TransactionHistory; 