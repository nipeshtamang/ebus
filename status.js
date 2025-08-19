#!/usr/bin/env node

const http = require('http');
const https = require('https');

const services = [
  { name: 'API Service', port: 3001, path: '/health' },
  { name: 'Client App', port: 3000, path: '/' },
  { name: 'Admin App', port: 3006, path: '/' },
  { name: 'Superadmin App', port: 3002, path: '/' }
];

function checkService(service) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: service.port,
      path: service.path,
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve({
        name: service.name,
        port: service.port,
        status: '✅ Running',
        statusCode: res.statusCode
      });
    });

    req.on('error', () => {
      resolve({
        name: service.name,
        port: service.port,
        status: '❌ Not Running',
        statusCode: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        port: service.port,
        status: '⏰ Timeout',
        statusCode: null
      });
    });

    req.end();
  });
}

async function checkAllServices() {
  console.log('🔍 Checking eBus Services Status...\n');
  
  const results = await Promise.all(services.map(checkService));
  
  console.log('📊 Service Status Summary:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(`${result.status} ${result.name} (Port ${result.port})`);
    if (result.statusCode) {
      console.log(`   Status Code: ${result.statusCode}`);
    }
    console.log('');
  });
  
  const runningServices = results.filter(r => r.status === '✅ Running').length;
  const totalServices = services.length;
  
  console.log(`📈 Summary: ${runningServices}/${totalServices} services running`);
  
  if (runningServices === totalServices) {
    console.log('🎉 All services are running successfully!');
    console.log('\n🌐 Access URLs:');
    console.log(`   Client App: http://localhost:${services[1].port}`);
    console.log(`   Admin App: http://localhost:${services[2].port}`);
    console.log(`   Superadmin App: http://localhost:${services[3].port}`);
    console.log(`   API Health: http://localhost:${services[0].port}/health`);
  } else {
    console.log('⚠️  Some services are not running. Use `npm start` to start all services.');
  }
}

checkAllServices().catch(console.error); 