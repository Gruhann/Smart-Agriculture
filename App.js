import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {useAuth0, Auth0Provider} from 'react-native-auth0';

import LeafDiseaseDetection from './screens/LeafDiseaseDetection';
import CropRecommendation from './screens/CropRecommendation';
import CropYieldPrediction from './screens/CropYieldPrediction';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    
    <ScrollView contentContainerStyle={styles.container}>
      {/* App Logo */}
      <Image source={require('./assets/icon.png')} style={styles.logo} />

      {/* Tagline */}
      <Text style={styles.title}>Farm Smart!</Text>
      <Text style={styles.subtitle}>Improve your farming efficiency</Text>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate('Leaf Disease Detection')}
      >
        <Text style={styles.text}>Leaf Disease Detection</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate('Crop Recommendation')}
      >
        <Text style={styles.text}>Crop Recommendation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate('Crop Yield Prediction')}
      >
        <Text style={styles.text}>Crop Yield Prediction</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFF',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight:'900',
  },
  box: {
    width: 300,
    height: 100,
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    textAlign: 'center',


  },
});

export default function 
App() {
  return (
    // <Auth0Provider domain={"dev-uly5wofn3nvc08r6.us.auth0.com"} clientId={"PMdBPOkA4eEN5Ob5cXOU7u2k4TS5zgxC"}>
    //   {/* your application */}
    // </Auth0Provider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Leaf Disease Detection" component={LeafDiseaseDetection} />
        <Stack.Screen name="Crop Recommendation" component={CropRecommendation} />
        <Stack.Screen name="Crop Yield Prediction" component={CropYieldPrediction} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
