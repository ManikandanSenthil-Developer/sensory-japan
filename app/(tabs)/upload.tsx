import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, SafeAreaView, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';

const buildingTypes = ['Residential', 'Commercial', 'Mixed', 'Industrial'];

export default function UploadScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [buildingType, setBuildingType] = useState('Residential');
  const [plotSize, setPlotSize] = useState('');
  
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.92,
      exif: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      extractExifLocation(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    if (!cameraPermission?.granted) {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Camera permission is required. Please enable it in Settings.',
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }]
        );
        return;
      }
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.92,
      exif: true,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      extractExifLocation(result.assets[0]);
    }
  };

  const extractExifLocation = (asset: any) => {
    if (asset.exif && asset.exif.GPSLatitude && asset.exif.GPSLongitude) {
      setLatitude(asset.exif.GPSLatitude.toFixed(6));
      setLongitude(asset.exif.GPSLongitude.toFixed(6));
    }
  };

  const detectLocation = async () => {
    setIsDetectingLoc(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed to improve orientation accuracy. You can still enter coordinates manually.');
        setIsDetectingLoc(false);
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLatitude(loc.coords.latitude.toFixed(6));
      setLongitude(loc.coords.longitude.toFixed(6));
      
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        setLocationName(`${place.city || place.subregion}, ${place.country}`);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsDetectingLoc(false);
    }
  };

  const handleAnalyze = () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please capture or select an image first.');
      return;
    }
    router.push({ 
      pathname: '/processing', 
      params: { 
        imageUri, 
        buildingType, 
        plotSize: plotSize || '2400',
        latitude,
        longitude
      } 
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: Colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, Typography.h1, { color: Colors.textPrimary }]}>Upload Land Photo</Text>
        <Text style={[styles.subtitle, Typography.body, { color: Colors.textSecondary }]}>Capture or choose a photo to analyze</Text>

        {/* Image Source Options */}
        {!imageUri ? (
          <View style={styles.optionRow}>
            <AnimatedPressable style={[styles.optionCard, { backgroundColor: Colors.surface, borderColor: Colors.border }]} onPress={takePhoto}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.primaryLight }]}>
                <Feather name="camera" size={32} color={Colors.primaryDark} />
              </View>
              <Text style={[styles.optionTitle, Typography.label, { color: Colors.textPrimary }]}>Take Photo</Text>
              <Text style={[styles.optionDesc, Typography.caption, { color: Colors.textMuted }]}>Open camera</Text>
            </AnimatedPressable>
            
            <AnimatedPressable style={[styles.optionCard, { backgroundColor: Colors.surface, borderColor: Colors.border }]} onPress={pickImage}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.accentLight }]}>
                <Feather name="image" size={32} color={Colors.accentDark} />
              </View>
              <Text style={[styles.optionTitle, Typography.label, { color: Colors.textPrimary }]}>Gallery</Text>
              <Text style={[styles.optionDesc, Typography.caption, { color: Colors.textMuted }]}>Choose image</Text>
            </AnimatedPressable>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <AnimatedPressable style={[styles.changeBtn, { backgroundColor: Colors.surface }]} onPress={() => setImageUri(null)}>
                <Text style={[styles.changeBtnText, Typography.label, { color: Colors.primary }]}>Retake</Text>
              </AnimatedPressable>
              <AnimatedPressable style={[styles.changeBtn, { backgroundColor: Colors.primary }]} onPress={() => {}}>
                <Text style={[styles.changeBtnText, Typography.label, { color: Colors.surface }]}>Use This Photo</Text>
              </AnimatedPressable>
            </View>
          </View>
        )}

        {/* GPS Coordinates */}
        <View style={styles.fieldSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={[styles.fieldLabel, Typography.label, { color: Colors.textPrimary }]}>
              <Feather name="map-pin" size={14} color={Colors.textPrimary} /> GPS Coordinates
            </Text>
            <AnimatedPressable onPress={detectLocation} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {isDetectingLoc ? <ActivityIndicator size="small" color={Colors.primary} /> : <Feather name="map-pin" size={14} color={Colors.primary} />}
              <Text style={[{ marginLeft: 4, color: Colors.primary }, Typography.caption]}>Use Current Location</Text>
            </AnimatedPressable>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              style={[styles.input, Typography.mono, { flex: 1, backgroundColor: Colors.surface, color: Colors.textPrimary, borderColor: Colors.border }]}
              placeholder="Latitude"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={latitude}
              onChangeText={setLatitude}
            />
            <TextInput
              style={[styles.input, Typography.mono, { flex: 1, backgroundColor: Colors.surface, color: Colors.textPrimary, borderColor: Colors.border }]}
              placeholder="Longitude"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={longitude}
              onChangeText={setLongitude}
            />
          </View>
          
          {locationName ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Feather name="check-circle" size={14} color={Colors.success} />
              <Text style={[Typography.caption, { color: Colors.textSecondary, marginLeft: 4 }]}>
                Location detected — {locationName}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Building Type */}
        <View style={styles.fieldSection}>
          <Text style={[styles.fieldLabel, Typography.label, { color: Colors.textPrimary }]}>
            <Feather name="grid" size={14} color={Colors.textPrimary} /> Building Type
          </Text>
          <View style={styles.typeRow}>
            {buildingTypes.map(type => (
              <AnimatedPressable
                key={type}
                onPress={() => setBuildingType(type)}
                style={[styles.typeChip, {
                  backgroundColor: buildingType === type ? Colors.primaryLight : Colors.surface,
                  borderColor: buildingType === type ? Colors.primary : Colors.border,
                }]}
              >
                <Text style={[styles.typeText, Typography.label, { color: buildingType === type ? Colors.primaryDark : Colors.textSecondary }]}>{type}</Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>

        {/* Plot Size */}
        <View style={styles.fieldSection}>
          <Text style={[styles.fieldLabel, Typography.label, { color: Colors.textPrimary }]}>
            <Feather name="maximize-2" size={14} color={Colors.textPrimary} /> Plot Size (sqft)
          </Text>
          <TextInput
            style={[styles.input, Typography.mono, { backgroundColor: Colors.surface, color: Colors.textPrimary, borderColor: Colors.border }]}
            placeholder="e.g. 2400"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={plotSize}
            onChangeText={setPlotSize}
          />
        </View>

        {/* Analyze Button */}
        <AnimatedPressable onPress={handleAnalyze} style={{ marginHorizontal: 20, marginTop: 8 }}>
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.analyzeBtn}>
            <Text style={[styles.analyzeBtnText, Typography.h3, { color: Colors.surface }]}>Analyze with AI ✨</Text>
          </LinearGradient>
        </AnimatedPressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { paddingHorizontal: 20, marginBottom: 20 },
  optionRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  optionCard: { flex: 1, alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1 },
  optionIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  optionTitle: {},
  optionDesc: { marginTop: 2 },
  previewContainer: { marginHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  previewImage: { width: '100%', height: 220, borderRadius: 16 },
  changeBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  changeBtnText: {},
  fieldSection: { paddingHorizontal: 20, marginBottom: 16 },
  fieldLabel: { marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  typeText: {},
  input: { padding: 14, borderRadius: 12, borderWidth: 1 },
  analyzeBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  analyzeBtnText: {},
});
