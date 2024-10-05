import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function CropRecommendation() {
	const [formData, setFormData] = useState({
		Nitrogen: '',
		Phosporus: '',
		Potassium: '',
		Temperature: '',
		Humidity: '',
		Ph: '',
		Rainfall: ''
	});
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleInputChange = (name, value) => {
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async () => {
		if (Object.values(formData).some(value => value === '')) {
			Alert.alert('Missing Information', 'Please fill all fields before submitting.');
			return;
		}

		setLoading(true);
		try {
			const response = await fetch('https://crs-2td0.onrender.com/predict', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

			const data = await response.json();
			if (data.success) {
				setResult(data.result);
			} else {
				Alert.alert('Prediction Error', data.error || 'An error occurred while processing your request.');
			}
		} catch (error) {
			console.error('Error:', error);
			Alert.alert('Connection Error', 'Unable to reach the server. Please check your internet connection and try again.');
		} finally {
			setLoading(false);
		}
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

	return (
		<LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>Crop Recommendation</Text>
				<Text style={styles.description}>
					Enter soil and environmental data to get personalized crop recommendations
				</Text>

				{Object.keys(formData).map((key) => renderInput(key, key))}

				<TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
					{loading ? (
						<ActivityIndicator color="#FFF" />
					) : (
						<Text style={styles.submitButtonText}>Get Recommendation</Text>
					)}
				</TouchableOpacity>

				{result && (
					<View style={styles.resultContainer}>
						<Text style={styles.resultText}>{result}</Text>
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
	},
	resultText: {
		fontSize: 18,
		color: '#2E7D32',
		textAlign: 'center',
		fontWeight: 'bold',
	},
});



