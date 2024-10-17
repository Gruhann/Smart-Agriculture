import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const Contact = () => {
  const [testimonial, setTestimonial] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSendTestimonial = () => {
    // Add your API call or email sending logic here
    console.log('Testimonial sent!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send a Testimonial</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Your Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.textArea}
        placeholder="Your Testimonial"
        value={testimonial}
        onChangeText={(text) => setTestimonial(text)}
        multiline={true}
      />
      <Button title="Send Testimonial" onPress={handleSendTestimonial} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  textArea: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
});

export default Contact;

