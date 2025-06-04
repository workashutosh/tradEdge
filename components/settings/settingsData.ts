import { 
  Shield, Lock, Shield as ShieldIcon, Settings, Moon, Bell, Globe as GlobeIcon,
  HelpCircle, PhoneCall, CreditCard as CardIcon, Info
} from 'lucide-react-native';
import { SettingsData } from './types';

export const settingsData: SettingsData = {
  security: {
    title: "Security",
    icon: Shield,
    description: "Manage your account security",
    subOptions: [
      { id: 'biometric', label: 'Biometric Login', icon: Lock, value: false, showSwitch: true },
      { id: 'two_factor', label: 'Two-Factor Authentication', icon: ShieldIcon, value: false, showSwitch: true },
      { id: 'change_pin', label: 'Change PIN', icon: Lock, value: false, showSwitch: false },
    ]
  },
  preferences: {
    title: "Preferences",
    icon: Settings,
    description: "Customize your app experience",
    subOptions: [
      { id: 'dark_mode', label: 'Dark Mode', icon: Moon, value: true },
      { id: 'notifications', label: 'Notifications', icon: Bell, value: true },
      { id: 'language', label: 'Language', icon: GlobeIcon, value: false },
    ]
  },
  support: {
    title: "Support",
    icon: HelpCircle,
    description: "Get help and manage your account",
    subOptions: [
      { id: 'contact_us', label: 'Contact Support', icon: PhoneCall, value: false },
      { id: 'payment', label: 'Payment Methods', icon: CardIcon, value: false },
      { id: 'about', label: 'About TradEdge', icon: Info, value: false },
    ]
  }
};