#!/usr/bin/env python3
"""
Test DHIS2 connection to verify real server accessibility
"""

import asyncio
import httpx
import os
from datetime import datetime

class DHIS2Tester:
    def __init__(self):
        # Use WORKING DHIS2 demo instance - REAL SERVER
        self.base_url = "https://play.im.dhis2.org/stable-2-42-1"
        self.username = "admin"
        self.password = "district"
        self.api_version = "42"
        self.timeout = 30
        self.api_url = f"{self.base_url}/api/{self.api_version}"

    async def test_connection(self):
        """Test DHIS2 connection and get system info"""
        print("🔍 Testing DHIS2 Connection...")
        print(f"   URL: {self.base_url}")
        print(f"   Username: {self.username}")
        print(f"   API URL: {self.api_url}")
        print()

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Test basic authentication
                print("1️⃣ Testing authentication...")
                response = await client.get(
                    f"{self.api_url}/me",
                    auth=(self.username, self.password)
                )
                
                if response.status_code == 200:
                    user_info = response.json()
                    print(f"   ✅ Authentication successful!")
                    print(f"   👤 User: {user_info.get('displayName', 'Unknown')}")
                    print(f"   🏢 Organization: {user_info.get('organisationUnits', [{}])[0].get('displayName', 'Unknown') if user_info.get('organisationUnits') else 'None'}")
                else:
                    print(f"   ❌ Authentication failed: {response.status_code}")
                    return False

                # Test system info
                print("\n2️⃣ Getting system information...")
                response = await client.get(
                    f"{self.api_url}/system/info",
                    auth=(self.username, self.password)
                )
                
                if response.status_code == 200:
                    system_info = response.json()
                    print(f"   ✅ System info retrieved!")
                    print(f"   🏥 Instance: {system_info.get('instanceBaseUrl', 'Unknown')}")
                    print(f"   📊 Version: {system_info.get('version', 'Unknown')}")
                    print(f"   📅 Server Time: {system_info.get('serverDate', 'Unknown')}")
                else:
                    print(f"   ❌ System info failed: {response.status_code}")

                # Test organization units
                print("\n3️⃣ Testing organization units...")
                response = await client.get(
                    f"{self.api_url}/organisationUnits",
                    auth=(self.username, self.password),
                    params={"paging": "false", "fields": "id,displayName,level"}
                )
                
                if response.status_code == 200:
                    org_units = response.json()
                    units = org_units.get('organisationUnits', [])
                    print(f"   ✅ Organization units retrieved!")
                    print(f"   🏢 Total units: {len(units)}")
                    if units:
                        print(f"   📋 Sample units:")
                        for unit in units[:3]:
                            print(f"      - {unit.get('displayName', 'Unknown')} (Level {unit.get('level', '?')})")
                else:
                    print(f"   ❌ Organization units failed: {response.status_code}")

                # Test data elements (for blood bank data)
                print("\n4️⃣ Testing data elements...")
                response = await client.get(
                    f"{self.api_url}/dataElements",
                    auth=(self.username, self.password),
                    params={"paging": "false", "fields": "id,displayName,domainType", "filter": "domainType:eq:AGGREGATE"}
                )
                
                if response.status_code == 200:
                    data_elements = response.json()
                    elements = data_elements.get('dataElements', [])
                    print(f"   ✅ Data elements retrieved!")
                    print(f"   📊 Total elements: {len(elements)}")
                    if elements:
                        print(f"   📋 Sample elements:")
                        for element in elements[:3]:
                            print(f"      - {element.get('displayName', 'Unknown')}")
                else:
                    print(f"   ❌ Data elements failed: {response.status_code}")

                print(f"\n🎉 DHIS2 Connection Test Complete!")
                print(f"✅ Server is accessible and functional")
                print(f"✅ Ready for blood bank data integration")
                return True

        except httpx.TimeoutException:
            print(f"❌ Connection timeout after {self.timeout} seconds")
            print(f"   The server might be slow or unreachable")
            return False
        except httpx.ConnectError:
            print(f"❌ Connection error")
            print(f"   Cannot reach the server at {self.base_url}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False

async def main():
    print("🩸 DHIS2 Connection Tester for Blood Bank Integration")
    print("=" * 60)
    
    tester = DHIS2Tester()
    success = await tester.test_connection()
    
    print("\n" + "=" * 60)
    if success:
        print("🎯 RESULT: DHIS2 connection is working!")
        print("   Your Track 3 backend can now use real DHIS2 data")
        print("   No more mock data - everything will be live!")
    else:
        print("❌ RESULT: DHIS2 connection failed")
        print("   Please check your configuration or try a different server")
    
    print("\n🔧 To use this in your Track 3 backend, set:")
    print("   DHIS2_BASE_URL=https://play.im.dhis2.org/stable-2-42-1")
    print("   DHIS2_USERNAME=admin")
    print("   DHIS2_PASSWORD=district")
    print("   DHIS2_API_VERSION=42")

if __name__ == "__main__":
    asyncio.run(main())
