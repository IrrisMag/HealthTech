#!/usr/bin/env node

/**
 * Script to help users find their IP address for mobile app configuration
 */

const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push({
          name: name,
          address: interface.address
        });
      }
    }
  }
  
  return addresses;
}

function main() {
  console.log('🔍 Finding your IP address for mobile app configuration...\n');
  
  const addresses = getLocalIPAddress();
  
  if (addresses.length === 0) {
    console.log('❌ No network interfaces found.');
    console.log('Make sure you are connected to a network.\n');
    return;
  }
  
  console.log('📱 Available IP addresses:');
  addresses.forEach((addr, index) => {
    console.log(`   ${index + 1}. ${addr.address} (${addr.name})`);
  });
  
  const primaryIP = addresses[0].address;
  console.log(`\n✅ Primary IP address: ${primaryIP}`);
  
  console.log('\n📋 Configuration options:');
  console.log('\n1. AUTOMATIC (Recommended):');
  console.log('   The mobile app will automatically detect your IP address.');
  console.log('   No configuration needed!\n');
  
  console.log('2. MANUAL OVERRIDE:');
  console.log('   If automatic detection doesn\'t work, add this to your .env.local file:');
  console.log(`   EXPO_PUBLIC_HOST_IP=${primaryIP}`);
  console.log(`   EXPO_PUBLIC_CHATBOT_API_URL=http://${primaryIP}:8003`);
  console.log(`   EXPO_PUBLIC_FEEDBACK_API_URL=http://${primaryIP}:8001`);
  console.log(`   EXPO_PUBLIC_AUTH_API_URL=http://${primaryIP}:8001\n`);
  
  console.log('🚀 To test the mobile app:');
  console.log('   1. Start the backend: docker-compose -f docker-compose.track2.yml up -d');
  console.log('   2. Start the mobile app: npm start');
  console.log('   3. Scan the QR code with Expo Go app');
  console.log('   4. Test with: "What is lupus?"\n');
}

if (require.main === module) {
  main();
}

module.exports = { getLocalIPAddress };
