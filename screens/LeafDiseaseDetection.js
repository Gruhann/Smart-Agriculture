import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
    const formData = new FormData();
    formData.append('file', {  // Change 'image' to 'file'
      uri: imageUri,
      type: 'image/jpeg',
      name: 'leaf_image.jpg',
    });
  
    console.log('FormData created:', formData);
  
    try {
      console.log('Sending request to API...');
      const response = await fetch('https://ldd-pkw4.onrender.com/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Response received. Status:', response.status);
      const result = await response.json();
      console.log('API response:', result);
  
      setPrediction(result.predicted_class);  // Change 'prediction' to 'predicted_class'
      console.log('Prediction set:', result.predicted_class);
    } catch (error) {
      console.error('Error in getPrediction:', error);
      Alert.alert('Error', 'Failed to get prediction. Please try again.');
    }
  };

  const renderDiseaseInfo = () => {
    if (!prediction || !diseaseInfo[prediction]) return null;

    const info = diseaseInfo[prediction];
    return (
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Prevention:</Text>
        <Text style={styles.infoText}>{info.prevention}</Text>
        <Text style={styles.infoTitle}>Cure:</Text>
        <Text style={styles.infoText}>{info.cure}</Text>
        <Text style={styles.infoTitle}>Tips:</Text>
        <Text style={styles.infoText}>{info.tips}</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          <Text style={styles.resultText}>
            {prediction
              ? `Prediction: ${prediction}`
              : 'Analyzing image...'}
          </Text>
          {renderDiseaseInfo()}
        </View>
      ) : (
        <>
          <Text style={styles.title}>Leaf Disease Detection</Text>
          <Text style={styles.description}>
            Click or select an image of a Leaf to find whether it is diseased or not
          </Text>

          <View style={styles.buttonContainer}>
            <Button title="Pick an Image from Gallery" onPress={pickImage} />
            <Button title="Take a Photo" onPress={openCamera} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    padding: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
  },
  description: {
    fontSize: 18,
    padding: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
  },
  buttonContainer: {
    marginTop: 20,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 20,
  },
  resultText: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
  },
  infoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
});