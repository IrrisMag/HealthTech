"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Phone, Stethoscope, Bell } from "lucide-react";
import React, { useState } from "react";
import { getApiConfig } from "@/lib/api";

type Props = {};

const RemindersPage = (props: Props) => {
  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    phone: "",
    appointment_date: "",
    appointment_time: "",
    doctor_name: "",
    department: "",
    reminder_type: "appointment",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Get API configuration
      const apiConfig = getApiConfig();

      // Create reminder data
      const reminderData = {
        patient_id: formData.patient_id || `PAT${Date.now()}`,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        doctor_name: formData.doctor_name,
        department: formData.department,
        phone: formData.phone
      };

      // Call the real API
      const response = await fetch(`${apiConfig.track1}/api/reminders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setSubmitStatus(`✅ Reminder created successfully! SMS sent to ${formData.phone} for appointment on ${formData.appointment_date} at ${formData.appointment_time}. Reminder ID: ${result.reminder_id}`);

      // Reset form
      setFormData({
        patient_id: "",
        patient_name: "",
        phone: "",
        appointment_date: "",
        appointment_time: "",
        doctor_name: "",
        department: "",
        reminder_type: "appointment",
        notes: ""
      });
    } catch (error) {
      setSubmitStatus(`❌ Error creating reminder: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📅 Appointment Reminder Service
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Schedule appointment reminders for patients. SMS notifications will be sent automatically to ensure patients don't miss their appointments.
            </p>
          </div>

          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitStatus.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {submitStatus}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Patient ID
                </label>
                <Input
                  placeholder="e.g., PAT001 (auto-generated if empty)"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Patient Name *
                </label>
                <Input
                  placeholder="Enter patient full name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                  required
                  className="py-4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number * (SMS will be sent here)
              </label>
              <Input
                placeholder="e.g., +237670684672"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                className="py-4"
              />
              <p className="text-xs text-gray-500">
                📱 Include country code for international numbers (e.g., +237 for Cameroon)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Appointment Date *
                </label>
                <Input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                  required
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Appointment Time *
                </label>
                <Input
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                  required
                  className="py-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Doctor Name *
                </label>
                <Input
                  placeholder="e.g., Dr. Mballa"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                  required
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Department *</label>
                <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                  <SelectTrigger className="w-full py-4">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Hospital Departments</SelectLabel>
                      <SelectItem value="general">🏥 General Medicine</SelectItem>
                      <SelectItem value="emergency">🚨 Emergency</SelectItem>
                      <SelectItem value="cardiology">❤️ Cardiology</SelectItem>
                      <SelectItem value="surgery">🔪 Surgery</SelectItem>
                      <SelectItem value="pediatrics">👶 Pediatrics</SelectItem>
                      <SelectItem value="maternity">🤱 Maternity</SelectItem>
                      <SelectItem value="radiology">📷 Radiology</SelectItem>
                      <SelectItem value="laboratory">🧪 Laboratory</SelectItem>
                      <SelectItem value="pharmacy">💊 Pharmacy</SelectItem>
                      <SelectItem value="dentistry">🦷 Dentistry</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Reminder Type</label>
              <Select value={formData.reminder_type} onValueChange={(value) => setFormData({...formData, reminder_type: value})}>
                <SelectTrigger className="w-full py-4">
                  <SelectValue placeholder="Select Reminder Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Reminder Types</SelectLabel>
                    <SelectItem value="appointment">📅 Appointment Reminder</SelectItem>
                    <SelectItem value="medication">💊 Medication Reminder</SelectItem>
                    <SelectItem value="follow_up">🔄 Follow-up Reminder</SelectItem>
                    <SelectItem value="lab_results">🧪 Lab Results Ready</SelectItem>
                    <SelectItem value="vaccination">💉 Vaccination Due</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Additional Notes</label>
              <Textarea
                placeholder="Any special instructions or notes for the patient..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-gray-500">
                💡 These notes will be included in the SMS reminder
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.patient_name || !formData.phone || !formData.appointment_date || !formData.appointment_time || !formData.doctor_name || !formData.department}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Reminder...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    📱 Create SMS Reminder
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 📱 SMS reminders are sent automatically via Twilio</li>
              <li>• ⏰ Reminders are sent 24 hours before the appointment</li>
              <li>• 🌍 Supports international phone numbers</li>
              <li>• 🔄 Patients can confirm or reschedule via SMS</li>
              <li>• 📊 All reminder activity is tracked in analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;
