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
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
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

      // Create reminder data based on reminder type
      const reminderData = {
        patient_id: formData.patient_id || `PAT${Date.now()}`,
        patient_name: formData.patient_name,
        phone: formData.phone,
        reminder_type: formData.reminder_type,
        notes: formData.notes,
        // Appointment-specific fields
        ...(formData.reminder_type === 'appointment' && {
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          doctor_name: formData.doctor_name,
          department: formData.department
        }),
        // Medication-specific fields
        ...(formData.reminder_type === 'medication' && {
          medication_name: formData.medication_name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          duration: formData.duration
        })
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

      // Dynamic success message based on reminder type
      const successMessage = formData.reminder_type === 'appointment'
        ? `✅ Appointment reminder created successfully! SMS sent to ${formData.phone} for appointment on ${formData.appointment_date} at ${formData.appointment_time}. Reminder ID: ${result.reminder_id}`
        : `✅ Medication reminder created successfully! SMS sent to ${formData.phone} for ${formData.medication_name} (${formData.dosage}, ${formData.frequency}). Reminder ID: ${result.reminder_id}`;

      setSubmitStatus(successMessage);

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
        medication_name: "",
        dosage: "",
        frequency: "",
        duration: "",
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
              📅 Smart Reminder Service
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Schedule appointment and medication reminders for patients. SMS notifications will be sent automatically to ensure patients don't miss their appointments or medications.
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
            {/* Reminder Type Selector */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4" />
                Reminder Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.reminder_type === 'appointment'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({...formData, reminder_type: 'appointment'})}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Appointment Reminder</h3>
                      <p className="text-sm text-gray-600">Schedule appointment reminders</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.reminder_type === 'medication'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({...formData, reminder_type: 'medication'})}
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Medication Reminder</h3>
                      <p className="text-sm text-gray-600">Schedule medication reminders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

            {/* Conditional Fields Based on Reminder Type */}
            {formData.reminder_type === 'appointment' && (
              <div className="bg-blue-50 p-6 rounded-lg space-y-6">
                <h3 className="text-lg font-medium text-blue-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointment Details
                </h3>
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
                      required={formData.reminder_type === 'appointment'}
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
                      required={formData.reminder_type === 'appointment'}
                      className="py-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.reminder_type === 'medication' && (
              <div className="bg-green-50 p-6 rounded-lg space-y-6">
                <h3 className="text-lg font-medium text-green-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Medication Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Medication Name *
                    </label>
                    <Input
                      placeholder="e.g., Paracetamol, Amoxicillin"
                      value={formData.medication_name}
                      onChange={(e) => setFormData({...formData, medication_name: e.target.value})}
                      required={formData.reminder_type === 'medication'}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Dosage *
                    </label>
                    <Input
                      placeholder="e.g., 500mg, 2 tablets"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      required={formData.reminder_type === 'medication'}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Frequency *
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      required={formData.reminder_type === 'medication'}
                      className="w-full py-4 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select frequency</option>
                      <option value="once_daily">Once daily</option>
                      <option value="twice_daily">Twice daily</option>
                      <option value="three_times_daily">Three times daily</option>
                      <option value="four_times_daily">Four times daily</option>
                      <option value="every_6_hours">Every 6 hours</option>
                      <option value="every_8_hours">Every 8 hours</option>
                      <option value="every_12_hours">Every 12 hours</option>
                      <option value="as_needed">As needed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Duration *
                    </label>
                    <Input
                      placeholder="e.g., 7 days, 2 weeks, 1 month"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      required={formData.reminder_type === 'medication'}
                      className="py-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Doctor and Department - Only for Appointments */}
            {formData.reminder_type === 'appointment' && (
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
                    required={formData.reminder_type === 'appointment'}
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
            )}



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
                disabled={isSubmitting || !formData.patient_name || !formData.phone ||
                  (formData.reminder_type === 'appointment' && (!formData.appointment_date || !formData.appointment_time || !formData.doctor_name || !formData.department)) ||
                  (formData.reminder_type === 'medication' && (!formData.medication_name || !formData.dosage || !formData.frequency || !formData.duration))}
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
