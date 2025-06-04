import { StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/utils/theme';

interface KycComponentProps {
  onKycComplete?: () => void;
}

const KycComponent: React.FC<KycComponentProps> = ({ onKycComplete }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColor = useTheme();
  const colors = {
    ...themeColor,
    gradientStart: isDark ? '#1e1e1e' : '#ffffff',
    gradientEnd: isDark ? '#121212' : '#f7f7f7',
    yellowBorder: '#ffab00',
    error: '#ff4444',
  };

  const [uploading, setUploading] = useState(false);
  const [isKycExpanded, setIsKycExpanded] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [panFile, setPanFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [fetchingKycStatus, setFetchingKycStatus] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const {userDetails} = useUser();

  // Check KYC status on every mount
  useEffect(() => {
    const checkKycStatus = async () => {
      // setKycStatus(null);
      setKycStatus(userDetails?.auth ?? null);
      setFetchingKycStatus(false);
    };
    checkKycStatus();
  }, []);

  // Display messages to user
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
      // console.log('Error picking Aadhaar:', err);
      setMessage('Failed to pick Aadhaar image');
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
      // console.log('Error picking PAN:', err);
      setMessage('Failed to pick PAN image');
    }
  };

  // handle submit
  const handleKycSubmit = async () => {
    if (!aadhaarFile || aadhaarFile.canceled || !panFile || panFile.canceled) {
      setMessage('Please upload both Aadhaar and PAN images.');
      return;
    }

    try {
      // get userId and access token
      const userId = await AsyncStorage.getItem("user_id");
      const accessToken = await AsyncStorage.getItem("access_token");

      if (!userId || !accessToken) {
        throw new Error('User ID or access token is missing');
      }

      // create new form data and append aadhaar, pan image along with userid
      const formData = new FormData();
      formData.append('aadhar', {
        uri: aadhaarFile.assets[0].uri,
        type: aadhaarFile.assets[0].mimeType || 'image/jpeg',
        name: aadhaarFile.assets[0].name || 'aadhaar.jpg',
      } as any); // TypeScript workaround

      formData.append('pan', {
        uri: panFile.assets[0].uri,
        type: panFile.assets[0].mimeType || 'image/jpeg',
        name: panFile.assets[0].name || 'pan.jpg',
      } as any); // TypeScript workaround

      formData.append('user_id', userId);

      // console.log('User ID:', userId);

      setUploading(true);
      const response = await fetch('https://gateway.twmresearchalert.com/kyc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        // console.log('Error Response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const result: any = await response.json();
      // console.log('KYC Submit response:', result);

      setMessage('Documents submitted for review!');
      setIsProcessing(true);
      setIsKycExpanded(false);
      setAadhaarFile(null);
      setPanFile(null);
      
      // Call onKycComplete after successful submission
      if (onKycComplete) {
        onKycComplete();
      }
    } catch (error: unknown) {
      // console.log('KYC Submit error:', error);
      let errorMessage = 'Failed to submit KYC';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessage(errorMessage);
      // console.log('Error', error);
      setIsProcessing(false);
    } finally {
      setUploading(false);
    }
  };

  const handleCollapse = () => {
    setIsKycExpanded(false);
  };

  if (fetchingKycStatus) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Fetching KYC status</ThemedText>
        <ActivityIndicator size="large" color={colors.text} />
      </ThemedView>
    );
  }

  // If user is verified
  if (kycStatus === "Y") {
    return (
      <ThemedView style={[styles.kycContainer, { backgroundColor: colors.success, borderColor: colors.success, shadowColor: colors.shadowColor }]}>
        <ThemedText style={[styles.kycStatusText, {}]}>User has been verified</ThemedText>
      </ThemedView>
    );
  }

  // If user is unverified (docs uploaded but not verified)
  if (
    kycStatus === "N" &&
    (userDetails?.aadhar_name || userDetails?.pan_name)
  ) {
    return (
      <ThemedView style={[styles.kycContainer, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.error, borderColor: colors.error, shadowColor: colors.shadowColor }]}>
        <Ionicons name="alert-circle-outline" size={24} color="white" style={{ marginRight: 8 }} />
        <ThemedText style={[styles.kycStatusText, {}]}>Unverified contact support center</ThemedText>
      </ThemedView>
    );
  }

  // If user needs to provide docs (no docs and not verified)
  if (
    kycStatus === "N" ||
    (!userDetails?.aadhar_name && !userDetails?.pan_name)
  ) {
    return (
      <ThemedView style={[styles.kycContainer, { backgroundColor: colors.card, borderColor: colors.yellowBorder, shadowColor: colors.shadowColor }]}>
        {!isKycExpanded ? (
          // KYC section collapsed
          <ThemedView style={styles.kycHeader}>
            <ThemedText style={[styles.kycStatusText, { color: colors.warning }]}>
              {isProcessing ? 'Processing Docs...' : 'KYC Required'}
            </ThemedText>
            {!isProcessing && (
              <TouchableOpacity
                style={[styles.kycButton, { backgroundColor: colors.primary }]}
                onPress={() => setIsKycExpanded(true)}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.kycButtonText, { color: 'white' }]}>Complete KYC</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        ) : (
          // KYC section expanded
          <ThemedView style={[styles.kycExpanded, isDark ? styles.cardDark : styles.cardLight]}>
            <ThemedView style={styles.header}>
              <TouchableOpacity onPress={handleCollapse} style={styles.backButton} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <ThemedText style={[styles.kycTitle, { color: 'white' }]}>Complete Your KYC</ThemedText>
              <ThemedView style={{ width: 24 }} />
            </ThemedView>

            <ThemedText style={[styles.kycDescription, { color: 'white' }]}>
              Please upload clear images of your Aadhaar Card and PAN Card for verification.
            </ThemedText>

            {/* Aadhaar Card */}
            <ThemedView style={styles.fileSection}>
              <ThemedText style={[styles.fileLabel, { color: 'white' }]}>Aadhaar Card</ThemedText>
              <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.primary }]} onPress={pickAadhaar} activeOpacity={0.7}>
                <Ionicons name="image-outline" size={20} color={'white'} />
                <ThemedText style={[styles.uploadText, { color: 'white' }]}>
                  {aadhaarFile && !aadhaarFile.canceled ? 'Change Image' : 'Upload Image'}
                </ThemedText>
              </TouchableOpacity>
              {aadhaarFile && !aadhaarFile.canceled && (
                <ThemedText style={[styles.fileName, { color: colors.text, backgroundColor: colors.border }]} numberOfLines={1}>
                  {aadhaarFile.assets[0].name}
                </ThemedText>
              )}
            </ThemedView>

            {/* Pan Card */}
            <ThemedView style={styles.fileSection}>
              <ThemedText style={[styles.fileLabel, { color: 'white' }]}>PAN Card</ThemedText>
              <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.primary }]} onPress={pickPan} activeOpacity={0.7}>
                <Ionicons name="image-outline" size={20} color={'white'} />
                <ThemedText style={[styles.uploadText, { color: 'white' }]}>
                  {panFile && !panFile.canceled ? 'Change Image' : 'Upload Image'}
                </ThemedText>
              </TouchableOpacity>
              {panFile && !panFile.canceled && (
                <ThemedText style={[styles.fileName, { color: colors.text, backgroundColor: colors.border }]} numberOfLines={1}>
                  {panFile.assets[0].name}
                </ThemedText>
              )}
            </ThemedView>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                { 
                  opacity: uploading ? 0.5 : 1, 
                  backgroundColor: colors.success,
                  marginTop: 20
                }
              ]} 
              onPress={handleKycSubmit} 
              disabled={uploading} 
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.submitButtonText, { color: 'white' }]}>
                {uploading ? "Uploading..." : "Submit KYC"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        {message && (
          <ThemedText style={[styles.message, { color: colors.text }]}>{message}</ThemedText>
        )}
      </ThemedView>
    );
  }

  // fallback (should not reach here)
  return null;
};

const styles = StyleSheet.create({
  kycContainer: {
    marginVertical: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: '#F6FFF7', // fallback for light mode
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kycStatusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    letterSpacing: 0.2,
  },
  kycButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#43A047',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  kycButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.2,
  },
  kycExpanded: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#E8F5E9',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    padding: 7,
    backgroundColor: '#E0F2F1',
    borderRadius: 20,
  },
  kycTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    color: '#1B5E20',
  },
  fileSection: {
    marginBottom: 22,
  },
  fileLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#388E3C',
  },
  uploadButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#43A047',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
    color: 'white',
  },
  fileName: {
    fontSize: 13,
    marginTop: 8,
    padding: 7,
    borderRadius: 6,
    backgroundColor: '#C8E6C9',
    color: '#1B5E20',
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#388E3C',
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 24,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.2,
  },
  message: {
    marginTop: 14,
    fontSize: 15,
    textAlign: 'center',
    color: '#388E3C',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    gap: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kycDescription: {
    fontSize: 15,
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: 22,
    color: '#388E3C',
    fontWeight: '500',
  },
});

export default KycComponent;