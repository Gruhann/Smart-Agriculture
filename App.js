import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import LeafDiseaseDetection from './screens/LeafDiseaseDetection';
import CropRecommendation from './screens/CropRecommendation';
import CropYieldPrediction from './screens/CropYieldPrediction';
import Contact from './screens/Contact'; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Leaf Disease Detection" component={LeafDiseaseDetection} />
        <Stack.Screen name="Crop Recommendation" component={CropRecommendation} />
        <Stack.Screen name="Crop Yield Prediction" component={CropYieldPrediction} />
        <Stack.Screen name="Contact" component={Contact} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false); // State to manage search bar visibility

  const insights = [
    {
      title: "Crop Recommendation",
      image: "https://cdn.usegalileo.ai/stability/655cb49e-c4a5-4996-9a7e-782de0650ecc.png",
      onPress: () => navigation.navigate('Crop Recommendation'),
    },
    {
      title: "Leaf Disease Detection",
      image: "https://cdn.usegalileo.ai/stability/bcebbf08-cc5a-40cd-9d3e-1a397f0acf3b.png",
      onPress: () => navigation.navigate('Leaf Disease Detection'),
    },
    {
      title: "Crop Yield Prediction",
      image: "https://cdn.usegalileo.ai/stability/b031bb5c-ab53-458a-af74-84ab3b180d95.png",
      onPress: () => navigation.navigate('Crop Yield Prediction'),
    },
  ];

  // Filter insights based on the search query
  const filteredInsights = insights.filter(insight =>
    insight.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Agriculture</Text>
        <TouchableOpacity onPress={() => setIsSearchVisible(!isSearchVisible)}>
          <Ionicons name="search-outline" size={24} color="#0e1b0e" />
        </TouchableOpacity>
      </View>

      {isSearchVisible && ( // Conditionally render the search input
        <TextInput
          style={styles.searchInput}
          placeholder="Search Insights..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      <Text style={styles.sectionTitle}>AI Insights</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardContainer}>
        {filteredInsights.map((insight, index) => (
          <InsightCard 
            key={index}
            title={insight.title}
            image={insight.image}
            onPress={insight.onPress}
          />
        ))}
      </ScrollView>

      <MenuItem title="Accessibility" />
      <MenuItem title="Text to Speech" />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.supportButton} onPress={() => navigation.navigate('Contact')}>
          <Ionicons name="chatbubble-outline" size={24} color="#0e1b0e" />
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InsightCard({ title, image, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{title}</Text>
      <TouchableOpacity style={styles.cardButton} onPress={onPress}>
        <Text style={styles.cardButtonText}>Get Started</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function MenuItem({ title }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuItemText}>{title}</Text>
      <Ionicons name="chevron-forward-outline" size={24} color="#0e1b0e" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fcf8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0e1b0e',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    margin: 16,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0e1b0e',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cardContainer: {
    paddingLeft: 16,
  },
  card: {
    width: 240,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 370,
  },
  cardImage: {
    width: '100%',
    height: 240,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0e1b0e',
    padding: 16,
  },
  cardButton: {
    backgroundColor: '#e7f3e7',
    borderRadius: 20,
    padding: 10,
    margin: 16,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#0e1b0e',
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#0e1b0e',
  },
  footer: {
    padding: 16,
    marginTop: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButton: {
    flexDirection: 'row',
    backgroundColor: '#e7f3e7',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportButtonText: {
    color: '#0e1b0e',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
