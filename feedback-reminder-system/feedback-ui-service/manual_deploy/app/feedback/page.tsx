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
import { MicVocal } from "lucide-react";
import React, { useState } from "react";
import { submitFeedback } from "@/lib/api";

type Props = {};

const page = (props: Props) => {
  const [formData, setFormData] = useState({
    patient_id: "",
    name: "",
    department: "",
    language: "",
    message: "",
    rating: 5,
    feedback_type: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const feedbackData = {
        patient_id: formData.patient_id || `PAT${Date.now()}`,
        comment: formData.message,
        rating: formData.rating,
        category: formData.feedback_type,
        language: formData.language,
        department: formData.department
      };

      const result = await submitFeedback(feedbackData);
      setSubmitStatus(`Feedback submitted successfully! Sentiment: ${result.sentiment}, Priority: ${result.priority}`);
      setFormData({
        patient_id: "",
        name: "",
        department: "",
        language: "",
        message: "",
        rating: 5,
        feedback_type: "general"
      });
    } catch (error) {
      setSubmitStatus("Error submitting feedback. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="h-screen flex">
      <div className=" flex-1 bg-gradient-to-br from-blue-50 to-indigo-100"></div>
      <div className="flex-1 pl-16 flex items-center ">
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6 max-w-[600px] flex-1">
          <h1 className="text-3xl font-bold text-blue-800">🏥 Patient Feedback</h1>
          <p className="text-gray-600">Help us improve our services by sharing your experience</p>

          {submitStatus && (
            <div className={`p-4 rounded-lg border ${submitStatus.includes('Error') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {submitStatus}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Patient ID (Optional)</label>
            <Input
              type="text"
              placeholder="e.g., PAT001 (auto-generated if empty)"
              value={formData.patient_id}
              onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
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
                  <SelectItem value="emergency">🚨 Emergency</SelectItem>
                  <SelectItem value="cardiology">❤️ Cardiology</SelectItem>
                  <SelectItem value="surgery">🔪 Surgery</SelectItem>
                  <SelectItem value="pediatrics">👶 Pediatrics</SelectItem>
                  <SelectItem value="maternity">🤱 Maternity</SelectItem>
                  <SelectItem value="radiology">📷 Radiology</SelectItem>
                  <SelectItem value="laboratory">🧪 Laboratory</SelectItem>
                  <SelectItem value="pharmacy">💊 Pharmacy</SelectItem>
                  <SelectItem value="reception">📋 Reception</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Language *</label>
            <Select value={formData.language} onValueChange={(value) => setFormData({...formData, language: value})}>
              <SelectTrigger className="w-full py-4">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Language</SelectLabel>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="bassa">🇨🇲 Bassa</SelectItem>
                  <SelectItem value="ewondo">🇨🇲 Ewondo</SelectItem>
                  <SelectItem value="nguemba">🇨🇲 Nguemba</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Feedback Type *</label>
            <Select value={formData.feedback_type} onValueChange={(value) => setFormData({...formData, feedback_type: value})}>
              <SelectTrigger className="w-full py-4">
                <SelectValue placeholder="Select Feedback Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Feedback Categories</SelectLabel>
                  <SelectItem value="staff">👥 Staff Service</SelectItem>
                  <SelectItem value="waiting_time">⏰ Waiting Time</SelectItem>
                  <SelectItem value="facilities">🏢 Facilities</SelectItem>
                  <SelectItem value="treatment">💊 Treatment Quality</SelectItem>
                  <SelectItem value="general">📝 General</SelectItem>
                  <SelectItem value="billing">💰 Billing</SelectItem>
                  <SelectItem value="appointment">📅 Appointment</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Rating *</label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star})}
                  className={`text-2xl transition-colors ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400`}
                >
                  ⭐
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {formData.rating}/5 - {
                  formData.rating === 5 ? 'Excellent' :
                  formData.rating === 4 ? 'Good' :
                  formData.rating === 3 ? 'Average' :
                  formData.rating === 2 ? 'Poor' : 'Very Poor'
                }
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Feedback *</label>
            <Textarea
              placeholder="Please share your experience with us. Your feedback helps us improve our services..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-gray-500">
              💡 Our AI will analyze your feedback sentiment and extract keywords automatically
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="w-fit">
              <MicVocal className="w-4 h-4 mr-2" />
              Voice (Coming Soon)
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.message || !formData.language || !formData.department}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing & Submitting...
                </>
              ) : (
                <>
                  📤 Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default page;
