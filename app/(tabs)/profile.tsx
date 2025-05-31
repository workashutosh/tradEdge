import { View, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, Dimensions, Switch, Modal, Linking } from 'react-native';
import React, { useRef, useState } from 'react';
import KycComponent from '../../components/KycComponent';
import Header from '@/components/Header';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useUser } from '@/context/UserContext';
import Transactions from '@/components/Transactions';
import { useTheme } from '@/utils/theme';
import { 
  User, Mail, Phone, Shield, CreditCard, History, Settings, LogOut, ChevronRight,
  Bell, Moon, Globe, Lock, HelpCircle, FileText, Share2, AlertCircle, ArrowLeft,
  MessageSquare, PhoneCall, Mail as MailIcon, Smartphone, Shield as ShieldIcon,
  CreditCard as CardIcon, FileText as DocIcon, Share as ShareIcon, Globe as GlobeIcon,
  Clock, Info, Twitter, Linkedin, Instagram
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';
import { SettingItem } from '@/components/settings/SettingItem';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { settingsData } from '@/components/settings/settingsData';

const { width } = Dimensions.get('window');

type SubOption = {
  id: string;
  label: string;
  icon: any;
  value: boolean | string;
  showSwitch?: boolean;
};

type SettingCategory = {
  title: string;
  icon: any;
  description: string;
  subOptions: SubOption[];
};

export default function Profile() {
  const colors = useTheme();
  const { userDetails } = useUser();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Settings states
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [showSubSettings, setShowSubSettings] = useState(false);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 120],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{title}</ThemedText>
      {children}
    </ThemedView>
  );

  const ProfileItem = ({ icon: Icon, label, value, onPress }: { icon: any; label: string; value: string; onPress?: () => void }) => (
    <TouchableOpacity 
      style={styles.profileItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.tagBackground }]}>
        <Icon size={20} color={colors.text} />
      </View>
      <View style={styles.profileItemContent}>
        <ThemedText style={[styles.profileLabel, { color: colors.text, opacity: 0.7 }]}>{label}</ThemedText>
        <ThemedText style={[styles.profileValue, { color: colors.text }]}>{value}</ThemedText>
      </View>
      {onPress && <ChevronRight size={20} color={colors.text} style={{ opacity: 0.5 }} />}
    </TouchableOpacity>
  );

  const SocialMediaItem = ({ icon: Icon, url }: { icon: any; url: string }) => (
    <TouchableOpacity 
      style={styles.socialIconButton}
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.7}
    >
      <View style={[styles.socialIconContainer, { backgroundColor: colors.tagBackground }]}>
        <Icon size={24} color={colors.text} />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, { height: headerHeight, opacity: headerOpacity }]}>
      <LinearGradient
        colors={['#04810E', '#039D74']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.card }]}>
            <User size={40} color={colors.text} />
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={[styles.userName, { color: '#FFFFFF' }]}>{userDetails?.user_full_name || "User"}</ThemedText>
            <ThemedText style={[styles.userRole, { color: '#FFFFFF' }]}>Active Trader</ThemedText>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: '#FFFFFF' }]}>₹50K</ThemedText>
            <ThemedText style={[styles.statLabel, { color: '#FFFFFF' }]}>Portfolio</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: '#FFFFFF' }]}>12</ThemedText>
            <ThemedText style={[styles.statLabel, { color: '#FFFFFF' }]}>Trades</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: '#FFFFFF' }]}>₹2.5K</ThemedText>
            <ThemedText style={[styles.statLabel, { color: '#FFFFFF' }]}>Profit</ThemedText>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderProfileInfo = () => (
    <ProfileSection title="Personal Information">
      <ProfileItem
        icon={User}
        label="Full Name"
        value={userDetails?.user_full_name || "Not provided"}
      />
      <ProfileItem
        icon={Mail}
        label="Email"
        value={userDetails?.user_email_id || "Not provided"}
      />
      <ProfileItem
        icon={Phone}
        label="Phone Number"
        value={userDetails?.username || "Not provided"}
      />
    </ProfileSection>
  );

  const renderAccountSettings = () => (
    <ProfileSection title="Account Settings">
      {Object.entries(settingsData).map(([key, setting]) => (
        <SettingItem
          key={key}
          icon={setting.icon}
          label={setting.title}
          value={setting.description}
          onPress={() => {
            setSelectedSetting(key);
            setShowSubSettings(true);
          }}
        />
      ))}
      {selectedSetting && (
        <SettingsModal
          visible={showSubSettings}
          onClose={() => {
            setShowSubSettings(false);
            setSelectedSetting(null);
          }}
          setting={settingsData[selectedSetting]}
        />
      )}
    </ProfileSection>
  );

  const renderKycStatus = () => (
    <ProfileSection title="Account Status">
      <KycComponent />
    </ProfileSection>
  );

  const renderTransactionHistory = () => (
    <ProfileSection title="Transaction History">
      <Transactions />
    </ProfileSection>
  );

  const renderSocialMedia = () => (
    <ProfileSection title="Social Media">
      <View style={styles.socialMediaRow}>
        <SocialMediaItem
          icon={Twitter}
          url="https://twitter.com/tradedge"
        />
        <SocialMediaItem
          icon={Linkedin}
          url="https://linkedin.com/company/tradedge"
        />
        <SocialMediaItem
          icon={Instagram}
          url="https://instagram.com/tradedge"
        />
      </View>
    </ProfileSection>
  );

  const sections = [
    { id: 'header', render: renderHeader },
    { id: 'profile', render: renderProfileInfo },
    { id: 'settings', render: renderAccountSettings },
    { id: 'kyc', render: renderKycStatus },
    { id: 'transactions', render: renderTransactionHistory },
    { id: 'social', render: renderSocialMedia },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Profile" showLogoutButton={true} />
      <Animated.FlatList
        data={sections}
        renderItem={({ item }) => item.render()}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListFooterComponent={<View style={{ height: 32 }} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  headerContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    padding: 24,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileItemContent: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
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
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  subSettingsList: {
    padding: 16,
  },
  subSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    marginBottom: 8,
  },
  subSettingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subSettingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  subSettingContent: {
    flex: 1,
    marginRight: 8,
  },
  subSettingValue: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  settingItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  socialMediaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  socialIconButton: {
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});