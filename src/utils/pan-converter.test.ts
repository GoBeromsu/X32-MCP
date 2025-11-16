import { percentToPan, panToPercent, lrToPan, panToLr, parsePan } from './pan-converter.js';

describe('Pan Converter', () => {
    describe('percentToPan', () => {
        test('converts percentage to linear', () => {
            expect(percentToPan(-100)).toBe(0);    // Full left
            expect(percentToPan(-50)).toBe(0.25);   // 50% left
            expect(percentToPan(0)).toBe(0.5);      // Center
            expect(percentToPan(50)).toBe(0.75);    // 50% right
            expect(percentToPan(100)).toBe(1);      // Full right
        });

        test('clamps values to valid range', () => {
            expect(percentToPan(-150)).toBe(0);
            expect(percentToPan(150)).toBe(1);
        });
    });

    describe('panToPercent', () => {
        test('converts linear to percentage', () => {
            expect(panToPercent(0)).toBe(-100);     // Full left
            expect(panToPercent(0.25)).toBe(-50);   // 50% left
            expect(panToPercent(0.5)).toBe(0);      // Center
            expect(panToPercent(0.75)).toBe(50);    // 50% right
            expect(panToPercent(1)).toBe(100);      // Full right
        });
    });

    describe('lrToPan', () => {
        test('converts LR notation to linear', () => {
            expect(lrToPan('L100')).toBe(0);        // Full left
            expect(lrToPan('L50')).toBe(0.25);      // 50% left
            expect(lrToPan('C')).toBe(0.5);         // Center
            expect(lrToPan('CENTER')).toBe(0.5);    // Center
            expect(lrToPan('R50')).toBe(0.75);      // 50% right
            expect(lrToPan('R100')).toBe(1);        // Full right
        });

        test('handles case insensitive input', () => {
            expect(lrToPan('l100')).toBe(0);
            expect(lrToPan('r50')).toBe(0.75);
            expect(lrToPan('c')).toBe(0.5);
        });

        test('returns null for invalid input', () => {
            expect(lrToPan('invalid')).toBeNull();
            expect(lrToPan('X50')).toBeNull();
            expect(lrToPan('L150')).toBeNull();
        });
    });

    describe('panToLr', () => {
        test('converts linear to LR notation', () => {
            expect(panToLr(0)).toBe('L100');
            expect(panToLr(0.25)).toBe('L50');
            expect(panToLr(0.5)).toBe('C');
            expect(panToLr(0.75)).toBe('R50');
            expect(panToLr(1)).toBe('R100');
        });
    });

    describe('parsePan', () => {
        test('parses percentage values', () => {
            expect(parsePan(-50)).toBeCloseTo(0.25, 2);
            expect(parsePan(0)).toBe(0.5);
            expect(parsePan(50)).toBeCloseTo(0.75, 2);
        });

        test('parses percentage values as percentage', () => {
            expect(parsePan(0.5)).toBeCloseTo(0.50125, 2); // 0.5% as percentage
            expect(parsePan(25)).toBeCloseTo(0.625, 2); // 25% right
        });

        test('parses LR notation', () => {
            expect(parsePan('L100')).toBe(0);
            expect(parsePan('C')).toBe(0.5);
            expect(parsePan('R100')).toBe(1);
        });

        test('parses string numbers', () => {
            expect(parsePan('-50')).toBeCloseTo(0.25, 2);
            expect(parsePan('0.5')).toBeCloseTo(0.5, 2);
        });

        test('returns null for invalid input', () => {
            expect(parsePan('invalid')).toBeNull();
            expect(parsePan(200)).toBeNull();
        });
    });
});