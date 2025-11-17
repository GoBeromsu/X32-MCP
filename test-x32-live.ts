#!/usr/bin/env tsx
/**
 * Live test with X32 Emulator
 * Tests the MCP server tools with actual X32 emulator
 */

import { X32Connection } from './src/services/x32-connection.js';

async function testLiveConnection() {
    const connection = new X32Connection();

    console.log('🎛️  Testing X32-MCP with X32 Emulator\n');
    console.log('Emulator IP: 10.69.6.254');
    console.log('Emulator Port: 10023\n');

    try {
        // Test 1: Connection
        console.log('1. Testing Connection...');
        await connection.connect({ host: '10.69.6.254', port: 10023 });
        console.log('✅ Connected successfully\n');

        // Test 2: Get mixer info
        console.log('2. Getting mixer info...');
        const info = await connection.getInfo();
        console.log('✅ Mixer Info:');
        console.log(`   Model: ${info.consoleModel}`);
        console.log(`   Version: ${info.consoleVersion}`);
        console.log(`   Server: ${info.serverName}\n`);

        // Test 3: Channel operations
        console.log('3. Testing channel operations...');

        // Set channel 1 name
        await connection.setChannelParameter(1, 'config/name', 'Lead Vox');
        console.log('✅ Set channel 1 name to "Lead Vox"');

        // Set channel 1 volume to unity (0 dB)
        await connection.setChannelParameter(1, 'mix/fader', 0.75);
        console.log('✅ Set channel 1 to unity gain (0 dB)');

        // Set channel 1 color to red
        await connection.setChannelParameter(1, 'config/color', 1);
        console.log('✅ Set channel 1 color to red');

        // Mute channel 1
        await connection.setChannelParameter(1, 'mix/on', 0);
        console.log('✅ Muted channel 1');

        // Unmute channel 1
        await connection.setChannelParameter(1, 'mix/on', 1);
        console.log('✅ Unmuted channel 1\n');

        // Test 4: Bus operations
        console.log('4. Testing bus operations...');

        // Set bus 1 volume
        await connection.setParameter('/bus/01/mix/fader', 0.5);
        console.log('✅ Set bus 1 volume to 50%');

        // Set channel 1 send to bus 1
        await connection.setParameter('/ch/01/mix/01/level', 0.75);
        console.log('✅ Set channel 1 send to bus 1 at unity\n');

        // Test 5: Main operations
        console.log('5. Testing main operations...');

        // Set main stereo volume
        await connection.setParameter('/main/st/mix/fader', 0.75);
        console.log('✅ Set main stereo to unity gain');

        // Set monitor level
        await connection.setParameter('/main/m/mix/fader', 0.5);
        console.log('✅ Set monitor level to 50%\n');

        // Test 6: FX operations
        console.log('6. Testing FX operations...');

        // Set FX 1 parameter
        await connection.setParameter('/fx/1/par/01', 0.5);
        console.log('✅ Set FX 1 parameter 1 to 50%');

        // Bypass FX 1
        await connection.setParameter('/fx/1/par/02', 1);
        console.log('✅ Bypassed FX 1\n');

        console.log('🎉 All tests passed successfully!\n');

        // Disconnect
        console.log('Disconnecting...');
        await connection.disconnect();
        console.log('✅ Disconnected\n');
    } catch (error) {
        console.error('❌ Test failed:', error);
        if (connection.connected) {
            await connection.disconnect();
        }
        process.exit(1);
    }
}

// Run the test
testLiveConnection().catch(console.error);
