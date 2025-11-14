import { X32Connection } from './src/services/x32-connection.js';

async function testSoloPath() {
    const connection = new X32Connection();

    try {
        console.log('Testing solo parameter paths...\n');
        await connection.connect({ host: '10.69.6.254', port: 10023 });

        // Test different solo path patterns
        console.log('Testing /ch/01/mix/01/on (solo to mix bus 1):');
        try {
            const result = await connection.getParameter('/ch/01/mix/01/on');
            console.log(`  Result: ${result}`);
        } catch (e) {
            console.log(`  Failed: ${e}`);
        }

        console.log('\nTesting /-stat/solosw/01 (solo switch status):');
        try {
            const result = await connection.getParameter('/-stat/solosw/01');
            console.log(`  Result: ${result}`);
        } catch (e) {
            console.log(`  Failed: ${e}`);
        }

        // Set and get simple parameters that we know work
        console.log('\nVerified working parameters:');
        await connection.setChannelParameter(1, 'mix/fader', 0.5);
        const fader = await connection.getChannelParameter(1, 'mix/fader');
        console.log(`  Fader: ${fader}`);

        await connection.setChannelParameter(1, 'mix/on', 1);
        const on = await connection.getChannelParameter(1, 'mix/on');
        console.log(`  On: ${on}`);

        await connection.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

testSoloPath();