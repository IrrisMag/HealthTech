#!/bin/bash

# Track 1 Patient Communication System - Populate Feedback Data
API_BASE="https://track1-production.up.railway.app"

echo "💬 Populating Track 1 with Patient Feedback..."
echo "=============================================="

# Function to create feedback
create_feedback() {
    local patient_name="$1"
    local category="$2"
    local rating="$3"
    local comment="$4"
    local language="$5"
    local department="$6"
    
    curl -X POST "$API_BASE/api/feedback/submit" \
        -H "Content-Type: application/json" \
        -d "{
            \"patient_name\": \"$patient_name\",
            \"category\": \"$category\",
            \"rating\": $rating,
            \"comment\": \"$comment\",
            \"language\": \"$language\",
            \"department\": \"$department\"
        }" \
        -s | jq -r '.message // "error"'
}

echo "💬 Creating patient feedback..."
echo "------------------------------"

# Create diverse feedback from different patients and departments
feedback_entries=(
    "Jean Mballa|service_quality|5|Excellent service, very satisfied with the care received|en|Emergency"
    "Marie Nguema|wait_time|4|Quick service, minimal waiting time|fr|Cardiology"
    "Paul Etame|staff_behavior|5|Staff was very professional and caring|en|Surgery"
    "Sarah Nkomo|cleanliness|4|Hospital facilities are clean and well-maintained|en|Maternity"
    "Michel Biya|service_quality|3|Service was okay, room for improvement|fr|ICU"
    "Grace Mballa|wait_time|2|Long waiting time, needs improvement|en|Emergency"
    "David Fouda|staff_behavior|5|Nurses were very attentive and kind|fr|Pediatrics"
    "Aminata Diallo|facilities|4|Good medical equipment and facilities|en|Oncology"
    "Jean-Claude Mvondo|service_quality|5|Outstanding medical care and attention|fr|Surgery"
    "Fatima Hassan|cleanliness|5|Very clean environment, felt safe|en|Maternity"
    "Pierre Ngono|wait_time|3|Average waiting time, could be better|fr|Emergency"
    "Mariam Sow|staff_behavior|4|Doctors explained everything clearly|en|Cardiology"
    "Emmanuel Talla|service_quality|2|Service was below expectations|fr|ICU"
    "Aisha Kone|facilities|5|Modern equipment and comfortable rooms|en|Surgery"
    "Francis Muna|wait_time|4|Reasonable waiting time for appointment|fr|Pediatrics"
    "Zara Oumarou|staff_behavior|5|Very compassionate and understanding staff|en|Oncology"
    "Joseph Ekani|cleanliness|4|Clean and hygienic environment|fr|Emergency"
    "Amina Sall|service_quality|5|Excellent treatment and follow-up care|en|Maternity"
    "Robert Ndi|wait_time|1|Extremely long wait, very frustrating|fr|ICU"
    "Fatou Diop|staff_behavior|3|Staff was professional but seemed rushed|en|Cardiology"
    "Charles Bello|facilities|4|Good facilities but could use some updates|fr|Surgery"
    "Aicha Traore|service_quality|5|Received excellent care during emergency|en|Emergency"
    "Martin Essomba|cleanliness|5|Hospital is very clean and organized|fr|Pediatrics"
    "Khadija Mbaye|wait_time|4|Appointment was on time, very pleased|en|Oncology"
    "Andre Tchoumi|staff_behavior|5|All staff members were very helpful|fr|Maternity"
)

feedback_count=0
for feedback in "${feedback_entries[@]}"; do
    IFS='|' read -r patient category rating comment language department <<< "$feedback"
    result=$(create_feedback "$patient" "$category" "$rating" "$comment" "$language" "$department")
    if [[ "$result" == *"successfully"* ]]; then
        ((feedback_count++))
        echo "✅ Created feedback: $patient rated $rating/5 for $category ($department)"
    else
        echo "❌ Failed to create feedback: $patient"
    fi
    sleep 0.3
done

echo ""
echo "=============================================="
echo "🎉 Track 1 Feedback Population Complete!"
echo "📊 Summary:"
echo "   💬 Feedback entries created: $feedback_count"
echo ""
echo "🔄 The dashboard should now show feedback data!"
echo "=============================================="
