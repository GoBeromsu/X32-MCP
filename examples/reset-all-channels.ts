import { X32Connection } from './src/services/x32-connection.js';
import { dbToFader } from './src/utils/db-converter.js';

async function resetAllChannels() {
    const connection = new X32Connection();

    try {
        console.log('Resetting all channels to defaults...\n');
        console.log('Connecting to X32 emulator...');
        await connection.connect({ host: '10.69.6.254', port: 10023 });
        console.log('Connected!\n');

        const unityFader = dbToFader(0); // 0 dB = unity gain
        const centerPan = 0.5; // Center position

        console.log('Setting all 32 channels to:');
        console.log('  - Unity gain (0 dB)');
        console.log('  - Center pan\n');

        for (let channel = 1; channel <= 32; channel++) {
            // Set fader to unity gain
            await connection.setChannelParameter(channel, 'mix/fader', unityFader);

            // Set pan to center
            await connection.setChannelParameter(channel, 'mix/pan', centerPan);

            // Small delay to prevent overwhelming the mixer
            await new Promise(resolve => setTimeout(resolve, 30));

            // Progress indicator
            if (channel % 8 === 0) {
                console.log(`  Channels ${channel - 7}-${channel} ✓`);
            }
        }

        console.log('\n✅ All 32 channels reset to:');
        console.log('  - Fader: 0 dB (unity gain)');
        console.log('  - Pan: Center');

        await connection.disconnect();
        console.log('\nDisconnected.');
    } catch (error) {
        console.error('Error:', error);
        if (connection.connected) {
            await connection.disconnect();
        }
    }
}

resetAllChannels();