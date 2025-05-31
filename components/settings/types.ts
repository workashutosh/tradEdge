import { LucideIcon } from 'lucide-react-native';

export type SubOption = {
  id: string;
  label: string;
  icon: LucideIcon;
  value: boolean | string;
  showSwitch?: boolean;
};

export type SettingCategory = {
  title: string;
  icon: LucideIcon;
  description: string;
  subOptions: SubOption[];
};

export type SettingsData = Record<string, SettingCategory>;

export type SettingItemProps = {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  showChevron?: boolean;
  showAlert?: boolean;
};

export type SubSettingItemProps = {
  icon: LucideIcon;
  label: string;
  value?: boolean;
  onPress?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}; 