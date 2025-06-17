// components/PackagesSection.tsx

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PackageItem from './packageitem'; // Make sure this is correctly named and located

interface PackagesSectionProps {
  sections: any[];
  expandedSections: { [key: string]: boolean };
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onToggleSection: (sectionTitle: string) => void;
}

const PackagesSection: React.FC<PackagesSectionProps> = ({
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
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggleSection(title);
        }}
        style={[styles.sectionHeader, { backgroundColor: colors.background }]}
      >
        <ThemedText style={[styles.sectionHeaderText, { color: colors.text }]}>
          {title}
        </ThemedText>
        <MaterialIcons
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    return <PackageItem item={item} />;
  };

  const filteredSections =
    searchQuery.trim().length === 0
      ? sections
      : sections
          .map((section) => ({
            title: section.title,
            data: section.data.filter((pkg: any) =>
              (pkg.packageName || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
            ),
          }))
          .filter((section) => section.data.length > 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
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
      {/* Search Bar */}
      <ThemedView style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="search" size={24} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search packages"
          placeholderTextColor={colors.text}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </ThemedView>

      <SectionList
        sections={filteredSections}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item, section }) =>
          expandedSections[section.title] ? renderItem({ item }) : null
        }
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.tableBody}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
};

export default PackagesSection;
