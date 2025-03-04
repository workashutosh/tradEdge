// app/components/KycComponent.tsx
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

interface KycComponentProps {
  isKycDone?: boolean;
  onKycComplete?: () => void;
}

const KycComponent: React.FC<KycComponentProps> = ({ isKycDone: initialKycDone = false, onKycComplete }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = {
    background: isDark ? '#121212' : '#f7f7f7',
    text: isDark ? '#ffffff' : '#333333',
    card: isDark ? '#1e1e1e' : '#ffffff',
    border: isDark ? '#333333' : '#e0e0e0',
    error: '#ff4444',
    primary: '#6200ee',
    success: '#00c853',
    warning: '#ffab00',
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7',
    yellowBorder: '#ffab00',
  };

  const [isKycDone, setIsKycDone] = useState(initialKycDone);
  const [isKycExpanded, setIsKycExpanded] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [panFile, setPanFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // New state for processing

  const pickAadhaar = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setAadhaarFile(result);
      }
    } catch (err) {
      console.log('Error picking Aadhaar:', err);
      Alert.alert('Error', 'Failed to pick Aadhaar image');
    }
  };

  const pickPan = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        setPanFile(result);
      }
    } catch (err) {
      console.log('Error picking PAN:', err);
      Alert.alert('Error', 'Failed to pick PAN image');
    }
  };

  const handleKycSubmit = async () => {
    if (!aadhaarFile || aadhaarFile.canceled || !panFile || panFile.canceled) {
      Alert.alert('Missing Files', 'Please upload both Aadhaar and PAN images.');
      return;
    }
    try {
      // Placeholder for API call to submit documents
      // const formData = new FormData();
      // formData.append('aadhaar', { uri: aadhaarFile.assets[0].uri, name: aadhaarFile.assets[0].name, type: aadhaarFile.assets[0].mimeType || 'image/jpeg' } as any);
      // formData.append('pan', { uri: panFile.assets[0].uri, name: panFile.assets[0].name, type: panFile.assets[0].mimeType || 'image/jpeg' } as any);
      // await axios.post('YOUR_API_ENDPOINT', formData);

      Alert.alert('Success', 'Documents submitted for review!');
      setIsProcessing(true); // Set processing state
      setIsKycExpanded(false);
      setAadhaarFile(null);
      setPanFile(null);

      // Simulate staff authorization (replace with actual API polling or callback)
      // For demo, we'll assume it takes some time and then completes
      setTimeout(() => {
        setIsProcessing(false);
        setIsKycDone(true);
        if (onKycComplete) onKycComplete();
        Alert.alert('Success', 'KYC has been authorized!');
      }, 10000); // Simulated 5-second delay
    } catch (error) {
      Alert.alert('Error', 'Failed to submit KYC');
      console.log('KYC Submit error:', error);
      setIsProcessing(false); // Reset on error
    }
  };

  const handleCollapse = () => {
    setIsKycExpanded(false);
  };

  if (isKycDone) return null;

  return (
    <View style={[styles.kycContainer, { backgroundColor: colors.card, borderColor: colors.yellowBorder }]}>
      {!isKycExpanded ? (
        <View style={styles.kycHeader}>
          <Text style={[styles.kycStatusText, { color: colors.warning }]}>
            {isProcessing ? 'Processing Docs...' : 'KYC Incomplete'}
          </Text>
          {!isProcessing && (
            <TouchableOpacity
              style={[styles.kycButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsKycExpanded(true)}
            >
              <Text style={[styles.kycButtonText, { color: 'white' }]}>Complete KYC</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={[styles.kycExpanded, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCollapse} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.kycTitle, { color: colors.text }]}>Complete Your KYC</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.fileSection}>
            <Text style={[styles.fileLabel, { color: colors.text }]}>Aadhaar Card</Text>
            <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.primary }]} onPress={pickAadhaar}>
              <Ionicons name="image-outline" size={20} color={'white'} />
              <Text style={[styles.uploadText, { color: 'white' }]}>
                {aadhaarFile && !aadhaarFile.canceled ? 'Change Image' : 'Upload Image'}
              </Text>
            </TouchableOpacity>
            {aadhaarFile && !aadhaarFile.canceled && (
              <Text style={[styles.fileName, { color: colors.text, backgroundColor: colors.border }]} numberOfLines={1}>
                {aadhaarFile.assets[0].name}
              </Text>
            )}
          </View>

          <View style={styles.fileSection}>
            <Text style={[styles.fileLabel, { color: colors.text }]}>PAN Card</Text>
            <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.primary }]} onPress={pickPan}>
              <Ionicons name="image-outline" size={20} color={'white'} />
              <Text style={[styles.uploadText, { color: 'white' }]}>
                {panFile && !panFile.canceled ? 'Change Image' : 'Upload Image'}
              </Text>
            </TouchableOpacity>
            {panFile && !panFile.canceled && (
              <Text style={[styles.fileName, { color: colors.text, backgroundColor: colors.border }]} numberOfLines={1}>
                {panFile.assets[0].name}
              </Text>
            )}
          </View>

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.success }]} onPress={handleKycSubmit}>
            <Text style={[styles.submitButtonText, { color: colors.text }]}>Submit KYC</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  kycContainer: {
    marginVertical: 20,
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kycStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  kycButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
  },
  kycButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  kycExpanded: {
    borderRadius: 10,
    padding: 15,
  },
  cardLight: {
    backgroundColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  kycTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  fileSection: {
    marginBottom: 20,
  },
  fileLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  fileName: {
    fontSize: 13,
    marginTop: 8,
    padding: 5,
    borderRadius: 4,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KycComponent;