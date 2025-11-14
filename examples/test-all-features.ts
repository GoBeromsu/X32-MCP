import { X32Connection } from './src/services/x32-connection.js';
import { dbToFader } from './src/utils/db-converter.js';

async function testAllFeatures() {
    const connection = new X32Connection();

    try {
        console.log('Testing all X32 MCP features...\n');
        console.log('='.repeat(50));

        // 1. Connection test
        console.log('\n1. CONNECTION TEST');
        console.log('-'.repeat(30));
        await connection.connect({ host: '10.69.6.254', port: 10023 });
        console.log('✓ Connected to X32 emulator');

        const info = await connection.getInfo();
        console.log(`✓ Mixer: ${info.consoleModel} v${info.consoleVersion}`);

        // 2. Volume control with dB support
        console.log('\n2. VOLUME CONTROL (dB SUPPORT)');
        console.log('-'.repeat(30));
        const unityFader = dbToFader(0);
        await connection.setChannelParameter(1, 'mix/fader', unityFader);
        console.log('✓ Channel 1 set to 0 dB (unity gain)');

        const minus10Fader = dbToFader(-10);
        await connection.setChannelParameter(2, 'mix/fader', minus10Fader);
        console.log('✓ Channel 2 set to -10 dB');

        // 3. Channel naming
        console.log('\n3. CHANNEL NAMING');
        console.log('-'.repeat(30));
        await connection.setChannelParameter(1, 'config/name', 'Lead Vocal');
        await connection.setChannelParameter(2, 'config/name', 'Backup Vox');
        await connection.setChannelParameter(3, 'config/name', 'Guitar');
        console.log('✓ Channels 1-3 named');

        // 4. Channel colors
        console.log('\n4. CHANNEL COLORS');
        console.log('-'.repeat(30));
        await connection.setChannelParameter(1, 'config/color', 1); // Red
        await connection.setChannelParameter(2, 'config/color', 4); // Blue
        await connection.setChannelParameter(3, 'config/color', 2); // Green
        console.log('✓ Channels colored: 1=Red, 2=Blue, 3=Green');

        // 5. Panning
        console.log('\n5. PAN CONTROL');
        console.log('-'.repeat(30));
        await connection.setChannelParameter(1, 'mix/pan', 0.5);  // Center
        await connection.setChannelParameter(2, 'mix/pan', 0.25); // 50% Left
        await connection.setChannelParameter(3, 'mix/pan', 0.75); // 50% Right
        console.log('✓ Panning set: 1=Center, 2=L50, 3=R50');

        // 6. Solo/Mute
        console.log('\n6. SOLO/MUTE CONTROL');
        console.log('-'.repeat(30));

        // Mute channel 4
        await connection.setChannelParameter(4, 'mix/on', 0);
        console.log('✓ Channel 4 muted');

        // Solo channel 1
        await connection.setChannelParameter(1, 'solo', 1);
        console.log('✓ Channel 1 soloed');

        // Unsolo channel 1
        await connection.setChannelParameter(1, 'solo', 0);
        console.log('✓ Channel 1 unsoloed');

        // Unmute channel 4
        await connection.setChannelParameter(4, 'mix/on', 1);
        console.log('✓ Channel 4 unmuted');

        // 7. Get channel state
        console.log('\n7. CHANNEL STATE');
        console.log('-'.repeat(30));
        const [fader, on, solo, name, color, pan] = await Promise.all([
            connection.getChannelParameter(1, 'mix/fader'),
            connection.getChannelParameter(1, 'mix/on'),
            connection.getChannelParameter(1, 'solo'),
            connection.getChannelParameter(1, 'config/name'),
            connection.getChannelParameter(1, 'config/color'),
            connection.getChannelParameter(1, 'mix/pan')
        ]);

        console.log('Channel 1 State:');
        console.log(`  Name: ${name}`);
        console.log(`  Color: ${color === 1 ? 'Red' : color}`);
        console.log(`  Fader: ${Number(fader).toFixed(3)} (0 dB)`);
        console.log(`  Pan: ${Number(pan).toFixed(2)} (Center)`);
        console.log(`  Muted: ${Number(on) === 0 ? 'Yes' : 'No'}`);
        console.log(`  Solo: ${Number(solo) === 1 ? 'Yes' : 'No'}`);

        // Disconnect
        console.log('\n' + '='.repeat(50));
        await connection.disconnect();
        console.log('✓ Disconnected from X32');
        console.log('\n✅ All features tested successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        if (connection.connected) {
            await connection.disconnect();
        }
    }
}

testAllFeatures();