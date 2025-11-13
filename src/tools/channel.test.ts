import { X32Connection } from '../services/x32-connection.js';
import { dbToFader, faderToDb } from '../utils/db-converter.js';
import { getColorValue, getColorName } from '../utils/color-converter.js';
import { parsePan, panToPercent } from '../utils/pan-converter.js';

describe('Channel Tools Integration', () => {
    let connection: X32Connection;

    beforeAll(async () => {
        connection = new X32Connection();
        await connection.connect({ host: '10.69.6.254', port: 10023 });
    });

    afterAll(async () => {
        if (connection.connected) {
            await connection.disconnect();
        }
    });

    describe('channel_set_volume', () => {
        test('sets volume in linear mode', async () => {
            await connection.setChannelParameter(1, 'mix/fader', 0.5);
            const result = await connection.getChannelParameter(1, 'mix/fader');
            expect(Number(result)).toBeCloseTo(0.5, 2);
        });

        test('sets volume in dB mode', async () => {
            const unityFader = dbToFader(0); // 0 dB
            await connection.setChannelParameter(1, 'mix/fader', unityFader);
            const result = await connection.getChannelParameter(1, 'mix/fader');
            expect(Number(result)).toBeCloseTo(0.75, 2);
        });
    });

    describe('channel_set_name', () => {
        test('sets channel name', async () => {
            const testName = 'Test Ch 1';
            await connection.setChannelParameter(1, 'config/name', testName);
            const result = await connection.getChannelParameter(1, 'config/name');
            expect(result).toBe(testName);
        });

        test('truncates long names to 12 characters', async () => {
            const longName = 'This is a very long channel name';
            const truncated = longName.substring(0, 12);
            await connection.setChannelParameter(2, 'config/name', truncated);
            const result = await connection.getChannelParameter(2, 'config/name');
            expect(result).toBe(truncated);
        });
    });

    describe('channel_set_color', () => {
        test('sets color by name', async () => {
            const colorValue = getColorValue('red');
            expect(colorValue).toBe(1);
            await connection.setChannelParameter(1, 'config/color', colorValue!);
            const result = await connection.getChannelParameter(1, 'config/color');
            expect(Number(result)).toBe(1);
        });

        test('sets color by number', async () => {
            await connection.setChannelParameter(2, 'config/color', 2); // Green
            const result = await connection.getChannelParameter(2, 'config/color');
            expect(Number(result)).toBe(2);
            expect(getColorName(2)).toBe('green');
        });
    });

    describe('channel_set_pan', () => {
        test('sets pan to center', async () => {
            await connection.setChannelParameter(1, 'mix/pan', 0.5);
            const result = await connection.getChannelParameter(1, 'mix/pan');
            expect(Number(result)).toBeCloseTo(0.5, 2);
        });

        test('sets pan using percentage', async () => {
            const panValue = parsePan(-50); // 50% left
            expect(panValue).toBeCloseTo(0.25, 2);
            await connection.setChannelParameter(2, 'mix/pan', panValue!);
            const result = await connection.getChannelParameter(2, 'mix/pan');
            expect(panToPercent(Number(result))).toBeCloseTo(-50, 0);
        });

        test('sets pan using LR notation', async () => {
            const panValue = parsePan('L100'); // Full left
            expect(panValue).toBe(0);
            await connection.setChannelParameter(3, 'mix/pan', panValue!);
            const result = await connection.getChannelParameter(3, 'mix/pan');
            expect(Number(result)).toBe(0);
        });
    });

    describe('channel_mute', () => {
        test('mutes and unmutes channel', async () => {
            // Mute (X32 inverted: 0 = muted)
            await connection.setChannelParameter(1, 'mix/on', 0);
            let result = await connection.getChannelParameter(1, 'mix/on');
            expect(Number(result)).toBe(0);

            // Unmute (1 = unmuted)
            await connection.setChannelParameter(1, 'mix/on', 1);
            result = await connection.getChannelParameter(1, 'mix/on');
            expect(Number(result)).toBe(1);
        });
    });

    describe('channel_solo', () => {
        test('solos and unsolos channel', async () => {
            // Solo on
            await connection.setChannelParameter(1, 'solo', 1);
            let result = await connection.getChannelParameter(1, 'solo');
            expect(Number(result)).toBe(1);

            // Solo off
            await connection.setChannelParameter(1, 'solo', 0);
            result = await connection.getChannelParameter(1, 'solo');
            expect(Number(result)).toBe(0);
        });
    });
});