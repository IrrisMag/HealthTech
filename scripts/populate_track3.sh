#!/bin/bash

# Track 3 Blood Bank Database Population Script
# This script populates the Track 3 API with realistic blood bank data

API_BASE="https://track3-blood-bank-backend-production.up.railway.app"

echo "🩸 Starting Track 3 Blood Bank Database Population..."
echo "=================================================="

# Function to create a donor
create_donor() {
    local first_name="$1"
    local last_name="$2"
    local blood_type="$3"
    local phone="$4"
    local email="$5"
    local dob="$6"
    local history="$7"
    
    curl -X POST "$API_BASE/donors" \
        -H "Content-Type: application/json" \
        -d "{
            \"first_name\": \"$first_name\",
            \"last_name\": \"$last_name\",
            \"blood_type\": \"$blood_type\",
            \"phone\": \"$phone\",
            \"email\": \"$email\",
            \"date_of_birth\": \"$dob\",
            \"medical_history\": \"$history\"
        }" \
        -s | jq -r '.status // "error"'
}

# Function to create inventory
create_inventory() {
    local blood_type="$1"
    local units="$2"
    local expiry="$3"
    local location="$4"
    
    curl -X POST "$API_BASE/inventory" \
        -H "Content-Type: application/json" \
        -d "{
            \"blood_type\": \"$blood_type\",
            \"units_available\": $units,
            \"expiry_date\": \"$expiry\",
            \"storage_location\": \"$location\",
            \"status\": \"available\"
        }" \
        -s | jq -r '.status // "error"'
}

# Function to create request
create_request() {
    local patient_id="$1"
    local blood_type="$2"
    local units="$3"
    local department="$4"
    local physician="$5"
    local priority="$6"
    
    curl -X POST "$API_BASE/requests" \
        -H "Content-Type: application/json" \
        -d "{
            \"patient_id\": \"$patient_id\",
            \"blood_type\": \"$blood_type\",
            \"units_requested\": $units,
            \"requesting_department\": \"$department\",
            \"requesting_physician\": \"$physician\",
            \"priority\": \"$priority\",
            \"reason\": \"Medical procedure\"
        }" \
        -s | jq -r '.status // "error"'
}

echo "👥 Creating blood donors..."
echo "-------------------------"

# Create diverse donors with different blood types
donors=(
    "Paul|Etame|B+|+237690345678|paul.etame@email.com|1988-11-10|Regular donor"
    "Sarah|Nkomo|A-|+237691234567|sarah.nkomo@email.com|1992-05-15|First time donor"
    "Michel|Biya|O+|+237692345678|michel.biya@email.com|1985-08-22|Frequent donor"
    "Grace|Mballa|AB+|+237693456789|grace.mballa@email.com|1990-12-03|Healthy donor"
    "David|Fouda|O-|+237694567890|david.fouda@email.com|1987-03-18|Universal donor"
    "Aminata|Diallo|A+|+237695678901|aminata.diallo@email.com|1991-07-25|Regular donor"
    "Jean-Claude|Mvondo|B-|+237696789012|jc.mvondo@email.com|1989-09-14|Experienced donor"
    "Fatima|Hassan|AB-|+237697890123|fatima.hassan@email.com|1993-01-30|New donor"
    "Pierre|Ngono|O+|+237698901234|pierre.ngono@email.com|1986-06-12|Loyal donor"
    "Mariam|Sow|A+|+237699012345|mariam.sow@email.com|1994-04-08|Volunteer donor"
    "Emmanuel|Talla|B+|+237680123456|emmanuel.talla@email.com|1988-10-20|Regular donor"
    "Aisha|Kone|O-|+237681234567|aisha.kone@email.com|1992-02-17|Universal donor"
    "Francis|Muna|A-|+237682345678|francis.muna@email.com|1987-11-05|Experienced donor"
    "Zara|Oumarou|AB+|+237683456789|zara.oumarou@email.com|1990-08-13|New donor"
    "Joseph|Ekani|O+|+237684567890|joseph.ekani@email.com|1985-12-28|Frequent donor"
)

