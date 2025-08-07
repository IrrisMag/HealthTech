#!/bin/bash

# Track 3 Blood Bank - Populate Requests with correct schema
API_BASE="https://track3-blood-bank-backend-production.up.railway.app"

echo "📋 Creating blood requests with correct schema..."
echo "==============================================="

# Function to create a request
create_request() {
    local patient_id="$1"
    local blood_type="$2"
    local quantity="$3"
    local urgency="$4"
    local requested_by="$5"
    local department="$6"
    
    curl -X POST "$API_BASE/requests" \
        -H "Content-Type: application/json" \
        -d "{
            \"patient_id\": \"$patient_id\",
            \"blood_type\": \"$blood_type\",
            \"quantity_units\": $quantity,
            \"urgency_level\": \"$urgency\",
            \"requested_by\": \"$requested_by\",
            \"department\": \"$department\"
        }" \
        -s | jq -r '.status // "error"'
}

# Create blood requests from different departments
requests=(
    "PAT001|A+|2|high|Dr. Mballa|Emergency"
    "PAT002|O-|1|critical|Dr. Fouda|Surgery"
    "PAT003|B+|3|high|Dr. Nkomo|ICU"
    "PAT004|AB+|1|medium|Dr. Hassan|Maternity"
    "PAT005|O+|2|medium|Dr. Mvondo|Oncology"
    "PAT006|A-|1|high|Dr. Talla|Emergency"
    "PAT007|B-|2|critical|Dr. Kone|Surgery"
    "PAT008|O+|4|high|Dr. Muna|ICU"
    "PAT009|AB-|1|medium|Dr. Oumarou|Pediatrics"
    "PAT010|A+|2|high|Dr. Ekani|Emergency"
    "PAT011|O-|1|critical|Dr. Mballa|Surgery"
    "PAT012|B+|2|high|Dr. Fouda|ICU"
    "PAT013|A-|1|medium|Dr. Nkomo|Maternity"
    "PAT014|AB+|1|low|Dr. Hassan|Oncology"
    "PAT015|O+|3|high|Dr. Mvondo|Emergency"
    "PAT016|A+|1|medium|Dr. Talla|Surgery"
    "PAT017|B-|2|high|Dr. Kone|ICU"
    "PAT018|O-|1|critical|Dr. Muna|Emergency"
    "PAT019|AB-|1|low|Dr. Oumarou|Pediatrics"
    "PAT020|O+|2|medium|Dr. Ekani|Oncology"
)

request_count=0
for request in "${requests[@]}"; do
    IFS='|' read -r patient blood quantity urgency requested_by department <<< "$request"
    result=$(create_request "$patient" "$blood" "$quantity" "$urgency" "$requested_by" "$department")
    if [ "$result" = "success" ]; then
        ((request_count++))
        echo "✅ Created request: $patient needs $quantity units of $blood ($urgency) - $department"
    else
        echo "❌ Failed to create request: $patient ($blood)"
    fi
    sleep 0.2
done

echo ""
echo "==============================================="
echo "🎉 Blood Requests Population Complete!"
echo "📊 Summary:"
echo "   📋 Requests created: $request_count"
echo ""
echo "🔄 The dashboard should now show complete data!"
echo "==============================================="
