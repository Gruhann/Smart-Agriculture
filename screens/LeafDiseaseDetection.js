import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert,ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
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

export default function LeafDiseaseDetection({navigation}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [showButton, setShowButton] = useState(false); // State to show or hide the button

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
    setLoading(true);
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
      } else if (result.message === 'No leaf detected in the image.') {
        setPrediction('No leaf in the image'); // Update state for no leaf detected
        Alert.alert('No Leaf Detected', 'Please ensure the image contains a leaf.');
      } else {
        console.error('Unexpected response format:', result);
        setShowButton(true); // Reset showButton state

        Alert.alert('Error', 'Unexpected response from server. Please try again.');
      }
    } catch (error) {
      console.error('Error in getPrediction:', error);
      setSelectedImage(null); // Remove image on error
      Alert.alert('Error', `Failed to get prediction: ${error.message}`);

    }
    setLoading(false);
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

  const resetSelection = () => {
    setSelectedImage(null);
    setPrediction(null);
    setShowButton(false); // Reset showButton state
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
					<Text style={styles.headerTitle}>Detect disease in Leaves</Text>
        </View>
        <Text style={styles.title}>Upload a leaf photo</Text>
        <Text style={styles.subtitle}>
          We'll analyze the photo and provide insights based on the results.
        </Text>
        <View style={styles.imageGrid} onTouchEnd={pickImage}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.leafImage} />
          ) : (
            <View style={styles.placeholder}>
                  <Ionicons name="images" size={24} color="black" />
              <Text style={styles.placeholderText}>Upload an image from library</Text>
            </View>
          )}
        </View>
        {loading ? ( // Show ActivityIndicator when loading
          <ActivityIndicator size="large" color="#000000" style={styles.loadingIndicator} />
        ) : (
          !selectedImage && ( // Show buttons only if no image is selected
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.buttonPrimary} onPress={openCamera}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',gap:6 }}>
                  <Ionicons name="camera" size={24} color="white" />
                  <Text style={styles.buttonTextPrimary}>Take photo</Text>
                </View>
              </TouchableOpacity>
              <View style={{ width: 8 }} />  
              <TouchableOpacity style={styles.buttonSecondary} onPress={pickImage}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',gap:6 }}>
                  <Ionicons name="image" size={24} color="black" />
                  <Text style={styles.buttonTextSecondary}>Pick an image</Text>
                </View>
              </TouchableOpacity>
            </View>
          )
        )}
        {prediction && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Prediction: {prediction}</Text>
            {renderDiseaseInfo()}
            <TouchableOpacity style={styles.buttonReset} onPress={resetSelection}>
              <Text style={styles.buttonTextReset}>Check Another Image</Text>
            </TouchableOpacity>
          </View>
        )}
        {showButton && (
          <TouchableOpacity style={styles.buttonReset} onPress={resetSelection}>
            <Text style={styles.buttonTextReset}>Upload Another Image</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fcf8',

  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    position: 'absolute',
		top: 0,
		left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    padding:10
  },
  headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginLeft: 10,
	},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    paddingTop: 40,
    padding:10,
    paddingLeft:0,
  },
  subtitle: {
    fontSize: 16,
    color: 'black',
    paddingBottom: 12,
  },
  imageGrid: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
  },
  leafImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  placeholder: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'gray',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: 'black',
    borderRadius: 24,
    paddingVertical: 12,
    marginRight: 6,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    borderRadius: 24,
    paddingVertical: 12,
    marginLeft: 6,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextSecondary: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 20,
    color:"black",
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  buttonReset: {
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    color: '#FFFFFF',
  },
  buttonTextReset: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});