donor_count=0
for donor in "${donors[@]}"; do
    IFS='|' read -r first last blood phone email dob history <<< "$donor"
    result=$(create_donor "$first" "$last" "$blood" "$phone" "$email" "$dob" "$history")
    if [ "$result" = "success" ]; then
        ((donor_count++))
        echo "✅ Created donor: $first $last ($blood)"
    else
        echo "❌ Failed to create donor: $first $last"
    fi
    sleep 0.5
done

echo ""
echo "📦 Creating blood inventory..."
echo "-----------------------------"

# Create inventory with different blood types and expiry dates
inventory_items=(
    "A+|5|2025-02-15|Fridge-1-Shelf-A"
    "A-|3|2025-02-20|Fridge-1-Shelf-B"
    "B+|7|2025-02-18|Fridge-2-Shelf-A"
    "B-|2|2025-02-25|Fridge-2-Shelf-B"
    "AB+|4|2025-02-12|Fridge-3-Shelf-A"
    "AB-|1|2025-02-28|Fridge-3-Shelf-B"
    "O+|12|2025-02-10|Fridge-4-Shelf-A"
    "O-|8|2025-02-22|Fridge-4-Shelf-B"
    "A+|6|2025-03-01|Fridge-5-Shelf-A"
    "B+|4|2025-03-05|Fridge-5-Shelf-B"
    "O+|9|2025-02-14|Fridge-6-Shelf-A"
    "O-|3|2025-02-26|Fridge-6-Shelf-B"
    "A-|5|2025-03-03|Fridge-7-Shelf-A"
    "AB+|2|2025-03-08|Fridge-7-Shelf-B"
    "B-|4|2025-02-16|Fridge-8-Shelf-A"
)

inventory_count=0
for item in "${inventory_items[@]}"; do
    IFS='|' read -r blood units expiry location <<< "$item"
    result=$(create_inventory "$blood" "$units" "$expiry" "$location")
    if [ "$result" = "success" ]; then
        ((inventory_count++))
        echo "✅ Created inventory: $blood ($units units) - $location"
    else
        echo "❌ Failed to create inventory: $blood"
    fi
    sleep 0.3
done

echo ""
echo "📋 Creating blood requests..."
echo "----------------------------"

# Create blood requests from different departments
requests=(
    "PAT001|A+|2|Emergency|Dr. Mballa|high"
    "PAT002|O-|1|Surgery|Dr. Fouda|critical"
    "PAT003|B+|3|ICU|Dr. Nkomo|high"
    "PAT004|AB+|1|Maternity|Dr. Hassan|medium"
    "PAT005|O+|2|Oncology|Dr. Mvondo|medium"
    "PAT006|A-|1|Emergency|Dr. Talla|high"
    "PAT007|B-|2|Surgery|Dr. Kone|critical"
    "PAT008|O+|4|ICU|Dr. Muna|high"
    "PAT009|AB-|1|Pediatrics|Dr. Oumarou|medium"
    "PAT010|A+|2|Emergency|Dr. Ekani|high"
)

request_count=0
for request in "${requests[@]}"; do
    IFS='|' read -r patient blood units dept physician priority <<< "$request"
    result=$(create_request "$patient" "$blood" "$units" "$dept" "$physician" "$priority")
    if [ "$result" = "success" ]; then
        ((request_count++))
        echo "✅ Created request: $patient needs $units units of $blood ($priority)"
    else
        echo "❌ Failed to create request: $patient"
    fi
    sleep 0.3
done

echo ""
echo "=================================================="
echo "🎉 Track 3 Database Population Complete!"
echo "📊 Summary:"
echo "   👥 Donors created: $donor_count"
echo "   📦 Inventory items: $inventory_count"
echo "   📋 Requests created: $request_count"
echo ""
echo "🔄 The dashboard should now show real data!"
echo "=================================================="
