import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import LeafDiseaseDetection from './screens/LeafDiseaseDetection';
import CropRecommendation from './screens/CropRecommendation';
import CropYieldPrediction from './screens/CropYieldPrediction';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          <Ionicons name="leaf-outline" size={24} color="#2E7D32" />
          <Text style={styles.text}>Leaf Disease Detection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('Crop Recommendation')}
        >
          <Ionicons name="nutrition-outline" size={24} color="#2E7D32" />
          <Text style={styles.text}>Crop Recommendation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('Crop Yield Prediction')}
        >
          <Ionicons name="trending-up-outline" size={24} color="#2E7D32" />
          <Text style={styles.text}>Crop Yield Prediction</Text>
        </TouchableOpacity>

        <StatusBar style="auto" />
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
    alignItems: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  box: {
    width: 300,
    height: 100,
    backgroundColor: '#FFFFFF',
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
    flexDirection: 'row',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 15,
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Leaf Disease Detection" component={LeafDiseaseDetection} />
        <Stack.Screen name="Crop Recommendation" component={CropRecommendation} />
        <Stack.Screen name="Crop Yield Prediction" component={CropYieldPrediction} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
