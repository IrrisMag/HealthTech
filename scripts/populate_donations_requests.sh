#!/bin/bash

# Track 3 Blood Bank - Populate Donations and Requests
API_BASE="https://track3-blood-bank-backend-production.up.railway.app"

echo "🩸 Populating Track 3 with Donations and Requests..."
echo "=================================================="

# Function to create a donation
create_donation() {
    local donor_id="$1"
    local blood_type="$2"
    local units="$3"
    local collection_date="$4"
    local expiry_date="$5"
    
    curl -X POST "$API_BASE/donations" \
        -H "Content-Type: application/json" \
        -d "{
            \"donor_id\": \"$donor_id\",
            \"blood_type\": \"$blood_type\",
            \"units_collected\": $units,
            \"collection_date\": \"$collection_date\",
            \"expiry_date\": \"$expiry_date\"
        }" \
        -s | jq -r '.status // "error"'
}

# Function to create a request
create_request() {
    local patient_id="$1"
    local blood_type="$2"
    local units="$3"
    local department="$4"
    local physician="$5"
    local priority="$6"
    local reason="$7"
    
    curl -X POST "$API_BASE/requests" \
        -H "Content-Type: application/json" \
        -d "{
            \"patient_id\": \"$patient_id\",
            \"blood_type\": \"$blood_type\",
            \"units_requested\": $units,
            \"requesting_department\": \"$department\",
            \"requesting_physician\": \"$physician\",
            \"priority\": \"$priority\",
            \"reason\": \"$reason\"
        }" \
        -s | jq -r '.status // "error"'
}

echo "🩸 Creating blood donations..."
echo "-----------------------------"

# Create donations using existing donor IDs
donations=(
    "DNR20250807063440|A+|1|2025-01-15|2025-02-15"
    "DNR20250807063440|A+|1|2025-01-10|2025-02-10"
    "DNR20250807063440|A+|1|2025-01-20|2025-02-20"
    "DNR20250807063440|B+|1|2025-01-12|2025-02-12"
    "DNR20250807063440|O+|2|2025-01-18|2025-02-18"
    "DNR20250807063440|O-|1|2025-01-22|2025-02-22"
    "DNR20250807063440|AB+|1|2025-01-25|2025-02-25"
    "DNR20250807063440|A-|1|2025-01-08|2025-02-08"
    "DNR20250807063440|B-|1|2025-01-28|2025-02-28"
    "DNR20250807063440|AB-|1|2025-01-30|2025-03-01"
    "DNR20250807063440|O+|3|2025-01-05|2025-02-05"
    "DNR20250807063440|A+|2|2025-01-14|2025-02-14"
    "DNR20250807063440|B+|1|2025-01-16|2025-02-16"
    "DNR20250807063440|O-|2|2025-01-24|2025-02-24"
    "DNR20250807063440|A-|1|2025-01-26|2025-02-26"
)

donation_count=0
for donation in "${donations[@]}"; do
    IFS='|' read -r donor_id blood_type units collection_date expiry_date <<< "$donation"
    result=$(create_donation "$donor_id" "$blood_type" "$units" "$collection_date" "$expiry_date")
    if [ "$result" = "success" ]; then
        ((donation_count++))
        echo "✅ Created donation: $blood_type ($units units) - expires $expiry_date"
    else
        echo "❌ Failed to create donation: $blood_type"
    fi
    sleep 0.3
done

echo ""
echo "📋 Creating blood requests..."
echo "----------------------------"

# Create blood requests from different departments
requests=(
    "PAT001|A+|2|Emergency|Dr. Mballa|high|Trauma surgery"
    "PAT002|O-|1|Surgery|Dr. Fouda|critical|Emergency surgery"
    "PAT003|B+|3|ICU|Dr. Nkomo|high|Critical care"
    "PAT004|AB+|1|Maternity|Dr. Hassan|medium|Childbirth complications"
    "PAT005|O+|2|Oncology|Dr. Mvondo|medium|Cancer treatment"
    "PAT006|A-|1|Emergency|Dr. Talla|high|Accident victim"
    "PAT007|B-|2|Surgery|Dr. Kone|critical|Major surgery"
    "PAT008|O+|4|ICU|Dr. Muna|high|Severe anemia"
    "PAT009|AB-|1|Pediatrics|Dr. Oumarou|medium|Pediatric surgery"
    "PAT010|A+|2|Emergency|Dr. Ekani|high|Blood loss"
    "PAT011|O-|1|Surgery|Dr. Mballa|critical|Organ transplant"
    "PAT012|B+|2|ICU|Dr. Fouda|high|Post-operative care"
    "PAT013|A-|1|Maternity|Dr. Nkomo|medium|Pregnancy complications"
    "PAT014|AB+|1|Oncology|Dr. Hassan|low|Routine treatment"
    "PAT015|O+|3|Emergency|Dr. Mvondo|high|Multiple trauma"
)

request_count=0
for request in "${requests[@]}"; do
    IFS='|' read -r patient blood units dept physician priority reason <<< "$request"
    result=$(create_request "$patient" "$blood" "$units" "$dept" "$physician" "$priority" "$reason")
    if [ "$result" = "success" ]; then
        ((request_count++))
        echo "✅ Created request: $patient needs $units units of $blood ($priority)"
    else
        echo "❌ Failed to create request: $patient ($blood)"
    fi
    sleep 0.3
done

echo ""
echo "=================================================="
echo "🎉 Additional Data Population Complete!"
echo "📊 Summary:"
echo "   🩸 Donations created: $donation_count"
echo "   📋 Requests created: $request_count"
echo ""
echo "🔄 The dashboard should now show much more data!"
echo "=================================================="
