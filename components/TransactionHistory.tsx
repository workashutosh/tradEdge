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
    // Use expandedSections for all sections, including Today
    const isExpanded = !!expandedSections[title];
    return (
      <TouchableOpacity 
        onPress={() => onToggleSection(title)} 
        style={[styles.sectionHeader, { backgroundColor: colors.background }]}
      >
        <ThemedText
          style={[
            styles.sectionHeaderText,
            {
               color: !colors.isDarkMode ? '#000' : '#fff',
                paddingLeft: 8,
            },
          ]}
        >
          {title}
        </ThemedText>
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

  // Helper to get section label based on date
  function getSectionLabel(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffMs = today.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Last Day';
    if (diffDays <= 7) return 'Last Week';
    if (diffDays <= 31) return 'Last Month';
    // fallback to month-year
    return `${date.getFullYear()} ${date.toLocaleString('default', { month: 'long' })}`;
  }

  // Helper to get section label based on status
  function getStatusLabel(status: string | undefined): string {
    if (!status) return 'Unknown';
    const s = status.toLowerCase();
    if (s.includes('success')) return 'Success';
    if (s.includes('fail')) return 'Failed';
    if (s.includes('pend')) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Group transactions by status if searchQuery matches a status, else by date
  let groupedPayments: { [key: string]: any[] } = {};
  const statusFilters = ['success', 'failed', 'pending'];
  const statusQuery = searchQuery.trim().toLowerCase();
  if (statusFilters.some(s => statusQuery === s)) {
    // Group by status
    sections.forEach(section => {
      section.data.forEach((item: any) => {
        const label = getStatusLabel(item.status);
        if (!groupedPayments[label]) groupedPayments[label] = [];
        groupedPayments[label].push(item);
      });
    });
  } else {
    // Group by date
    sections.forEach(section => {
      section.data.forEach((item: any) => {
        const date = item.payment_date ? new Date(item.payment_date.replace(' ', 'T')) : null;
        if (!date) return;
        const label = getSectionLabel(date);
        if (!groupedPayments[label]) groupedPayments[label] = [];
        groupedPayments[label].push(item);
      });
    });
  }

  // Filter sections and items by searchQuery (stock/package name or status)
  const filteredSections = searchQuery.trim().length === 0
    ? Object.keys(groupedPayments).map(label => ({ title: label, data: groupedPayments[label] }))
    : Object.keys(groupedPayments)
        .map(label => ({
          title: label,
          data: groupedPayments[label].filter((item: any) =>
            (item.packageName || '').toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            (item.status || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
          )
        }))
        .filter(section => section.data.length > 0);

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
      color: '#fff',
    },
    tableBody: {
      paddingBottom: 20,
    },
  });

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      { /*
      <ThemedView style={[styles.filterContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
          <ThemedText style={[styles.filterButtonText, { color: '#fff' }]}>Status</ThemedText>
          <MaterialIcons name="arrow-drop-down" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
          <ThemedText style={[styles.filterButtonText, { color: '#fff' }]}>Payment method</ThemedText>
          <MaterialIcons name="arrow-drop-down" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
          <ThemedText style={[styles.filterButtonText, { color: '#fff' }]}>Date</ThemedText>
          <MaterialIcons name="arrow-drop-down" size={20} color={colors.text} />
        </TouchableOpacity>
      </ThemedView>
      */ }

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
        sections={filteredSections}
        keyExtractor={(item, index) => item.payment_id?.toString() || index.toString()}
        renderItem={({ item, section }) => {
          // Only render items if section is expanded
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