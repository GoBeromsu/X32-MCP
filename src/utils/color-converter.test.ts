import { getColorValue, getColorName, getAvailableColors, X32_COLORS } from './color-converter.js';

describe('Color Converter', () => {
    describe('getColorValue', () => {
        test('returns correct values for basic colors', () => {
            expect(getColorValue('off')).toBe(0);
            expect(getColorValue('red')).toBe(1);
            expect(getColorValue('green')).toBe(2);
            expect(getColorValue('yellow')).toBe(3);
            expect(getColorValue('blue')).toBe(4);
            expect(getColorValue('magenta')).toBe(5);
            expect(getColorValue('cyan')).toBe(6);
            expect(getColorValue('white')).toBe(7);
        });

        test('returns correct values for inverted colors', () => {
            expect(getColorValue('red_inv')).toBe(9);
            expect(getColorValue('green-inv')).toBe(10);
            expect(getColorValue('YELLOW_INV')).toBe(11);
        });

        test('handles case insensitive input', () => {
            expect(getColorValue('RED')).toBe(1);
            expect(getColorValue('Green')).toBe(2);
            expect(getColorValue('BLUE')).toBe(4);
        });

        test('parses numeric strings', () => {
            expect(getColorValue('0')).toBe(0);
            expect(getColorValue('5')).toBe(5);
            expect(getColorValue('15')).toBe(15);
        });

        test('returns null for invalid input', () => {
            expect(getColorValue('invalid')).toBeNull();
            expect(getColorValue('16')).toBeNull();
            expect(getColorValue('-1')).toBeNull();
        });
    });

    describe('getColorName', () => {
        test('returns correct names for color values', () => {
            expect(getColorName(0)).toBe('off');
            expect(getColorName(1)).toBe('red');
            expect(getColorName(7)).toBe('white');
            expect(getColorName(9)).toBe('red-inv');
        });

        test('returns null for invalid values', () => {
            expect(getColorName(-1)).toBeNull();
            expect(getColorName(16)).toBeNull();
            expect(getColorName(100)).toBeNull();
        });
    });

    describe('getAvailableColors', () => {
        test('returns all color names', () => {
            const colors = getAvailableColors();
            expect(colors).toContain('off');
            expect(colors).toContain('red');
            expect(colors).toContain('green');
            expect(colors).toContain('red-inv');
            expect(colors).toHaveLength(16);
        });
    });

    describe('X32_COLORS constant', () => {
        test('has correct color mappings', () => {
            expect(X32_COLORS.OFF).toBe(0);
            expect(X32_COLORS.RED).toBe(1);
            expect(X32_COLORS.GREEN).toBe(2);
            expect(X32_COLORS.WHITE_INV).toBe(15);
        });
    });
});