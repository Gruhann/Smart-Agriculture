import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Modal, Dimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

export default function CropRecommendation({navigation}) {
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
		const API_KEY = '65e4d0523061f24d243ef9ea9b381b43';
		const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			console.log(data);

			// Mapping of weather descriptions to average rainfall values
			const rainfallMapping = {
				'light rain': 5, // Average rainfall in mm for light rain
				'rain': 10,      // Average rainfall in mm for rain
				'moderate rain': 15, // Average rainfall in mm for moderate rain
				'heavy rain': 20, // Average rainfall in mm for heavy rain
				'very heavy rain': 30, // Average rainfall in mm for very heavy rain
				'extreme rain': 50, // Average rainfall in mm for extreme rain
				'no rain': 0      // No rain
			};

			const description = data.weather[0]?.description || 'no rain';
			const averageRainfall = rainfallMapping[description] || 0; // Default to 0 if not found

			setFormData(prevData => ({
				...prevData,
				Temperature: data.main?.temp?.toString() || '',
				Humidity: data.main?.humidity?.toString() || '',
				Rainfall: averageRainfall.toString(),
				
			}));
		} catch (error) {
			Alert.alert('Weather Data Error', `Unable to fetch weather data: ${error.message}. Please enter manually.`);
		}
	};

	const handleInputChange = (name, value) => {
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async () => {
		setLoading(true);
		setResult(null);

		for (let key in formData) {
			if (!formData[key]) {
				Alert.alert('Error', `Please enter a value for ${key}`);
				setLoading(false);
				return;
			}
		}

		try {
			const serverFormData = {
				Nitrogen: formData.Nitrogen,
				Phosporus: formData.Phosphorus,
				Potassium: formData.Potassium,
				Temperature: formData.Temperature,
				Humidity: formData.Humidity,
				Ph: formData.Ph,
				Rainfall: formData.Rainfall
			};

			const response = await fetch('https://crs-2td0.onrender.com/predict', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(serverFormData),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setResult(data.result); // Assuming data.result contains the crop recommendation
			setShowForm(false); // Hide the form after getting the result
		} catch (error) {
			Alert.alert('Error', `Failed to get recommendation: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleNewRecommendation = () => {
		setResult(null);
		setShowForm(true); // Show the form again
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
		getLocationAndWeather(); // Optionally fetch new weather data
	};

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
				newFormData.Nitrogen = '50';
				newFormData.Phosphorus = '40';
				newFormData.Potassium = '35';
				newFormData.Ph = '6.5';
				break;
			default:
				newFormData.Nitrogen = '';
				newFormData.Phosphorus = '';
				newFormData.Potassium = '';
				newFormData.Ph = '';
		}
		
		setFormData(newFormData);
		setModalVisible(false);
	};

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
						style={styles.closeButton}
						onPress={() => setModalVisible(false)}
					>
						<Text style={styles.closeButtonText}>Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);

	const renderSlider = (key, label, min, max) => (
		<View style={styles.sliderContainer} key={key}>
			<Text style={styles.sliderLabel}>{label}</Text>
			<Slider
				style={styles.slider}
				minimumValue={min}
				maximumValue={max}
				value={parseFloat(formData[key]) || min}
				onValueChange={(value) => handleInputChange(key, value.toFixed(2))}
				minimumTrackTintColor="#000000"
				maximumTrackTintColor="#CCCCCC"
			/>
			<View style={styles.sliderValues}>
				<Text>{min}</Text>
				<Text>{formData[key] || min}</Text>
				<Text>{max}</Text>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style="dark" />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color="black" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Crop Recommendation</Text>
				</View>

				{showForm ? (
					<>
						<Text style={styles.sectionTitle}>Select Soil Type</Text>
						{renderSoilTypeSelector()}
						<Text style={styles.sectionTitle1}>Fine-tune with options</Text>
						{renderSlider('Nitrogen', 'Nitrogen', 0, 140)}
						{renderSlider('Phosphorus', 'Phosphorus', 5, 145)}
						{renderSlider('Potassium', 'Potassium', 5, 205)}
						{renderSlider('Temperature', 'Temperature', 8.83, 43.68)}
						{renderSlider('Humidity', 'Humidity', 14.26, 99.98)}
						{renderSlider('Ph', 'Ph', 3.5, 9.94)}
						{renderSlider('Rainfall', 'Rainfall', 20.21, 298.56)}
						<TouchableOpacity style={styles.analyzeButton} onPress={handleSubmit} disabled={loading}>
							{loading ? (
								<ActivityIndicator color="#FFF" />
							) : (
								<Text style={styles.analyzeButtonText}>Analyze Soil</Text>
							)}
						</TouchableOpacity>
					</>
				) : (
					// Display the crop recommendation if available
					<View style={styles.recommendationContainer}>
						<Text style={styles.recommendationTitle}>Recommended Crop:</Text>
						<Text style={styles.recommendationText}>{result}</Text>
						<TouchableOpacity style={styles.newRecommendationButton} onPress={handleNewRecommendation}>
							<Text style={styles.newRecommendationButtonText}>Get Another Recommendation</Text>
						</TouchableOpacity>
					</View>
				)}
			</ScrollView>
			<SoilTypeModal />
		</SafeAreaView>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8fcf8',

	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 20,
	},
	header: {
		position: 'absolute',
		top: 0,
		left: 0,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginLeft: 10,
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
	soilTypeButton: {
		flex: 1,
		height: 50,
		justifyContent: 'center',
	},
	soilTypeButtonText: {
		color: 'black',
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
		fontWeight: 'bold',
		paddinLeft:10,
	},
	closeButton: {
		backgroundColor: 'black',
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
		color: 'black',
	},
	soilTypeItemDescription: {
		fontSize: 14,
		color: 'black',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'black',
		textAlign: 'center',
		marginBottom: 10,
		paddingTop:50,
	},
	sectionTitle1: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'black',
		textAlign: 'center',
		marginBottom: 10,
		paddingTop:10,
	},
	sliderContainer: {
		marginBottom: 20,
	},
	sliderLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		color: 'black',
		marginBottom: 5,
	},
	slider: {
		width: '100%',
		height: 40,
	},
	sliderValues: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 5,
	},
	analyzeButton: {
		backgroundColor: 'black',
		paddingVertical: 15,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 20,
		elevation: 3,
	},
	analyzeButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	newRecommendationButton: {
		backgroundColor: 'black',
		paddingVertical: 15,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 20,
		elevation: 3,
	},
	newRecommendationButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: 'bold',
		padding:10,
	},
	recommendationContainer: {
		alignItems: 'center',
		marginTop: 20,
	},
	recommendationTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'black',
		textAlign: 'center',
		marginBottom: 10,
	},
	recommendationText: {
		fontSize: 22,
		color: 'black',
		textAlign: 'center',
		fontWeight:"bold",
	},
	backButton: {
		padding: 10,
	},
});
