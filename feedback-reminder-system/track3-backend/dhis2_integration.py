"""
DHIS2 Integration Service for Blood Bank Data
Handles data exchange with District Health Information System 2
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import httpx
from models import DHIS2SyncRecord

# Configure logging
logger = logging.getLogger(__name__)

# DHIS2 Configuration
DHIS2_BASE_URL = os.getenv("DHIS2_BASE_URL", "https://dhis2.dgh.cm")
DHIS2_USERNAME = os.getenv("DHIS2_USERNAME", "admin")
DHIS2_PASSWORD = os.getenv("DHIS2_PASSWORD", "district")
DHIS2_API_VERSION = os.getenv("DHIS2_API_VERSION", "40")
DHIS2_TIMEOUT = int(os.getenv("DHIS2_TIMEOUT", "30"))

class DHIS2Client:
    """DHIS2 API client for data exchange"""

    def __init__(self):
        self.base_url = f"{DHIS2_BASE_URL}/api/{DHIS2_API_VERSION}"
        self.auth = (DHIS2_USERNAME, DHIS2_PASSWORD)
        self.timeout = DHIS2_TIMEOUT

    async def test_connection(self) -> Dict[str, Any]:
        """Test DHIS2 connection and authentication"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/me",
                    auth=self.auth
                )

                if response.status_code == 200:
                    user_info = response.json()
                    return {
                        "status": "connected",
                        "user": user_info.get("displayName", "Unknown"),
                        "organization": user_info.get("organisationUnits", [{}])[0].get("displayName", "Unknown"),
                        "api_version": DHIS2_API_VERSION
                    }
                else:
                    return {
                        "status": "failed",
                        "error": f"HTTP {response.status_code}: {response.text}"
                    }

        except Exception as e:
            logger.error(f"DHIS2 connection test failed: {e}")
            return {
                "status": "error",
                "error": str(e)
            }

    async def send_data_to_dhis2(self, data_values: List[Dict[str, Any]], period: str, org_unit: str) -> Dict[str, Any]:
        """Send data values to DHIS2"""
        try:
            data_value_set = {
                "dataSet": "BLOOD_BANK_DATASET",
                "completeDate": datetime.now().isoformat(),
                "period": period,
                "orgUnit": org_unit,
                "dataValues": data_values
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/dataValueSets",
                    auth=self.auth,
                    json=data_value_set,
                    headers={"Content-Type": "application/json"}
                )

                if response.status_code in [200, 201]:
                    result = response.json()
                    return {
                        "status": "success",
                        "imported": result.get("importCount", {}).get("imported", 0),
                        "updated": result.get("importCount", {}).get("updated", 0)
                    }
                else:
                    return {
                        "status": "failed",
                        "error": f"HTTP {response.status_code}: {response.text}"
                    }

        except Exception as e:
            logger.error(f"Error sending data to DHIS2: {e}")
            return {
                "status": "error",
                "error": str(e)
            }

class DHIS2SyncService:
    """Service for synchronizing data with DHIS2"""
    
    def __init__(self, database):
        self.database = database
        self.client = DHIS2Client()
    
    async def sync_daily_data(self, date: datetime = None):
        """Sync daily blood bank data to DHIS2"""
        if not date:
            date = datetime.now()

        from models import DHIS2SyncRecord

        period = date.strftime("%Y%m%d")  # DHIS2 daily period format
        sync_id = f"daily_sync_{period}_{int(datetime.now().timestamp())}"

        sync_record = DHIS2SyncRecord(
            sync_id=sync_id,
            sync_type="daily",
            sync_status="pending",
            sync_started=datetime.now()
        )
        try:


            # Test DHIS2 connection
            connection_test = await self.client.test_connection()

            if connection_test["status"] != "connected":
                sync_record.sync_status = "failed"
                sync_record.error_message = f"DHIS2 connection failed: {connection_test.get('error')}"
                logger.error(f"DHIS2 sync failed: {sync_record.error_message}")
                return sync_record

            # Gather blood bank data for the specified date
            start_date = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date + timedelta(days=1)

            # Get donations for the day
            donations_cursor = self.database.blood_donations.find({
                "donation_date": {"$gte": start_date, "$lt": end_date}
            })
            donations = await donations_cursor.to_list(length=None)

            # Get current inventory
            inventory_cursor = self.database.blood_inventory.find({
                "status": {"$in": ["available", "reserved", "expired"]}
            })
            inventory = await inventory_cursor.to_list(length=None)

            # Prepare data for DHIS2
            data_values = []
            period = date.strftime("%Y%m%d")

            # Add donation count
            data_values.append({
                "dataElement": "BB_DONATIONS_TOTAL",
                "value": len(donations),
                "period": period
            })

            # Add inventory counts by blood type
            blood_type_counts = {}
            for item in inventory:
                if item.get("status") in ["available", "reserved"]:
                    blood_type = item.get("blood_type", "")
                    blood_type_counts[blood_type] = blood_type_counts.get(blood_type, 0) + 1

            # Send key blood type data
            for blood_type, count in blood_type_counts.items():
                if blood_type in ["A+", "O-", "B+", "AB+"]:
                    data_values.append({
                        "dataElement": f"BB_INV_{blood_type.replace('+', 'POS').replace('-', 'NEG')}",
                        "value": count,
                        "period": period
                    })

            # Send data to DHIS2 if we have data
            if data_values:
                result = await self.client.send_data_to_dhis2(
                    data_values, period, "DGH_ORG_UNIT_ID"
                )

                if result["status"] == "success":
                    sync_record.sync_status = "success"
                    sync_record.records_sent = len(data_values)
                    logger.info(f"Successfully synced {len(data_values)} data values to DHIS2")
                else:
                    sync_record.sync_status = "failed"
                    sync_record.error_message = result.get("error", "Unknown error")
                    logger.error(f"DHIS2 sync failed: {sync_record.error_message}")
            else:
                sync_record.sync_status = "success"
                sync_record.records_sent = 0
                logger.info("No data to sync for the specified date")

            # Save sync record
            await self.database.dhis2_sync_records.insert_one(sync_record.dict())

        except Exception as e:
            logger.error(f"Error during DHIS2 sync: {e}")
            sync_record.sync_status = "failed"
            sync_record.error_message = str(e)

        sync_record.sync_completed = datetime.now()
        return sync_record
