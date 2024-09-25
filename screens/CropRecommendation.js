import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
export default function CropRecommendation() {
 const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri); // Log URI to debug
      setSelectedImage(result.assets[0].uri); // Set the URI from assets[0]
    }
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access the camera is required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri); // Log URI to debug
      setSelectedImage(result.assets[0].uri); // Set the URI from assets[0]
    }
  };

  return (
    <View style={styles.container}>
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          <Text style={styles.resultText}>
            Image uploaded successfully. Analyzing soil...
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Crop Recommendation</Text>
          <Text style={styles.description}>
            Click or select an image of soil to find recommended crop to plant
          </Text>

          <View style={styles.buttonContainer}>
            <Button title="Pick an Image from Gallery" onPress={pickImage} />
            <Button title="Take a Photo" onPress={openCamera} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    flex: 1, // Ensures that the image container takes up all available space
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
});



