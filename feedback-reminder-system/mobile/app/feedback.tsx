import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Wave from '../components/wave';
import {EvilIcons ,AntDesign} from "@expo/vector-icons"

const FeedbackScreen = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    name: '',
    department: '',
    language: '',
    message: '',
    rating: 5,
    feedback_type: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.message || !formData.language || !formData.department) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackData = {
        patient_id: formData.patient_id || `PAT${Date.now()}`,
        text_feedback: formData.message,
        rating: formData.rating,
        feedback_type: formData.feedback_type,
        language: formData.language,
        department: formData.department,
      };

      // TODO: Replace with actual API call
      // const result = await submitFeedback(feedbackData);
      
      setSubmitStatus('Feedback submitted successfully!');
      Alert.alert('Success', 'Your feedback has been submitted successfully!');
      
      // Reset form
      setFormData({
        patient_id: '',
        name: '',
        department: '',
        language: '',
        message: '',
        rating: 5,
        feedback_type: 'general',
      });
    } catch (error) {
      setSubmitStatus('Error submitting feedback. Please try again.');
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-8">
        <Text className="text-3xl font-bold text-blue-800 mb-2">
          🏥 Patient Feedback
        </Text>
        <Text className="text-gray-600 mb-6">
          Help us improve our services by sharing your experience
        </Text>

        {submitStatus && (
          <View className={`p-4 rounded-lg mb-4 ${
            submitStatus.includes('Error') 
              ? 'bg-red-100 border border-red-300' 
              : 'bg-green-100 border border-green-300'
          }`}>
            <Text className={submitStatus.includes('Error') ? 'text-red-700' : 'text-green-700'}>
              {submitStatus}
            </Text>
          </View>
        )}

        {/* Patient ID */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Patient ID (Optional)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Enter your patient ID"
            value={formData.patient_id}
            onChangeText={(text) => setFormData({...formData, patient_id: text})}
          />
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
        </View>

        {/* Department */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Department *
          </Text>
          <View className="border border-gray-300 rounded-lg bg-white">
            <Picker
              selectedValue={formData.department}
              onValueChange={(value) => setFormData({...formData, department: value})}
            >
              <Picker.Item label="Select Department" value="" />
              <Picker.Item label="🩺 Emergency" value="emergency" />
              <Picker.Item label="🏥 General Medicine" value="general_medicine" />
              <Picker.Item label="👶 Pediatrics" value="pediatrics" />
              <Picker.Item label="🤰 Maternity" value="maternity" />
              <Picker.Item label="🦴 Orthopedics" value="orthopedics" />
              <Picker.Item label="❤️ Cardiology" value="cardiology" />
              <Picker.Item label="🧠 Neurology" value="neurology" />
              <Picker.Item label="💊 Pharmacy" value="pharmacy" />
            </Picker>
          </View>
        </View>

        {/* Language */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Preferred Language *
          </Text>
          <View className="border border-gray-300 rounded-lg bg-white">
            <Picker
              selectedValue={formData.language}
              onValueChange={(value) => setFormData({...formData, language: value})}
            >
              <Picker.Item label="Select Language" value="" />
              <Picker.Item label="🇬🇧 English" value="en" />
              <Picker.Item label="🇫🇷 French" value="fr" />
              <Picker.Item label="🇨🇲 Duala" value="duala" />
              <Picker.Item label="🇨🇲 Fulfulde" value="fulfulde" />
            </Picker>
          </View>
        </View>

        {/* Feedback Type */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Feedback Type *
          </Text>
          <View className="border border-gray-300 rounded-lg bg-white">
            <Picker
              selectedValue={formData.feedback_type}
              onValueChange={(value) => setFormData({...formData, feedback_type: value})}
            >
              <Picker.Item label="👥 Staff Service" value="staff" />
              <Picker.Item label="⏰ Waiting Time" value="waiting_time" />
              <Picker.Item label="🏢 Facilities" value="facilities" />
              <Picker.Item label="💊 Treatment Quality" value="treatment" />
              <Picker.Item label="📝 General" value="general" />
              <Picker.Item label="💰 Billing" value="billing" />
            </Picker>
          </View>
        </View>

        {/* Rating */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Overall Rating: {formData.rating}/5
          </Text>
          <View className="flex-row justify-around items-center bg-white border border-gray-300 rounded-lg p-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setFormData({...formData, rating: star})}
              >
                <Text className={`text-3xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                  <AntDesign name='star' size={20} color={star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}/>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voice Recording Section */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Voice Feedback (Optional)
          </Text>
          <TouchableOpacity
            onPress={toggleRecording}
            className={`p-4 rounded-lg border-2 ${
              isRecording ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'
            }`}
          >
            <Text className={`text-center font-medium ${
              isRecording ? 'text-red-700' : 'text-blue-700'
            }`}>
              {isRecording ? '🛑 Stop Recording' : '🎤 Start Voice Recording'}
            </Text>
          </TouchableOpacity>
          
          {isRecording && (
            <View className="mt-4">
              <Wave />
              <Text className="text-center text-gray-600 mt-2">
                Recording in progress...
              </Text>
            </View>
          )}
        </View>

        {/* Text Feedback */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Your Feedback *
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white min-h-32"
            placeholder="Please share your experience with us. Your feedback helps us improve our services..."
            value={formData.message}
            onChangeText={(text) => setFormData({...formData, message: text})}
            multiline
            textAlignVertical="top"
          />
          <Text className="text-xs text-gray-500 mt-1">
            💡 Our AI will analyze your feedback sentiment and extract keywords automatically
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || !formData.message || !formData.language || !formData.department}
          className={`py-4 rounded-lg ${
            isSubmitting || !formData.message || !formData.language || !formData.department
              ? 'bg-gray-400'
              : 'bg-blue-600'
          }`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isSubmitting ? '⏳ Analyzing & Submitting...' : '📤 Submit Feedback'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default FeedbackScreen;