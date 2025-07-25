import pandas as pd
import os
from datetime import datetime

def create_enhanced_medical_datasets():
    """Create comprehensive medical knowledge datasets with DGH-specific conditions, multilingual support, and age-specific data"""
    
    # Create data directory
    os.makedirs("data", exist_ok=True)
    
    # 1. Enhanced Medical Conditions Dataset (DGH-specific)
    conditions_data = [
        {
            "condition_name": "Malaria",
            "simple_name": "Fever from Mosquito Bites",
            "simple_name_bassa": "Ndap i ngañ",
            "simple_name_duala": "Nyolo na nyon",
            "simple_name_ewondo": "Folo ye nyon",
            "patient_explanation": "Malaria is caused by parasites that mosquitoes carry. When an infected mosquito bites you, it's like tiny unwanted visitors entering your blood and making you very sick with fever and chills.",
            "patient_explanation_bassa": "Malaria i kôm hi kañaki bi ndi nyon bi tii. Bi nyon bi hañaki bi tii won, bi ndi kañaki bi kôm i log i makôm ma won ni bi dup won kuma ndap ni bañgañ.",
            "patient_explanation_duala": "Malaria na nyambe o koma na ba nyon ba sukandi ba tee. O nyon o sukandi o tee moto, ba nyon ba koma o kanga o sukandi o koma na nyolo mabo na makanja.",
            "patient_explanation_ewondo": "Malaria a si kañaki ya bi nyon bi ne sukandi bi ke. Bi nyon bi sukandi bi ke moto, bi nyon bi kañaki bi kanga sukandi o kanga a folo ne makanja.",
            "medical_definition": "A life-threatening disease caused by Plasmodium parasites transmitted through infected Anopheles mosquitoes, endemic in tropical regions including Cameroon.",
            "causes": "Infected Anopheles mosquito bites, Blood transfusion from infected person, Mother to child transmission, Contaminated needles",
            "symptoms": "High fever with chills, Severe headache, Muscle aches, Nausea and vomiting, Fatigue, Sweating, Abdominal pain",
            "lifestyle_recommendations": "Sleep under insecticide-treated bed nets, Use mosquito repellent, Eliminate standing water around home, Wear long sleeves at dusk, Take antimalarial medication as prescribed, Seek immediate treatment for fever",
            "severity": "serious",
            "medical_specialty": "infectious_disease",
            "prevalence": "Affects 60% of Cameroon population annually",
            "prognosis": "Excellent if treated early, can be fatal if untreated",
            "complications": "Cerebral malaria, Severe anemia, Respiratory distress, Kidney failure, Death",
            "prevention": "Bed nets, Antimalarial prophylaxis, Mosquito control, Indoor residual spraying",
            "pediatric_notes": "Children under 5 are at highest risk. Watch for fever, poor feeding, irritability. Seek immediate care.",
            "geriatric_notes": "Elderly patients may have atypical symptoms. Monitor closely for complications.",
            "pregnancy_notes": "Can cause severe maternal anemia and low birth weight. Requires specialized treatment."
        },
        {
            "condition_name": "Typhoid Fever",
            "simple_name": "Stomach Fever",
            "simple_name_bassa": "Ndap i libu",
            "simple_name_duala": "Nyolo na libu",
            "simple_name_ewondo": "Folo ye libu",
            "patient_explanation": "Typhoid fever comes from eating or drinking contaminated food or water. It's like having bad germs in your stomach that spread through your whole body, causing fever and stomach problems.",
            "patient_explanation_bassa": "Ndap i libu i kôm hi bidia bia kañaki to mema ma kañaki. I si nde bi kañaki bi be hi libu lañu bi kañaki bi ñañam hi nyol yañu yoso, bi dup won ndap ni bibuñu ba libu.",
            "patient_explanation_duala": "Nyolo na libu o koma na bidia to mema ma sukandi. O si ba sukandi ba abe na libu lau ba sukandi ba nyama na nyolo yau yoso, ba duo moto nyolo na minyambe mi libu.",
            "patient_explanation_ewondo": "Folo ye libu a koma na bidia to mema me sukandi. A si bi sukandi bi abe na libu lasu bi sukandi bi nyañ na nyolo yasu yoso, bi kañ moto folo ne minyambe mi libu.",
            "medical_definition": "A bacterial infection caused by Salmonella Typhi, transmitted through contaminated food and water, common in areas with poor sanitation.",
            "causes": "Contaminated food or water, Poor sanitation, Unwashed hands, Contact with infected person, Contaminated ice or beverages",
            "symptoms": "Sustained high fever, Headache, Abdominal pain, Rose-colored spots on chest, Diarrhea or constipation, Loss of appetite, General weakness",
            "lifestyle_recommendations": "Drink only boiled or bottled water, Eat hot, freshly cooked food, Avoid street food, Wash hands frequently, Get typhoid vaccination, Practice good food hygiene",
            "severity": "serious",
            "medical_specialty": "infectious_disease",
            "prevalence": "Common in tropical regions with poor sanitation",
            "prognosis": "Good with early antibiotic treatment",
            "complications": "Intestinal bleeding, Perforation, Meningitis, Myocarditis, Death if untreated",
            "prevention": "Vaccination, Safe food and water practices, Good hygiene",
            "pediatric_notes": "Children may have milder symptoms initially. Monitor for dehydration and complications.",
            "geriatric_notes": "Higher risk of complications. May need hospitalization for monitoring.",
            "pregnancy_notes": "Can cause miscarriage or premature labor. Requires careful antibiotic selection."
        },
        {
            "condition_name": "Tuberculosis",
            "simple_name": "Chest Infection",
            "simple_name_bassa": "Yañu ya ntañ",
            "simple_name_duala": "Yau ya koko",
            "simple_name_ewondo": "Yañu ya ntañ",
            "patient_explanation": "TB is a serious infection that mainly affects your lungs. It spreads through the air when someone with TB coughs or sneezes. It's like having persistent germs in your chest that won't go away without special medicine.",
            "patient_explanation_bassa": "TB i yañu ya kañaki ya kôm ya nkôñ i ntañ wañu wa kôm. I ñañam hi njup ndigi moto wa nkôñ ya TB a hôs to a tilañ. I si nde bi kañaki bi be hi ntañ wañu bi kadi di tii bila biñañ ba kôm.",
            "patient_explanation_duala": "TB na yau ya sukandi ya koma ya nkoni na ntanga wau wa koma. O nyama na njiba nde moto wa nkoni ya TB a kwedi to a tilañ. O si ba sukandi ba abe na ntanga wau ba kei ba tei peke bila biñama ba koma.",
            "patient_explanation_ewondo": "TB a yañu ye sukandi ye koma ye nkôñ na ntañ wasu wa koma. A nyañ na njup nde moto wa nkôñ ya TB a wôs to a tilañ. A si bi sukandi bi abe na ntañ wasu bi kei ba tei peka bila biñama ba koma.",
            "medical_definition": "A bacterial infection caused by Mycobacterium tuberculosis, primarily affecting the lungs but can affect other organs.",
            "causes": "Airborne transmission from infected person, Weakened immune system, HIV co-infection, Malnutrition, Overcrowded living conditions",
            "symptoms": "Persistent cough for 3+ weeks, Coughing up blood, Chest pain, Weight loss, Night sweats, Fever, Fatigue",
            "lifestyle_recommendations": "Take all TB medications as prescribed, Cover mouth when coughing, Avoid crowded places during treatment, Eat nutritious food, Get plenty of rest, Don't smoke or drink alcohol",
            "severity": "serious",
            "medical_specialty": "pulmonology",
            "prevalence": "High burden in Cameroon, especially with HIV co-infection",
            "prognosis": "Curable with proper treatment completion (6+ months)",
            "complications": "Drug resistance, Spread to other organs, Respiratory failure, Death",
            "prevention": "BCG vaccination, Good ventilation, Early detection and treatment",
            "pediatric_notes": "Children may have atypical symptoms. Contact screening is crucial for household members.",
            "geriatric_notes": "May present with non-specific symptoms. Higher risk of complications and drug interactions.",
            "pregnancy_notes": "Can be treated safely during pregnancy with specific drug regimens."
        },
        {
            "condition_name": "Sickle Cell Disease",
            "simple_name": "Blood Problem from Birth",
            "simple_name_bassa": "Yañu ya makila ma kôm ma muna",
            "simple_name_duala": "Yau ya makila ma koma ma mwana",
            "simple_name_ewondo": "Yañu ye makila me koma me muna",
            "patient_explanation": "Sickle cell disease is something you're born with that makes your red blood cells the wrong shape. Instead of being round like donuts, they become curved like crescents, which can block blood flow and cause pain.",
            "patient_explanation_bassa": "Yañu ya sickle cell i hiña ya muna ya dup makila ma ndog ma won ma kôm ma form ya be. Ma kadi ma kôm ma be nde bi donut, ma kañgañ ma si nde bi crescent, yina yi nga block njañ ya makila ni dup manyañ.",
            "patient_explanation_duala": "Yau ya sickle cell na likama la mwana la duo makila ma ndog ma o ma koma ma forme ya abe. Ma kei ma koma ma abe nde bi donut, ma kañañ ma se nde bi croissant, yina yi pua block ndañ ya makila na duo manyañ.",
            "patient_explanation_ewondo": "Yañu ye sickle cell a likama le muna le kañ makila me ndog me o me koma me forme ye abe. Me kei me koma me abe nde bi donut, me kañañ me si nde bi croissant, yina yi nga block ndañ ye makila ne kañ manyañ.",
            "medical_definition": "A genetic disorder affecting hemoglobin, causing red blood cells to become sickle-shaped and leading to various complications.",
            "causes": "Inherited genetic mutation, Both parents must carry the gene, More common in people of African descent",
            "symptoms": "Severe pain episodes, Fatigue, Swelling of hands and feet, Frequent infections, Vision problems, Delayed growth",
            "lifestyle_recommendations": "Stay hydrated, Avoid extreme temperatures, Get regular check-ups, Take prescribed medications, Avoid high altitudes, Manage stress, Get vaccinations",
            "severity": "serious",
            "medical_specialty": "hematology",
            "prevalence": "Affects 2-3% of newborns in Cameroon",
            "prognosis": "Improved with early diagnosis and comprehensive care",
            "complications": "Stroke, Organ damage, Infections, Pulmonary hypertension, Early death",
            "prevention": "Genetic counseling, Prenatal testing, Newborn screening",
            "pediatric_notes": "Symptoms often appear after 6 months. Pain management and infection prevention are crucial.",
            "geriatric_notes": "Chronic organ damage becomes more apparent. Regular monitoring of organ function needed.",
            "pregnancy_notes": "High-risk pregnancy. Requires specialized maternal-fetal medicine care."
        },
        {
            "condition_name": "Hepatitis B",
            "simple_name": "Liver Infection",
            "simple_name_bassa": "Yañu ya biliom",
            "simple_name_duala": "Yau ya biliom",
            "simple_name_ewondo": "Yañu ye biliom",
            "patient_explanation": "Hepatitis B is a virus that attacks your liver. Your liver is like your body's filter that cleans your blood. When it's infected, it can't work properly, making you feel tired and sick.",
            "patient_explanation_bassa": "Hepatitis B i virus ya tañaki biliom bañu. Biliom bañu bi si nde filter ya nyol yañu ya sop makila mañu. Ndigi bi kañaki, bi nga kôm bisañ, bi dup won ñi ni yañu.",
            "patient_explanation_duala": "Hepatitis B na virus o takaki biliom bau. Biliom bau bi si nde filtre ya nyolo yau ya sop makila mau. Nde bi sukandi, bi pua koma bisañ, bi duo moto ñe na yau.",
            "patient_explanation_ewondo": "Hepatitis B a virus o takaki biliom basu. Biliom basu bi si nde filtre ye nyolo yasu ye sop makila mesu. Nde bi sukandi, bi nga koma bisañ, bi kañ moto ñe ne yañu.",
            "medical_definition": "A viral infection that attacks the liver, can become chronic and lead to serious liver complications.",
            "causes": "Blood contact, Unprotected sex, Sharing needles, Mother to baby transmission, Contaminated medical equipment",
            "symptoms": "Fatigue, Nausea, Abdominal pain, Dark urine, Yellow skin and eyes, Loss of appetite, Joint pain",
            "lifestyle_recommendations": "Get vaccinated, Practice safe sex, Don't share needles, Avoid alcohol, Eat healthy diet, Get regular liver monitoring, Take antiviral medication if prescribed",
            "severity": "serious",
            "medical_specialty": "gastroenterology",
            "prevalence": "High prevalence in Cameroon (10-15% population)",
            "prognosis": "Acute form usually resolves; chronic form requires ongoing management",
            "complications": "Cirrhosis, Liver cancer, Liver failure, Death",
            "prevention": "Vaccination (most effective), Safe practices, Blood screening",
            "pediatric_notes": "Newborns of infected mothers need immediate vaccination and immunoglobulin.",
            "geriatric_notes": "May have more severe disease progression. Regular monitoring needed.",
            "pregnancy_notes": "Can transmit to baby. Antiviral therapy may be needed in third trimester."
        },
        {
            "condition_name": "Hypertension",
            "simple_name": "High Blood Pressure",
            "simple_name_bassa": "Tension i tôm",
            "simple_name_duala": "Tension e tondo",
            "simple_name_ewondo": "Tension e tondo",
            "patient_explanation": "Your blood pressure is higher than normal. Think of it like water flowing through a garden hose with too much pressure - it can strain your heart and blood vessels over time.",
            "patient_explanation_bassa": "Tension ya makila mañu ma tôm kuma normal. Tiña nde mema ma njañ hi tube ya garden ma nkañ ma tôm - ma nga strain ntam wañu ni tube za makila ni tañ.",
            "patient_explanation_duala": "Tension ya makila mau ma tondo ku normal. Tina nde mema ma ndaa na tube ya jardin ma nkañ ma tondo - ma pua strain ntima wau na ba tube ba makila na tan.",
            "patient_explanation_ewondo": "Tension ye makila mesu me tondo ku normal. Tina nde mema me ndañ na tube ye jardin me nkañ me tondo - me nga strain ntôm wasu ne bi tube bi makila ne tañ.",
            "medical_definition": "A condition in which the force of the blood against the artery walls is too high, typically defined as blood pressure above 140/90 mmHg.",
            "causes": "Poor diet high in salt, Lack of exercise, Chronic stress, Family history, Obesity, Excessive alcohol consumption, Smoking, Age",
            "symptoms": "Often no symptoms (silent killer), Headaches, Shortness of breath, Nosebleeds, Chest pain, Vision problems, Dizziness",
            "lifestyle_recommendations": "Reduce salt intake to less than 2300mg daily, Exercise 30 minutes most days, Manage stress through relaxation techniques, Maintain healthy weight, Limit alcohol consumption, Quit smoking, Take medications as prescribed",
            "severity": "moderate",
            "medical_specialty": "cardiology",
            "prevalence": "Affects about 30% of adults in Cameroon",
            "prognosis": "Generally good with proper treatment and lifestyle changes",
            "complications": "Heart attack, Stroke, Heart failure, Kidney disease, Vision loss, Peripheral artery disease",
            "prevention": "Healthy diet, Regular exercise, Weight management, Stress reduction, Limited alcohol, No smoking",
            "pediatric_notes": "Can occur in children, often related to obesity or kidney disease. Different normal ranges by age.",
            "geriatric_notes": "Isolated systolic hypertension common. May need lower blood pressure targets. Monitor for orthostatic hypotension.",
            "pregnancy_notes": "Can develop during pregnancy (gestational hypertension). May indicate preeclampsia risk."
        },
        {
            "condition_name": "Type 2 Diabetes",
            "simple_name": "Sugar Disease",
            "simple_name_bassa": "Yañu ya sukre",
            "simple_name_duala": "Yau ya sukre",
            "simple_name_ewondo": "Yañu ye sukre",
            "patient_explanation": "Your body has trouble using sugar (glucose) properly. It's like having a key that doesn't fit the lock perfectly - your cells can't easily use the sugar in your blood for energy.",
            "patient_explanation_bassa": "Nyol yañu ya nkôñ ya kôm sukre (glucose) bisañ. I si nde ya nkôñ key ya kadi fit lock bisañ - bi sel ba won ba nga kôm sukre ya makila mañu kuma energy bisañ.",
            "patient_explanation_duala": "Nyolo yau o nkoni o koma sukre (glucose) bisañ. O si nde o nkoni key o kei fit serrure bisañ - ba cellule ba o ba pua koma sukre ya makila mau ku energie bisañ.",
            "patient_explanation_ewondo": "Nyolo yasu o nkôñ o koma sukre (glucose) bisañ. O si nde o nkôñ key o kei fit serrure bisañ - bi cellule bi o bi nga koma sukre ye makila mesu ku énergie bisañ.",
            "medical_definition": "A chronic condition that affects the way the body processes blood sugar (glucose), characterized by insulin resistance and relative insulin deficiency.",
            "causes": "Being overweight or obese, Lack of physical activity, Family history, Age over 45, Previous gestational diabetes, Polycystic ovary syndrome, Unhealthy diet",
            "symptoms": "Increased thirst, Frequent urination, Increased hunger, Fatigue, Blurred vision, Slow-healing sores, Frequent infections, Numbness in hands or feet",
            "lifestyle_recommendations": "Follow a balanced diet with controlled carbohydrates, Exercise regularly for at least 150 minutes per week, Monitor blood sugar levels, Take medications as prescribed, Maintain healthy weight, Manage stress, Get regular check-ups",
            "severity": "serious",
            "medical_specialty": "endocrinology",
            "prevalence": "Affects about 6% of adults in Cameroon, increasing with urbanization",
            "prognosis": "Can be well-managed with proper care, but requires lifelong attention",
            "complications": "Heart disease, Stroke, Kidney disease, Eye problems, Nerve damage, Foot problems, Skin conditions, Hearing impairment",
            "prevention": "Healthy diet, Regular exercise, Weight management, Regular health screenings",
            "pediatric_notes": "Increasingly seen in obese children. Family lifestyle changes are crucial for management.",
            "geriatric_notes": "May have higher HbA1c targets to prevent hypoglycemia. Monitor for cognitive effects.",
            "pregnancy_notes": "Can develop during pregnancy. Requires careful blood sugar monitoring and may need insulin."
        }
    ]
    
    # 2. Enhanced Medications Dataset with detailed information
    medications_data = [
        {
            "medication_name": "Artemether-Lumefantrine",
            "generic_name": "Artemether-Lumefantrine",
            "brand_names": "Coartem, Riamet, Artelum",
            "brand_names_local": "Coartem (kôm hi Cameroon)",
            "purpose": "Treats uncomplicated malaria caused by Plasmodium falciparum",
            "purpose_bassa": "Sop malaria ya simple ya Plasmodium falciparum",
            "purpose_duala": "Soñ malaria ya pete ya Plasmodium falciparum",
            "purpose_ewondo": "Sop malaria ye nkukuma ye Plasmodium falciparum",
            "mechanism_of_action": "Artemether quickly kills malaria parasites, while lumefantrine eliminates remaining parasites and prevents resistance",
            "common_side_effects": "Headache, Dizziness, Loss of appetite, Nausea, Vomiting, Sleep problems, Weakness",
            "serious_side_effects": "Severe allergic reactions, Heart rhythm problems, Hearing loss, Seizures",
            "taking_instructions": "Take with food or milk. Complete all 6 doses over 3 days even if feeling better. Take second dose 8 hours after first, then twice daily.",
            "taking_instructions_bassa": "Li ni bidia to mabebe. Fini bi dose 6 yoso ya miñol 3 asu ndigui won bisop. Li dose ya bibe 8 heures duñu wa ya kôm, duñu bi fois bibe hi ñol.",
            "taking_instructions_duala": "Lia na bidia to mabebe. Mala ba dose 6 nyoso ya minol 3 asu nde o bisañ. Lia dose ya bedi 8 ba heure dua wa ya koma, dua ba fois bedi na nol.",
            "taking_instructions_ewondo": "Lia ne bidia to mabebe. Mala bi dose 6 byoso bye minol 3 asu nde o bisañ. Lia dose ye bedi 8 ba heure dua we ye koma, dua bi fois bedi na nol.",
            "precautions": "Take with fatty food for better absorption, Complete full course even if symptoms improve, Avoid alcohol, Tell doctor if taking other medications",
            "drug_interactions": "Rifampicin, Mefloquine, Quinine, Some HIV medications, Certain antibiotics",
            "contraindications": "Severe malaria, Heart rhythm disorders, Severe liver or kidney disease, First trimester pregnancy",
            "dosage_forms": "Tablets (20mg artemether + 120mg lumefantrine)",
            "storage_instructions": "Store in original package, protect from light and moisture, room temperature",
            "drug_class": "Antimalarial - Artemisinin combination therapy",
            "pregnancy_category": "Category C - avoid in first trimester",
            "cost_category": "moderate",
            "pediatric_dosing": "Weight-based dosing: 5-14kg: 1 tablet per dose, 15-24kg: 2 tablets per dose, 25-34kg: 3 tablets per dose",
            "geriatric_considerations": "Use with caution, monitor for heart rhythm changes, may need dose adjustment",
            "local_availability": "Available in most pharmacies in Cameroon, subsidized through government programs"
        },
        {
            "medication_name": "Amoxicillin",
            "generic_name": "Amoxicillin trihydrate",
            "brand_names": "Amoxil, Trimox, Novamox",
            "brand_names_local": "Flemoxin (kôm hi Cameroon)",
            "purpose": "Treats bacterial infections including pneumonia, bronchitis, ear infections, and urinary tract infections",
            "purpose_bassa": "Sop bi yañu ba bi kañaki nkañ pneumonia, bronchitis, yañu ya matoi, ni yañu ya njañ ya pipi",
            "purpose_duala": "Soñ ba yau ba ba sukandi nkañ pneumonia, bronchite, yau ya matoi, na yau ya ndañ ya pipi",
            "purpose_ewondo": "Sop bi yañu bi bi sukandi nkañ pneumonia, bronchite, yañu ye matoi, ne yañu ye ndañ ye pipi",
            "mechanism_of_action": "Kills bacteria by preventing them from building their cell walls",
            "common_side_effects": "Diarrhea, Nausea, Vomiting, Stomach upset, Skin rash, Headache",
            "serious_side_effects": "Severe allergic reactions, Clostridioides difficile colitis, Severe skin reactions",
            "taking_instructions": "Take every 8 hours with or without food. Complete entire course even if feeling better. Shake liquid well before use.",
            "taking_instructions_bassa": "Li kila 8 heures ni bidia to bila bidia. Fini course yoso asu ndigui won bisop. Kañgañ liquid bisañ kôm ya li.",
            "taking_instructions_duala": "Lia kila 8 ba heure na bidia to peke bidia. Mala course nyoso asu nde o bisañ. Kañañ liquide bisañ koma ya lia.",
            "taking_instructions_ewondo": "Lia kila 8 ba heure ne bidia to peke bidia. Mala course yoso asu nde o bisañ. Kañañ liquide bisañ koma ye lia.",
            "precautions": "Tell doctor about penicillin allergies, Take probiotics to prevent diarrhea, Stay hydrated",
            "drug_interactions": "Methotrexate, Warfarin, Oral contraceptives (may reduce effectiveness)",
            "contraindications": "Penicillin allergy, Severe kidney disease, Mononucleosis",
            "dosage_forms": "Capsules, Tablets, Oral suspension, Injectable",
            "storage_instructions": "Store capsules/tablets at room temperature. Refrigerate liquid suspension, discard after 14 days",
            "drug_class": "Penicillin antibiotic",
            "pregnancy_category": "Category B - generally safe",
            "cost_category": "low",
            "pediatric_dosing": "20-40mg/kg/day divided into 3 doses, maximum 90mg/kg/day for severe infections",
            "geriatric_considerations": "Dose adjustment may be needed with kidney problems, higher risk of side effects",
            "local_availability": "Widely available in Cameroon, included in essential medicines list"
        },
        {
            "medication_name": "Paracetamol",
            "generic_name": "Acetaminophen/Paracetamol",
            "brand_names": "Tylenol, Panadol, Doliprane",
            "brand_names_local": "Panadol (kôm sotom hi Cameroon)",
            "purpose": "Reduces fever and relieves mild to moderate pain",
            "purpose_bassa": "Tilañ ndap ni sop manyañ ma nkukuma to ma kati",
            "purpose_duala": "Tilañ nyolo na soñ manyañ ma nkukuma to ma kati",
            "purpose_ewondo": "Tilañ folo ne sop manyañ me nkukuma to me kati",
            "mechanism_of_action": "Blocks pain signals in the brain and affects the brain's temperature control center",
            "common_side_effects": "Generally well tolerated, Nausea (rare), Skin rash (rare)",
            "serious_side_effects": "Liver damage with overdose, Severe skin reactions (very rare), Blood disorders (very rare)",
            "taking_instructions": "Take every 4-6 hours as needed. Do not exceed 4000mg (4g) in 24 hours. Can take with or without food.",
            "taking_instructions_bassa": "Li kila 4-6 heures nde bikondi. Nga tôm 4000mg (4g) hi ñol môti. Nga li ni bidia to bila bidia.",
            "taking_instructions_duala": "Lia kila 4-6 ba heure nde bisua. Pua tondo 4000mg (4g) na nol moti. Pua lia na bidia to peke bidia.",
            "taking_instructions_ewondo": "Lia kila 4-6 ba heure nde bisua. Nga tondo 4000mg (4g) na nol moti. Nga lia ne bidia to peke bidia.",
            "precautions": "Do not exceed recommended dose, Avoid alcohol, Check other medications for paracetamol content, Tell doctor if you have liver problems",
            "drug_interactions": "Warfarin (monitor INR), Isoniazid, Phenytoin, Carbamazepine",
            "contraindications": "Severe liver disease, Known allergy to paracetamol",
            "dosage_forms": "Tablets, Capsules, Oral suspension, Suppositories, IV injection",
            "storage_instructions": "Store at room temperature, keep dry, protect from light",
            "drug_class": "Analgesic/Antipyretic",
            "pregnancy_category": "Category B - safe during pregnancy",
            "cost_category": "very low",
            "pediatric_dosing": "10-15mg/kg every 4-6 hours, maximum 75mg/kg/day. Different formulations for different ages.",
            "geriatric_considerations": "Use lower doses with liver or kidney problems. Generally safe for elderly.",
            "local_availability": "Most common pain reliever in Cameroon, available everywhere including rural areas"
        },
        {
            "medication_name": "Hydrochlorothiazide",
            "generic_name": "Hydrochlorothiazide",
            "brand_names": "Microzide, Esidrix, HydroDIURIL",
            "brand_names_local": "Esidrex (kôm hi Cameroon)",
            "purpose": "Treats high blood pressure and reduces fluid retention (edema)",
            "purpose_bassa": "Sop tension i tôm ni tilañ mema ma be hi nyol",
            "purpose_duala": "Soñ tension e tondo na tilañ mema ma abe na nyolo",
            "purpose_ewondo": "Sop tension e tondo ne tilañ mema me abe na nyolo",
            "mechanism_of_action": "Helps kidneys remove excess salt and water from the body, reducing blood volume and pressure",
            "common_side_effects": "Increased urination, Dizziness, Headache, Low potassium, Increased blood sugar, Increased uric acid",
            "serious_side_effects": "Severe dehydration, Kidney problems, Severe electrolyte imbalance, Pancreatitis",
            "taking_instructions": "Take in the morning to avoid nighttime urination. Take with or without food. Monitor blood pressure regularly.",
            "taking_instructions_bassa": "Li hi kiiri kuma nga pipi hi kiri. Li ni bidia to bila bidia. Tala tension kila tañ.",
            "taking_instructions_duala": "Lia na kiiri ku pua pipi na kiri. Lia na bidia to peke bidia. Yemba tension kila tan.",
            "taking_instructions_ewondo": "Lia na kiiri ku nga pipi na kiri. Lia ne bidia to peke bidia. Tala tension kila tañ.",
            "precautions": "Monitor blood pressure and electrolytes, Stay hydrated but don't overdrink, Watch for signs of dehydration, Take potassium supplements if prescribed",
            "drug_interactions": "Lithium, NSAIDs, Diabetes medications, Digoxin, Cholestyramine",
            "contraindications": "Severe kidney disease, Severe liver disease, Electrolyte imbalances, Allergy to thiazides",
            "dosage_forms": "Tablets, Capsules",
            "storage_instructions": "Store at room temperature, protect from moisture and light",
            "drug_class": "Thiazide diuretic",
            "pregnancy_category": "Category B - generally safe",
            "cost_category": "low",
            "pediatric_dosing": "1-2mg/kg/day in 1-2 divided doses, maximum 37.5mg/day",
            "geriatric_considerations": "Start with lower doses, monitor kidney function and electrolytes more frequently",
            "local_availability": "Available in most pharmacies in Cameroon, often combined with other blood pressure medications"
        },
        {
            "medication_name": "Omeprazole",
            "generic_name": "Omeprazole",
            "brand_names": "Prilosec, Losec, Omez",
            "brand_names_local": "Omepral (kôm hi Cameroon)",
            "purpose": "Treats stomach ulcers, acid reflux, and reduces stomach acid production",
            "purpose_bassa": "Sop bi bulu ba libu, acid reflux, ni tilañ acid ya libu",
            "purpose_duala": "Soñ ba bulu ba libu, acide reflux, na tilañ acide ya libu",
            "purpose_ewondo": "Sop bi bulu bi libu, acide reflux, ne tilañ acide ye libu",
            "mechanism_of_action": "Blocks the proton pump in stomach cells that produces acid",
            "common_side_effects": "Headache, Diarrhea, Nausea, Stomach pain, Gas, Dizziness",
            "serious_side_effects": "Severe diarrhea, Magnesium deficiency, Bone fractures with long-term use, Kidney problems",
            "taking_instructions": "Take 30-60 minutes before breakfast on empty stomach. Swallow whole, do not crush or chew.",
            "taking_instructions_bassa": "Li 30-60 minutes kôm ya li breakfast hi libu libii. Miin yoso, nga konkot to tugul.",
            "taking_instructions_duala": "Lia 30-60 ba minute koma ya lia petit-déjeuner na libu libii. Mina nyoso, pua konkot to tugul.",
            "taking_instructions_ewondo": "Lia 30-60 ba minute koma ye lia petit-déjeuner na libu libii. Mina yoso, nga konkot to tugul.",
            "precautions": "Take on empty stomach for best effect, May affect absorption of other medications, Long-term use may cause nutrient deficiencies",
            "drug_interactions": "Warfarin, Clopidogrel, Phenytoin, Digoxin, Iron supplements",
            "contraindications": "Known allergy to omeprazole or other proton pump inhibitors",
            "dosage_forms": "Delayed-release capsules, Tablets, IV injection, Oral suspension",
            "storage_instructions": "Store at room temperature, protect from moisture",
            "drug_class": "Proton pump inhibitor (PPI)",
            "pregnancy_category": "Category C - use with caution",
            "cost_category": "moderate",
            "pediatric_dosing": "Weight-based: 0.5-1mg/kg once daily, available in granules for children",
            "geriatric_considerations": "May need dose adjustment with severe liver disease, higher risk of fractures",
            "local_availability": "Available in major pharmacies in Cameroon, generic versions available"
        }
    ]
    
    # 3. Enhanced Treatments Dataset
    treatments_data = [
        {
            "treatment_name": "Oral Rehydration Therapy",
            "treatment_type": "Medical Treatment",
            "description": "Treatment for dehydration using special salt and sugar solution",
            "patient_explanation": "ORT replaces the water and salts your body loses during diarrhea or vomiting. It's like giving your body the exact recipe it needs to recover.",
            "patient_explanation_bassa": "ORT i sañañ mema ni munyu ma nyol yañu ma bulu ndigi won nkôñ caca to lua. I si nde ya fu nyol yañu recipe ya kôm ya bisop.",
            "patient_explanation_duala": "ORT o sañañ mema na munyu ma nyolo yau ma bulu nde o nkoni caca to lua. O si nde ya fu nyolo yau recette ya koma ya bisañ.",
            "patient_explanation_ewondo": "ORT a sañañ mema ne munyu me nyolo yasu me bulu nde o nkôñ caca to lua. A si nde ye fu nyolo yasu recette ye koma ye bisañ.",
            "procedure_steps": "Mix ORS packet with clean water, Give small frequent sips, Continue breastfeeding if infant, Monitor for improvement, Seek medical care if worsening",
            "preparation": "Obtain ORS packets, Ensure clean water source, Wash hands thoroughly",
            "duration": "Continue until diarrhea stops and normal hydration restored",
            "recovery_time": "Usually 1-3 days for simple dehydration",
            "success_rate": "95% effective for mild to moderate dehydration",
            "risks": "Rare, but can worsen if solution prepared incorrectly",
            "alternatives": "IV fluids for severe cases, Homemade salt-sugar solution",
            "post_treatment_care": "Continue normal diet, Monitor for recurrence, Maintain good hygiene",
            "pediatric_notes": "Most important treatment for childhood diarrhea. Give 75ml/kg over 4 hours for mild dehydration.",
            "geriatric_notes": "Elderly may need closer monitoring and may require IV fluids sooner.",
            "local_context": "ORS packets widely available in Cameroon through health centers and pharmacies"
        },
        {
            "treatment_name": "Insecticide-Treated Bed Nets",
            "treatment_type": "Preventive Treatment",
            "description": "Special mosquito nets treated with insecticide to prevent malaria",
            "patient_explanation": "These special nets kill mosquitoes that try to bite you while you sleep, protecting you from malaria. It's like having a protective shield around your bed.",
            "patient_explanation_bassa": "Bi net ba kôm bi uba bi nyon bi nda ya kôm won ma won lañ, bi keñ won hi malaria. Bi si nde shield ya protection hi bet wañu.",
            "patient_explanation_duala": "Ba net ba koma ba uba ba nyon ba nda ya koma o ma o lañ, ba keñ o na malaria. Ba si nde bouclier ya protection na bed wau.",
            "patient_explanation_ewondo": "Bi net bi koma bi uba bi nyon bi nda ye koma o me o lañ, bi keñ o na malaria. Bi si nde bouclier ye protection na bed wasu.",
            "procedure_steps": "Hang net properly over bed, Tuck edges under mattress, Check for holes regularly, Replace every 3 years or when worn",
            "preparation": "Choose appropriate size net, Install hanging points, Check net condition",
            "duration": "Use every night, year-round protection",
            "recovery_time": "Immediate protection when used correctly",
            "success_rate": "Reduces malaria by 50-70% when used properly",
            "risks": "Minimal - possible skin irritation in sensitive individuals",
            "alternatives": "Indoor residual spraying, Mosquito coils, Repellents",
            "post_treatment_care": "Regular maintenance, proper storage when not in use",
            "pediatric_notes": "Critical for children under 5 who are most vulnerable to malaria. Ensure net completely covers sleeping area.",
            "geriatric_notes": "Important for elderly who may have weaker immune systems.",
            "local_context": "Distributed free through government programs in Cameroon. Local NGOs provide education on proper use."
        },
        {
            "treatment_name": "Directly Observed Treatment Short-course (DOTS)",
            "treatment_type": "Treatment Protocol",
            "description": "Supervised tuberculosis treatment to ensure medication compliance",
            "patient_explanation": "A healthcare worker watches you take your TB medicine to make sure you take it correctly and completely. This helps cure your TB and prevents drug resistance.",
            "patient_explanation_bassa": "Moto wa hospital a tala won ma won li biñañ ba TB kuma ya gañti won li bisañ ni ni completion. Yina yi sop TB wañu ni keñ drug resistance.",
            "patient_explanation_duala": "Moto wa hopital a yemba o ma o lia biñama ba TB ku ya gañti o lia bisañ na na completion. Yina yi soñ TB wau na keñ résistance ya biñama.",
            "patient_explanation_ewondo": "Moto wa hopital a tala o me o lia biñama bi TB ku ye gañti o lia bisañ ne ne completion. Yina yi sop TB wasu ne keñ résistance ye biñama.",
            "procedure_steps": "Daily supervised medication intake, Regular sputum testing, Monthly weight and symptom monitoring, Contact tracing, Treatment completion certificate",
            "preparation": "Register with TB program, Baseline tests, Contact screening, Treatment plan explanation",
            "duration": "6 months for new cases, 8+ months for drug-resistant cases",
            "recovery_time": "Symptoms improve in 2-4 weeks, full cure after treatment completion",
            "success_rate": "95% cure rate with proper adherence",
            "risks": "Drug side effects, Treatment failure if non-adherent",
            "alternatives": "Self-administered treatment (not recommended), Video-observed treatment",
            "post_treatment_care": "Follow-up chest X-rays, Watch for symptom recurrence, Complete contact screening",
            "pediatric_notes": "Family-centered approach needed. May require hospitalization for very young children.",
            "geriatric_notes": "May need closer monitoring for drug interactions and side effects.",
            "local_context": "Implemented nationwide in Cameroon through district health facilities"
        }
    ]
    
    # 4. Enhanced Lifestyle Recommendations Dataset
    lifestyle_data = [
        {
            "category": "Water and Sanitation",
            "recommendation": "Drink only boiled, bottled, or treated water",
            "explanation": "Contaminated water spreads diseases like typhoid, cholera, and diarrhea. Boiling kills harmful germs.",
            "explanation_bassa": "Mema ma kañaki ma ñañam bi yañu nkañ typhoid, cholera, ni caca. Kobok ma uba bi kañaki ba be.",
            "explanation_duala": "Mema ma sukandi ma nyama ba yau nkañ typhoid, choléra, na caca. Kobok ma uba ba sukandi ba abe.",
            "explanation_ewondo": "Mema me sukandi me nyañ bi yañu nkañ typhoid, choléra, ne caca. Kobok me uba bi sukandi bi abe.",
            "difficulty_level": "moderate",
            "evidence_level": "high",
            "target_conditions": "Typhoid, Cholera, Diarrheal diseases, Hepatitis A",
            "pediatric_notes": "Critical for children who are more susceptible to waterborne diseases",
            "geriatric_notes": "Elderly may be more severely affected by dehydration from water-borne illnesses",
            "local_context": "In Cameroon, boil water for 1 minute or use water purification tablets. Check with local health center for safe water sources."
        },
        {
            "category": "Mosquito Control",
            "recommendation": "Sleep under insecticide-treated bed nets every night",
            "explanation": "Prevents malaria by blocking infected mosquitoes from biting you during sleep when they're most active.",
            "explanation_bassa": "Keñ malaria hi keñañ bi nyon bi kañaki ba kadi ya kôm won ma won lañ ndigi bi kôm bi active.",
            "explanation_duala": "Keñ malaria na keñañ ba nyon ba sukandi ba kei ya koma o ma o lañ nde ba koma ba active.",
            "explanation_ewondo": "Keñ malaria na keñañ bi nyon bi sukandi bi kei ye koma o me o lañ nde bi koma bi active.",
            "difficulty_level": "easy",
            "evidence_level": "high",
            "target_conditions": "Malaria",
            "pediatric_notes": "Essential for children under 5. Ensure net covers entire sleeping area and check for holes.",
            "geriatric_notes": "Important for elderly who may have compromised immunity",
            "local_context": "Free distribution through government programs in Cameroon. Replace every 3 years."
        },
        {
            "category": "Diet",
            "recommendation": "Eat locally available fruits rich in vitamin C",
            "explanation": "Vitamin C boosts immunity and helps prevent infections. Local fruits like oranges, guavas, and papayas are excellent sources.",
            "explanation_bassa": "Vitamin C i tôm immunity ni sop bi yañu. Bi fruit ba local nkañ orange, goyave, ni papaye bi nkôñ bi source ba bisañ.",
            "explanation_duala": "Vitamine C e tondo immunité na soñ ba yau. Ba fruit ba local nkañ orange, goyave, na papaye ba nkoni ba source ba bisañ.",
            "explanation_ewondo": "Vitamine C e tondo immunité ne sop bi yañu. Bi fruit bi local nkañ orange, goyave, ne papaye bi nkôñ bi source bi bisañ.",
            "difficulty_level": "easy",
            "evidence_level": "high",
            "target_conditions": "Infections, Scurvy, General health",
            "pediatric_notes": "Introduce fruits gradually to infants. Mashed fruits good for young children.",
            "geriatric_notes": "May need softer preparations for those with dental problems",
            "local_context": "Abundant seasonal fruits in Cameroon: mangoes, oranges, guavas, papayas. Buy from local markets."
        },
        {
            "category": "Food Safety",
            "recommendation": "Eat hot, freshly cooked food and avoid street food when possible",
            "explanation": "Hot food kills bacteria and parasites. Street food may not be prepared under hygienic conditions.",
            "explanation_bassa": "Bidia ba hiom ba uba bi kañaki ni bi parasites. Street food ba nga bi kôm ba ba preparation ya hygiene bisañ.",
            "explanation_duala": "Bidia ba hiom ba uba ba sukandi na ba parasites. Bidia ba njañda ba pua ba koma ba préparation ya hygiène bisañ.",
            "explanation_ewondo": "Bidia bi hiom bi uba bi sukandi ne bi parasites. Bidia bi njañda bi nga bi koma bi préparation ye hygiène bisañ.",
            "difficulty_level": "moderate",
            "evidence_level": "high",
            "target_conditions": "Typhoid, Food poisoning, Diarrheal diseases",
            "pediatric_notes": "Especially important for young children with developing immune systems",
            "geriatric_notes": "Elderly more susceptible to food-borne illnesses",
            "local_context": "When buying street food in Cameroon, choose vendors with high turnover and hot, fresh food"
        },
        {
            "category": "Exercise",
            "recommendation": "Walk for 30 minutes daily or do local traditional dances",
            "explanation": "Regular physical activity strengthens the heart, controls blood sugar, and improves mood.",
            "explanation_bassa": "Sport ya kila tañ i tôm ntam, control sukre ya makila, ni bisop mood.",
            "explanation_duala": "Sport ya kila tan o tondo ntima, contrôle sukre ya makila, na bisañ humeur.",
            "explanation_ewondo": "Sport ye kila tañ e tondo ntôm, contrôle sukre ye makila, ne bisañ humeur.",
            "difficulty_level": "easy",
            "evidence_level": "high",
            "target_conditions": "Hypertension, Diabetes, Depression, Obesity",
            "pediatric_notes": "Children need 60 minutes of activity daily. Play-based activities work best.",
            "geriatric_notes": "Start slowly and gradually increase. Water-based exercises good for joint problems.",
            "local_context": "Traditional Cameroonian dances like Makossa or Bikutsi provide excellent exercise"
        },
        {
            "category": "Vaccination",
            "recommendation": "Follow national immunization schedule for children and adults",
            "explanation": "Vaccines prevent serious diseases like measles, polio, tuberculosis, and hepatitis B.",
            "explanation_bassa": "Bi vaccin ba keñ bi yañu ba nkañ ba be nkañ rougeole, polio, tuberculose, ni hepatitis B.",
            "explanation_duala": "Ba vaccin ba keñ ba yau ba nkañ ba abe nkañ rougeole, polio, tuberculose, na hépatite B.",
            "explanation_ewondo": "Bi vaccin bi keñ bi yañu bi nkañ bi abe nkañ rougeole, polio, tuberculose, ne hépatite B.",
            "difficulty_level": "easy",
            "evidence_level": "high",
            "target_conditions": "Preventable infectious diseases",
            "pediatric_notes": "Critical for child survival. Follow EPI schedule: BCG at birth, multiple doses through 18 months.",
            "geriatric_notes": "Annual flu vaccine recommended. Update tetanus booster every 10 years.",
            "local_context": "Free childhood vaccines available at all health centers in Cameroon through EPI program"
        },
        {
            "category": "Stress Management",
            "recommendation": "Practice traditional meditation or community prayer",
            "explanation": "Chronic stress raises blood pressure and weakens immunity. Spiritual practices and community support help manage stress.",
            "explanation_bassa": "Stress ya kila tañ i tôm tension ni tilañ immunity. Bi kôm ba spiritual ni support ya community ba sop stress.",
            "explanation_duala": "Stress ya kila tan o tondo tension na tilañ immunité. Ba koma ba spirituel na support ya communauté ba soñ stress.",
            "explanation_ewondo": "Stress ye kila tañ e tondo tension ne tilañ immunité. Bi koma bi spirituel ne support ye communauté bi sop stress.",
            "difficulty_level": "easy",
            "evidence_level": "moderate",
            "target_conditions": "Hypertension, Anxiety, Depression",
            "pediatric_notes": "Children benefit from routine and family stability to reduce stress",
            "geriatric_notes": "Social isolation increases stress. Community involvement important.",
            "local_context": "Traditional healing practices and religious communities provide stress relief in Cameroon"
        },
        {
            "category": "Respiratory Health",
            "recommendation": "Avoid indoor cooking smoke and improve ventilation",
            "explanation": "Cooking smoke contains harmful particles that damage the lungs and worsen asthma and COPD.",
            "explanation_bassa": "Yup ya kobok i nkôñ bi particle ba be ba bululañ ntañ ni dup asthma ni COPD ba kôm ba be.",
            "explanation_duala": "Yup ya kobok o nkoni ba particule ba abe ba bululañ ntanga na duo asthme na COPD ba koma ba abe.",
            "explanation_ewondo": "Yup ye kobok e nkôñ bi particule bi abe bi bululañ ntañ ne kañ asthme ne COPD bi koma bi abe.",
            "difficulty_level": "moderate",
            "evidence_level": "high",
            "target_conditions": "Asthma, COPD, Respiratory infections",
            "pediatric_notes": "Children's developing lungs especially vulnerable to cooking smoke",
            "geriatric_notes": "Elderly with existing lung disease need clean air environment",
            "local_context": "Use improved cookstoves or cook outdoors when possible. Open windows for ventilation."
        }
    ]
    
    # 5. Age-specific medication considerations dataset
    age_specific_data = [
        {
            "medication_name": "Paracetamol",
            "age_group": "Pediatric (0-18 years)",
            "special_considerations": "Weight-based dosing crucial. Different formulations for different ages. Avoid in neonates under 32 weeks.",
            "dosing_adjustments": "10-15mg/kg every 4-6 hours, max 75mg/kg/day. Rectal route available for vomiting children.",
            "monitoring_requirements": "Watch for signs of overdose, especially in adolescents. Monitor liver function in chronic use.",
            "common_errors": "Adult formulations given to children, exceeding maximum daily dose"
        },
        {
            "medication_name": "Paracetamol", 
            "age_group": "Geriatric (65+ years)",
            "special_considerations": "Increased sensitivity to hepatotoxicity. May need dose reduction with liver/kidney disease.",
            "dosing_adjustments": "Consider reducing dose to 3g/day max. Extend dosing intervals with kidney disease.",
            "monitoring_requirements": "Monitor liver and kidney function. Check for drug interactions.",
            "common_errors": "Not adjusting for reduced kidney function, combining with alcohol"
        },
        {
            "medication_name": "Artemether-Lumefantrine",
            "age_group": "Pediatric (0-18 years)", 
            "special_considerations": "Weight-based dosing. Must be taken with fatty food/milk for absorption.",
            "dosing_adjustments": "5-14kg: 1 tablet per dose, 15-24kg: 2 tablets, 25-34kg: 3 tablets, >35kg: 4 tablets",
            "monitoring_requirements": "Monitor for treatment failure, neurological side effects",
            "common_errors": "Not taking with food, incorrect weight-based dosing"
        },
        {
            "medication_name": "Artemether-Lumefantrine",
            "age_group": "Geriatric (65+ years)",
            "special_considerations": "Increased risk of cardiac side effects. Monitor ECG if indicated.",
            "dosing_adjustments": "Standard adult dosing usually appropriate unless severe organ dysfunction",
            "monitoring_requirements": "Cardiac monitoring, drug interaction screening",  
            "common_errors": "Not screening for cardiac conditions, drug interactions"
        }
    ]
    
    # Create Excel files with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save enhanced datasets to Excel files
    conditions_df = pd.DataFrame(conditions_data)
    conditions_df.to_excel(f"data/enhanced_medical_conditions_{timestamp}.xlsx", index=False)
    
    medications_df = pd.DataFrame(medications_data)
    medications_df.to_excel(f"data/enhanced_medications_{timestamp}.xlsx", index=False)
    
    treatments_df = pd.DataFrame(treatments_data)
    treatments_df.to_excel(f"data/enhanced_treatments_{timestamp}.xlsx", index=False)
    
    lifestyle_df = pd.DataFrame(lifestyle_data)
    lifestyle_df.to_excel(f"data/enhanced_lifestyle_recommendations_{timestamp}.xlsx", index=False)
    
    age_specific_df = pd.DataFrame(age_specific_data)
    age_specific_df.to_excel(f"data/age_specific_medication_considerations_{timestamp}.xlsx", index=False)
    
    # Create comprehensive multilingual dataset
    with pd.ExcelWriter(f"data/complete_multilingual_medical_knowledge_{timestamp}.xlsx") as writer:
        conditions_df.to_excel(writer, sheet_name='Medical_Conditions', index=False)
        medications_df.to_excel(writer, sheet_name='Medications', index=False)
        treatments_df.to_excel(writer, sheet_name='Treatments', index=False)
        lifestyle_df.to_excel(writer, sheet_name='Lifestyle_Recommendations', index=False)
        age_specific_df.to_excel(writer, sheet_name='Age_Specific_Considerations', index=False)
    
    # Create language-specific translation sheets
    translations_data = [
        {
            "english_term": "High Blood Pressure",
            "bassa_translation": "Tension i tôm",
            "duala_translation": "Tension e tondo", 
            "ewondo_translation": "Tension e tondo",
            "category": "condition"
        },
        {
            "english_term": "Take with food",
            "bassa_translation": "Li ni bidia",
            "duala_translation": "Lia na bidia",
            "ewondo_translation": "Lia ne bidia", 
            "category": "instruction"
        },
        {
            "english_term": "Side effects",
            "bassa_translation": "Bi effect ba be",
            "duala_translation": "Ba effet ba abe",
            "ewondo_translation": "Bi effet bi abe",
            "category": "medical_term"
        },
        {
            "english_term": "Consult your doctor",
            "bassa_translation": "Koñ dokter wañu",
            "duala_translation": "Koñ docteur wau",
            "ewondo_translation": "Koñ docteur wasu",
            "category": "instruction"
        },
        {
            "english_term": "Pain",
            "bassa_translation": "Manyañ",
            "duala_translation": "Manyañ",
            "ewondo_translation": "Manyañ",
            "category": "symptom"
        },
        {
            "english_term": "Fever",
            "bassa_translation": "Ndap",
            "duala_translation": "Nyolo",
            "ewondo_translation": "Folo",
            "category": "symptom"
        },
        {
            "english_term": "Medicine",
            "bassa_translation": "Biñañ",
            "duala_translation": "Biñama",
            "ewondo_translation": "Biñama",
            "category": "medical_term"
        },
        {
            "english_term": "Hospital",
            "bassa_translation": "Hospital",
            "duala_translation": "Hopital", 
            "ewondo_translation": "Hopital",
            "category": "location"
        }
    ]
    
    translations_df = pd.DataFrame(translations_data)
    translations_df.to_excel(f"data/medical_translations_{timestamp}.xlsx", index=False)
    
    print("Enhanced multilingual medical knowledge datasets created successfully!")
    print(f"\nFiles created:")
    print(f"- enhanced_medical_conditions_{timestamp}.xlsx ({len(conditions_data)} conditions including DGH-specific diseases)")
    print(f"- enhanced_medications_{timestamp}.xlsx ({len(medications_data)} medications with detailed multilingual info)")
    print(f"- enhanced_treatments_{timestamp}.xlsx ({len(treatments_data)} treatments)")
    print(f"- enhanced_lifestyle_recommendations_{timestamp}.xlsx ({len(lifestyle_data)} culturally appropriate recommendations)")
    print(f"- age_specific_medication_considerations_{timestamp}.xlsx ({len(age_specific_data)} age-specific guidelines)")
    print(f"- medical_translations_{timestamp}.xlsx ({len(translations_data)} key medical translations)")
    print(f"- complete_multilingual_medical_knowledge_{timestamp}.xlsx (all datasets in one file)")
    
    print(f"\n🌍 Languages supported: English, Bassa, Duala, Ewondo")
    print(f"🏥 DGH-specific conditions included: Malaria, Typhoid, TB, Sickle Cell, Hepatitis B")
    print(f"👶 Pediatric considerations included for all medications")
    print(f"👴 Geriatric considerations included for all medications") 
    print(f"📍 Local context and availability information provided")
    
    return {
        "conditions": len(conditions_data),
        "medications": len(medications_data), 
        "treatments": len(treatments_data),
        "lifestyle": len(lifestyle_data),
        "age_specific": len(age_specific_data),
        "translations": len(translations_data),
        "timestamp": timestamp,
        "languages": ["English", "Bassa", "Duala", "Ewondo"]
    }

