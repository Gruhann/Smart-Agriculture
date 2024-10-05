import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const diseaseInfo = {
  healthy: {
    prevention: "Maintain good plant hygiene and regular care.",
    cure: "No treatment needed for healthy plants.",
    tips: "Continue with regular watering, appropriate sunlight, and fertilization."
  },
  rusty: {
    prevention: "Avoid overhead watering, ensure good air circulation.",
    cure: "Remove infected leaves, apply fungicides if severe.",
    tips: "Plant resistant varieties, avoid working with wet plants."
  },
  powdery: {
    prevention: "Improve air circulation, avoid overcrowding plants.",
    cure: "Apply neem oil or sulfur-based fungicides.",
    tips: "Water at the base of plants, prune to improve airflow."
  }
};

export default function LeafDiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const pickImage = async () => {
    console.log('Picking image from gallery...');
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      console.log('Permission denied for media library');
      Alert.alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Image picker result:', result);

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      console.log('Image selected:', uri);
      setSelectedImage(uri);
      await getPrediction(uri);
    } else {
      console.log('Image selection cancelled');
    }
  };

  const openCamera = async () => {
    console.log('Opening camera...');
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      console.log('Permission denied for camera');
      Alert.alert("Permission to access the camera is required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Camera result:', result);

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      console.log('Photo taken:', uri);
      setSelectedImage(uri);
      await getPrediction(uri);
    } else {
      console.log('Camera capture cancelled');
    }
  };

  const getPrediction = async (imageUri) => {
    console.log('Starting prediction process for image:', imageUri);
    setPrediction(null);

    try {
      console.log('Preparing file for upload...');
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'leaf_image.jpg',
      });

      console.log('Sending request to API...');
      const response = await fetch('https://ldd-pkw4.onrender.com/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response received. Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      if (result.predicted_class) {
        setPrediction(result.predicted_class);
        console.log('Prediction set:', result.predicted_class);
      } else {
        console.error('Unexpected response format:', result);
        Alert.alert('Error', 'Unexpected response from server. Please try again.');
      }
    } catch (error) {
      console.error('Error in getPrediction:', error);
      Alert.alert('Error', `Failed to get prediction: ${error.message}`);
    }
  };

  const renderDiseaseInfo = () => {
    if (!prediction || !diseaseInfo[prediction]) return null;

    const info = diseaseInfo[prediction];
    return (
      <View style={styles.infoContainer}>
        {Object.entries(info).map(([key, value]) => (
          <View key={key} style={styles.infoItem}>
            <Text style={styles.infoTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
            <Text style={styles.infoText}>{value}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Leaf Disease Detection</Text>
        <Text style={styles.description}>
          Upload or take a photo of a leaf to detect any diseases
        </Text>

        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            {prediction ? (
              <>
                <Text style={styles.resultText}>Prediction: {prediction}</Text>
                {renderDiseaseInfo()}
              </>
            ) : (
              <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
            )}
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Pick an Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={openCamera}>
              <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Take a Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 20,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    elevation: 3,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
});