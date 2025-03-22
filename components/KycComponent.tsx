import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from './ThemedText';

const KycComponent: React.FC = () => {
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
    shadowColor: isDark ? 'white':'black',
  };

  const [isKycDone, setIsKycDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isKycExpanded, setIsKycExpanded] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [panFile, setPanFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [fetchingKycStatus, setFetchingKycStatus] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Check KYC status on every mount
  useEffect(() => {
    const checkKycStatus = async () => {
      setFetchingKycStatus(true);
      const userId = await AsyncStorage.getItem("user_id");
      if (userId) {
        try {
          const response = await fetch(`https://gateway.twmresearchalert.com/kyc?user_id=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log(data);
          const { aadhar_name, auth, pan_name } = data.data;

          setKycStatus(auth);
        } catch (error) {
          console.log('Error checking KYC status:', error);
        } finally {
          setFetchingKycStatus(false);
        }
      }
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
      console.log('Error picking Aadhaar:', err);
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
      console.log('Error picking PAN:', err);
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

      console.log('User ID:', userId);

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
        console.log('Error Response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const result: any = await response.json();
      console.log('KYC Submit response:', result);

      setMessage('Documents submitted for review!');
      setIsProcessing(true);
      setIsKycExpanded(false);
      setAadhaarFile(null);
      setPanFile(null);
    } catch (error: unknown) {
      console.log('KYC Submit error:', error);
      let errorMessage = 'Failed to submit KYC';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessage(errorMessage);
      console.log('Error', error);
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
      <View style={styles.loadingContainer}>
        <ThemedText>Fetching KYC status</ThemedText>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (kycStatus === "Y") {
    return (
      <View style={[styles.kycContainer, { backgroundColor: colors.success, borderColor: colors.success, shadowColor: colors.shadowColor }]}>
        <Text style={[styles.kycStatusText, { }]}>User has been verified</Text>
      </View>
    );
  }

  if (kycStatus === "N") {
    return (
      <View style={[styles.kycContainer, { backgroundColor: colors.error, borderColor: colors.error, shadowColor: colors.shadowColor }]}>
        <Text style={[styles.kycStatusText, { }]}>Unverified contact support center</Text>
      </View>
    );
  }

  return (
    <View style={[styles.kycContainer, { backgroundColor: colors.card, borderColor: colors.yellowBorder, shadowColor: colors.shadowColor }]}>
      {!isKycExpanded ? (
        // KYC section collapsed
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
        // KYC section expanded
        <View style={[styles.kycExpanded, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCollapse} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.kycTitle, { color: colors.text }]}>Complete Your KYC</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Aadhaar Card */}
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

          {/* Pan Card */}
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

          {/* Submit Button */}
          <TouchableOpacity style={[styles.submitButton, { opacity: uploading ? 0.5 : 1, backgroundColor: colors.success }]} onPress={handleKycSubmit} disabled={uploading}>
            <Text style={[styles.submitButtonText, { color: colors.text }]}>{uploading ? "Uploading" : "Submit KYC"}</Text>
          </TouchableOpacity>
        </View>
      )}
      {message && (
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kycStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
  message: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    gap: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default KycComponent;