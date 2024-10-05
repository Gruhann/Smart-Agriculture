import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function CropRecommendation() {
	const [formData, setFormData] = useState({
		Nitrogen: '',
		Phosphorus: '',
		Potassium: '',
		Temperature: '',
		Humidity: '',
		Ph: '',
		Rainfall: '',
		SoilType: ''
	});
	const [modalVisible, setModalVisible] = useState(false);
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [location, setLocation] = useState(null);
	const [showForm, setShowForm] = useState(true);

	useEffect(() => {
		getLocationAndWeather();
	}, []);

	const getLocationAndWeather = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permission denied', 'Permission to access location was denied');
			return;
		}

		let location = await Location.getCurrentPositionAsync({});
		setLocation(location);
		fetchWeatherData(location.coords.latitude, location.coords.longitude);
	};

	const fetchWeatherData = async (latitude, longitude) => {
		// Replace with your actual weather API key and endpoint
		const API_KEY = '65e4d0523061f24d243ef9ea9b381b43';
		const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

		try {
			console.log('Fetching weather data from:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
			const response = await fetch(url);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('Weather API response:', JSON.stringify(data, null, 2));

			if (data.cod && data.cod !== 200) {
				throw new Error(data.message || 'Error fetching weather data');
			}

			setFormData(prevData => ({
				...prevData,
				Temperature: data.main?.temp?.toString() || '',
				Humidity: data.main?.humidity?.toString() || '',
				Rainfall: (data.rain?.['1h'] || 0).toString()
			}));
		} catch (error) {
			console.error('Error fetching weather data:', error);
			console.error('Error details:', error.message);
			
			if (error.message.includes('status: 400')) {
				console.log('Latitude:', latitude, 'Longitude:', longitude);
				Alert.alert('Weather Data Error', 'Invalid request. Please check your location settings.');
			} else {
				Alert.alert('Weather Data Error', `Unable to fetch weather data: ${error.message}. Please enter manually.`);
			}
		}
	};

	const handleInputChange = (name, value) => {
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async () => {
		setLoading(true);
		setResult(null);

		// Validate input
		for (let key in formData) {
			if (!formData[key]) {
				Alert.alert('Error', `Please enter a value for ${key}`);
				setLoading(false);
				return;
			}
		}

		try {
			// Create a new object with the correct keys for the server
			const serverFormData = {
				Nitrogen: formData.Nitrogen,
				Phosporus: formData.Phosphorus, // Note the spelling change here
				Potassium: formData.Potassium,
				Temperature: formData.Temperature,
				Humidity: formData.Humidity,
				Ph: formData.Ph,
				Rainfall: formData.Rainfall
			};

			console.log('Submitting form data:', serverFormData);
			const response = await fetch('https://crs-2td0.onrender.com/predict', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serverFormData),
			});

			console.log('API Response status:', response.status);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('API Error response:', errorText);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('API Response data:', data);

			if (data.error) {
				throw new Error(data.error);
			}

			setResult(data.result);
			setShowForm(false); // Hide the form after getting the result
		} catch (error) {
			console.error('Error in handleSubmit:', error);
			Alert.alert('Error', `Failed to get recommendation: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleNewRecommendation = () => {
		setResult(null);
		setShowForm(true);
		setFormData({
			Nitrogen: '',
			Phosphorus: '',
			Potassium: '',
			Temperature: '',
			Humidity: '',
			Ph: '',
			Rainfall: '',
			SoilType: ''
		});
		getLocationAndWeather(); // Fetch weather data again
	};

	const renderInput = (key, placeholder, keyboardType = 'numeric') => (
		<View style={styles.inputContainer} key={key}>
			<Ionicons name="leaf-outline" size={24} color="#4CAF50" style={styles.inputIcon} />
			<TextInput
				style={styles.input}
				placeholder={placeholder}
				placeholderTextColor="#888"
				value={formData[key]}
				onChangeText={(text) => handleInputChange(key, text)}
				keyboardType={keyboardType}
			/>
		</View>
	);

	const renderSoilTypeSelector = () => (
		<View style={styles.inputContainer}>
			<Ionicons name="earth-outline" size={24} color="#4CAF50" style={styles.inputIcon} />
			<TouchableOpacity style={styles.soilTypeButton} onPress={() => setModalVisible(true)}>
				<Text style={styles.soilTypeButtonText}>
					{formData.SoilType || "Select Soil Type"}
				</Text>
			</TouchableOpacity>
		</View>
	);

	const handleSoilTypeSelection = (soilType) => {
		let newFormData = { ...formData, SoilType: soilType };
		
		switch(soilType) {
			case 'Sandy':
				newFormData.Nitrogen = '40';
				newFormData.Phosphorus = '35';
				newFormData.Potassium = '30';
				newFormData.Ph = '6.5';
				break;
			case 'Clay':
				newFormData.Nitrogen = '60';
				newFormData.Phosphorus = '30';
				newFormData.Potassium = '25';
				newFormData.Ph = '6.0';
				break;
			case 'Loamy':
				newFormData.Nitrogen = '50';
				newFormData.Phosphorus = '40';
				newFormData.Potassium = '35';
				newFormData.Ph = '6.8';
				break;
			case 'Silt':
				newFormData.Nitrogen = '45';
				newFormData.Phosphorus = '45';
				newFormData.Potassium = '40';
				newFormData.Ph = '6.2';
				break;
			case "I'm not sure":
				// Use average values
				newFormData.Nitrogen = '50';
				newFormData.Phosphorus = '40';
				newFormData.Potassium = '35';
				newFormData.Ph = '6.5';
				break;
			default:
				// Clear values if no soil type is selected
				newFormData.Nitrogen = '';
				newFormData.Phosphorus = '';
				newFormData.Potassium = '';
				newFormData.Ph = '';
		}
		
		setFormData(newFormData);
		setModalVisible(false);
	};

	// Add this new component
	const SoilTypeModal = () => (
		<Modal
			animationType="slide"
			transparent={true}
			visible={modalVisible}
			onRequestClose={() => setModalVisible(false)}
		>
			<View style={styles.modalOverlay}>
				<View style={styles.modalView}>
					<Text style={styles.modalTitle}>Select Soil Type</Text>
					<ScrollView style={styles.soilTypeList}>
						{[
							{ label: "Sandy", description: "Gritty and rough, doesn't hold water well" },
							{ label: "Clay", description: "Sticky when wet, hard when dry" },
							{ label: "Loamy", description: "Smooth, slightly sticky, dark and crumbly" },
							{ label: "Silt", description: "Smooth and floury when dry, slippery when wet" },
							{ label: "I'm not sure", description: "We'll use average values" }
						].map((item) => (
							<TouchableOpacity
								key={item.label}
								style={styles.soilTypeItem}
								onPress={() => handleSoilTypeSelection(item.label)}
							>
								<Text style={styles.soilTypeItemLabel}>{item.label}</Text>
								<Text style={styles.soilTypeItemDescription}>{item.description}</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
					<TouchableOpacity
						style={styles.infoButton}
						onPress={() => {
							// Open a link to a soil type guide or show more detailed information
							Alert.alert("Soil Type Guide", "You can determine your soil type by its texture and appearance. Sandy soil is gritty, clay is sticky, loamy is a mix, and silt is smooth like flour.");
						}}
					>
						<Text style={styles.infoButtonText}>Learn More About Soil Types</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={() => setModalVisible(false)}
					>
						<Text style={styles.closeButtonText}>Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);

	return (
		<LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>Crop Recommendation</Text>
				
				{showForm ? (
					<>
						<Text style={styles.description}>
							We'll use your location for weather data. Please select your soil type for the best recommendation.
						</Text>

						{renderSoilTypeSelector()}
						{Object.keys(formData).filter(key => key !== 'SoilType').map((key) => renderInput(key, key))}

						<TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
							{loading ? (
								<ActivityIndicator color="#FFF" />
							) : (
								<Text style={styles.submitButtonText}>Get Recommendation</Text>
							)}
						</TouchableOpacity>
					</>
				) : (
					<View style={styles.resultContainer}>
						<Text style={styles.resultTitle}>Recommended Crop:</Text>
						<Text style={styles.resultText}>{result}</Text>
						<TouchableOpacity style={styles.newRecommendationButton} onPress={handleNewRecommendation}>
							<Text style={styles.newRecommendationButtonText}>Get Another Recommendation</Text>
						</TouchableOpacity>
					</View>
				)}
			</ScrollView>
			<SoilTypeModal />
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
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		marginBottom: 15,
		paddingHorizontal: 15,
		elevation: 3,
	},
	inputIcon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		height: 50,
		color: '#333',
	},
	submitButton: {
		backgroundColor: '#4CAF50',
		paddingVertical: 15,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 10,
		elevation: 3,
	},
	submitButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: 'bold',
	},
	resultContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		padding: 20,
		marginTop: 30,
		elevation: 3,
		alignItems: 'center',
	},
	resultTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#2E7D32',
		marginBottom: 10,
	},
	resultText: {
		fontSize: 24,
		color: '#4CAF50',
		textAlign: 'center',
		fontWeight: 'bold',
		marginBottom: 20,
	},
	soilTypeButton: {
		flex: 1,
		height: 50,
		justifyContent: 'center',
	},
	soilTypeButtonText: {
		color: '#4CAF50',
		fontSize: 16,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalView: {
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		width: width * 0.8,
	},
	modalTitle: {
		marginBottom: 15,
		textAlign: 'center',
		fontSize: 18,
		fontWeight: 'bold'
	},
	picker: {
		width: '100%',
		height: 50
	},
	closeButton: {
		backgroundColor: '#4CAF50',
		borderRadius: 20,
		padding: 10,
		elevation: 2,
		marginTop: 15
	},
	closeButtonText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center'
	},
	soilTypeList: {
		maxHeight: height * 0.4,
		width: '100%',
	},
	soilTypeItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	soilTypeItemLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#4CAF50',
	},
	soilTypeItemDescription: {
		fontSize: 14,
		color: '#666',
	},
	infoButton: {
		marginTop: 10,
		padding: 10,
	},
	infoButtonText: {
		color: '#4CAF50',
		textDecorationLine: 'underline',
	},
	newRecommendationButton: {
		backgroundColor: '#4CAF50',
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 10,
		marginTop: 20,
	},
	newRecommendationButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
});