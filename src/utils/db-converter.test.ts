import { dbToFader, faderToDb, formatDb, parseDb, DB_PRESETS } from './db-converter.js';

describe('dB Converter', () => {
    describe('dbToFader', () => {
        test('converts -∞ dB to 0.0', () => {
            expect(dbToFader(-90)).toBe(0.0);
            expect(dbToFader(-Infinity)).toBe(0.0);
        });

        test('converts 0 dB (unity) to 0.75', () => {
            expect(dbToFader(0)).toBe(0.75);
        });

        test('converts +10 dB (max) to 1.0', () => {
            expect(dbToFader(10)).toBe(1.0);
        });

        test('converts -10 dB correctly', () => {
            expect(dbToFader(-10)).toBeCloseTo(0.397, 2);
        });
    });

    describe('faderToDb', () => {
        test('converts 0.0 to -∞ dB', () => {
            expect(faderToDb(0)).toBe(-Infinity);
        });

        test('converts 0.75 to 0 dB (unity)', () => {
            expect(faderToDb(0.75)).toBeCloseTo(0, 1);
        });

        test('converts 1.0 to +10 dB', () => {
            expect(faderToDb(1)).toBe(10);
        });
    });

    describe('formatDb', () => {
        test('formats -∞ correctly', () => {
            expect(formatDb(-Infinity)).toBe('-∞ dB');
            expect(formatDb(-100)).toBe('-∞ dB');
        });

        test('formats positive values with + sign', () => {
            expect(formatDb(6)).toBe('+6.0 dB');
        });

        test('formats negative values', () => {
            expect(formatDb(-10)).toBe('-10.0 dB');
        });

        test('formats zero without sign', () => {
            expect(formatDb(0)).toBe('0.0 dB');
        });
    });

    describe('parseDb', () => {
        test('parses various formats', () => {
            expect(parseDb('0')).toBe(0);
            expect(parseDb('0dB')).toBe(0);
            expect(parseDb('0 dB')).toBe(0);
            expect(parseDb('+6dB')).toBe(6);
            expect(parseDb('-10 dB')).toBe(-10);
            expect(parseDb('-inf')).toBe(-Infinity);
            expect(parseDb('-∞')).toBe(-Infinity);
        });

        test('returns null for invalid input', () => {
            expect(parseDb('invalid')).toBeNull();
            expect(parseDb('abc')).toBeNull();
        });
    });

    describe('DB_PRESETS', () => {
        test('has correct preset values', () => {
            expect(DB_PRESETS.OFF).toBe(-Infinity);
            expect(DB_PRESETS.UNITY).toBe(0);
            expect(DB_PRESETS.PLUS_10).toBe(10);
            expect(DB_PRESETS.MINUS_6).toBe(-6);
        });
    });
});