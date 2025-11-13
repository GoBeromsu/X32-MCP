import { X32Connection } from './x32-connection.js';
import { dbToFader } from '../utils/db-converter.js';

describe('X32Connection Integration Tests', () => {
    let connection: X32Connection;

    beforeAll(() => {
        connection = new X32Connection();
    });

    afterAll(async () => {
        if (connection.connected) {
            await connection.disconnect();
        }
    });

    test('Connect to X32 emulator', async () => {
        await connection.connect({ host: '10.69.6.254', port: 10023 });
        expect(connection.connected).toBe(true);
    });

    test('Get mixer info', async () => {
        const info = await connection.getInfo();
        expect(info.consoleModel).toBe('X32');
        expect(info.serverName).toBe('X32 Emulator');
    });

    test('Set and get channel parameters', async () => {
        // Set channel 1 to unity gain
        const unityFader = dbToFader(0);
        await connection.setChannelParameter(1, 'mix/fader', unityFader);

        const result = await connection.getChannelParameter(1, 'mix/fader');
        expect(Number(result)).toBeCloseTo(0.75, 2);
    });

    test('Set channel name and color', async () => {
        await connection.setChannelParameter(1, 'config/name', 'Test Ch');
        await connection.setChannelParameter(1, 'config/color', 1); // Red

        const name = await connection.getChannelParameter(1, 'config/name');
        const color = await connection.getChannelParameter(1, 'config/color');

        expect(name).toBe('Test Ch');
        expect(Number(color)).toBe(1);
    });

    test('Channel mute and solo', async () => {
        // Test mute (X32 inverted logic: 0 = muted)
        await connection.setChannelParameter(1, 'mix/on', 0);
        let onState = await connection.getChannelParameter(1, 'mix/on');
        expect(Number(onState)).toBe(0);

        // Test unmute
        await connection.setChannelParameter(1, 'mix/on', 1);
        onState = await connection.getChannelParameter(1, 'mix/on');
        expect(Number(onState)).toBe(1);

        // Test solo
        await connection.setChannelParameter(1, 'solo', 1);
        let soloState = await connection.getChannelParameter(1, 'solo');
        expect(Number(soloState)).toBe(1);
    });

    test('Channel pan control', async () => {
        // Set to center
        await connection.setChannelParameter(1, 'mix/pan', 0.5);
        let pan = await connection.getChannelParameter(1, 'mix/pan');
        expect(Number(pan)).toBeCloseTo(0.5, 2);

        // Set to full left
        await connection.setChannelParameter(1, 'mix/pan', 0);
        pan = await connection.getChannelParameter(1, 'mix/pan');
        expect(Number(pan)).toBe(0);

        // Set to full right
        await connection.setChannelParameter(1, 'mix/pan', 1);
        pan = await connection.getChannelParameter(1, 'mix/pan');
        expect(Number(pan)).toBe(1);
    });
});