def create_enhanced_templates():
    """Create enhanced Excel templates for users to fill in with multilingual support"""
    
    # Enhanced template structures
    templates = {
        "enhanced_conditions_template": {
            "condition_name": ["Enter condition name here"],
            "simple_name": ["Patient-friendly name"],
            "simple_name_bassa": ["Translation in Bassa"],
            "simple_name_duala": ["Translation in Duala"], 
            "simple_name_ewondo": ["Translation in Ewondo"],
            "patient_explanation": ["Simple explanation for patients"],
            "patient_explanation_bassa": ["Explanation in Bassa"],
            "patient_explanation_duala": ["Explanation in Duala"],
            "patient_explanation_ewondo": ["Explanation in Ewondo"],
            "medical_definition": ["Medical definition"],
            "causes": ["Cause1, Cause2, Cause3"],
            "symptoms": ["Symptom1, Symptom2, Symptom3"],
            "lifestyle_recommendations": ["Recommendation1, Recommendation2"],
            "severity": ["mild/moderate/serious"],
            "medical_specialty": ["cardiology/endocrinology/etc"],
            "prevalence": ["How common it is"],
            "prognosis": ["Expected outcome"],
            "complications": ["Possible complications"],
            "prevention": ["Prevention methods"],
            "pediatric_notes": ["Special considerations for children"],
            "geriatric_notes": ["Special considerations for elderly"],
            "pregnancy_notes": ["Special considerations for pregnancy"]
        },
        
        "enhanced_medications_template": {
            "medication_name": ["Enter medication name"],
            "generic_name": ["Generic name"],
            "brand_names": ["Brand1, Brand2, Brand3"],
            "brand_names_local": ["Local brand names"],
            "purpose": ["What it treats"],
            "purpose_bassa": ["Purpose in Bassa"],
            "purpose_duala": ["Purpose in Duala"],
            "purpose_ewondo": ["Purpose in Ewondo"],
            "mechanism_of_action": ["How it works"],
            "common_side_effects": ["Side effect1, Side effect2"],
            "serious_side_effects": ["Serious effect1, Serious effect2"],            "taking_instructions": ["How to take"],
            "taking_instructions_bassa": ["Instructions in Bassa"],
            "taking_instructions_duala": ["Instructions in Duala"],
            "taking_instructions_ewondo": ["Instructions in Ewondo"],
            "precautions": ["Special precautions"],
            "drug_interactions": ["Interaction1, Interaction2"],
            "contraindications": ["When not to use"],
            "dosage_forms": ["Tablet, Capsule, Liquid"],
            "storage_instructions": ["How to store"],
            "drug_class": ["Medication class"],
            "pregnancy_category": ["A/B/C/D/X"],
            "cost_category": ["low/moderate/high"],
            "pediatric_dosing": ["Dosing for children"],
            "geriatric_considerations": ["Considerations for elderly"],
            "local_availability": ["Availability in Cameroon"]
        },
        
        "enhanced_treatments_template": {
            "treatment_name": ["Enter treatment name"],
            "treatment_type": ["Medical/Preventive/Surgical"],
            "description": ["Brief description"],
            "patient_explanation": ["Simple explanation"],
            "patient_explanation_bassa": ["Explanation in Bassa"],
            "patient_explanation_duala": ["Explanation in Duala"],
            "patient_explanation_ewondo": ["Explanation in Ewondo"],
            "procedure_steps": ["Step1, Step2, Step3"],
            "preparation": ["Preparation needed"],
            "duration": ["How long it takes"],
            "recovery_time": ["Recovery period"],
            "success_rate": ["Success percentage"],
            "risks": ["Potential risks"],
            "alternatives": ["Alternative treatments"],
            "post_treatment_care": ["Aftercare instructions"],
            "pediatric_notes": ["Child-specific notes"],
            "geriatric_notes": ["Elderly-specific notes"],
            "local_context": ["Local implementation"]
        },
        
        "enhanced_lifestyle_template": {
            "category": ["Nutrition/Exercise/etc"],
            "recommendation": ["Specific recommendation"],
            "explanation": ["Why it's important"],
            "explanation_bassa": ["Explanation in Bassa"],
            "explanation_duala": ["Explanation in Duala"],
            "explanation_ewondo": ["Explanation in Ewondo"],
            "difficulty_level": ["easy/moderate/hard"],
            "evidence_level": ["high/moderate/low"],
            "target_conditions": ["Condition1, Condition2"],
            "pediatric_notes": ["For children"],
            "geriatric_notes": ["For elderly"],
            "local_context": ["Local adaptation"]
        },
        
        "age_specific_template": {
            "medication_name": ["Medication name"],
            "age_group": ["Pediatric/Geriatric/Adult"],
            "special_considerations": ["Special notes"],
            "dosing_adjustments": ["Dosing changes"],
            "monitoring_requirements": ["What to monitor"],
            "common_errors": ["Common mistakes"]
        },
        
        "translations_template": {
            "english_term": ["Medical term"],
            "bassa_translation": ["Bassa translation"],
            "duala_translation": ["Duala translation"],
            "ewondo_translation": ["Ewondo translation"],
            "category": ["condition/medication/symptom"]
        }
    }
    
    # Create data directory if it doesn't exist
    os.makedirs("data/templates", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save all templates as Excel files
    for template_name, template_data in templates.items():
        df = pd.DataFrame(template_data)
        df.to_excel(f"data/templates/{template_name}_{timestamp}.xlsx", index=False)
    
    print("\nEnhanced multilingual medical templates created successfully!")
    print(f"Saved to data/templates/ directory with timestamp: {timestamp}")
    print("\nAvailable templates:")
    print("- Enhanced medical conditions template (with multilingual support)")
    print("- Enhanced medications template (with dosing and language support)")
    print("- Enhanced treatments template (with procedure details)")
    print("- Enhanced lifestyle recommendations template")
    print("- Age-specific medication considerations template")
    print("- Medical translations template")
    
    return {
        "templates_created": len(templates),
        "timestamp": timestamp,
        "template_names": list(templates.keys())
    }

if __name__ == "__main__":
    # Create the datasets when script is run
    datasets = create_enhanced_medical_datasets()
    templates = create_enhanced_templates()
    
    print("\nMedical knowledge database generation complete!")
    