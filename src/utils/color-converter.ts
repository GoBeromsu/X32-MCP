/**
 * X32/M32 channel color utilities
 * Handles color mapping for channel strip colors
 */

/**
 * X32 Color Map
 * The X32 uses integer values 0-15 for channel colors
 */
export const X32_COLORS = {
    OFF: 0,        // Off/Black (no color)
    RED: 1,        // Red
    GREEN: 2,      // Green
    YELLOW: 3,     // Yellow
    BLUE: 4,       // Blue
    MAGENTA: 5,    // Magenta
    CYAN: 6,       // Cyan
    WHITE: 7,      // White
    OFF_INV: 8,    // Off Inverted
    RED_INV: 9,    // Red Inverted
    GREEN_INV: 10, // Green Inverted
    YELLOW_INV: 11,// Yellow Inverted
    BLUE_INV: 12,  // Blue Inverted
    MAGENTA_INV: 13,// Magenta Inverted
    CYAN_INV: 14,  // Cyan Inverted
    WHITE_INV: 15  // White Inverted
} as const;

/**
 * Color names for user-friendly input
 */
export type ColorName = keyof typeof X32_COLORS;

/**
 * Get color value from name
 * @param colorName - Color name (case-insensitive)
 * @returns Color integer value (0-15) or null if invalid
 */
export function getColorValue(colorName: string): number | null {
    const upperName = colorName.toUpperCase().replace(/[\s-]/g, '_');

    // Check direct match
    if (upperName in X32_COLORS) {
        return X32_COLORS[upperName as ColorName];
    }

    // Check without _INV suffix for inverted colors
    const invName = `${upperName}_INV`;
    if (invName in X32_COLORS) {
        return X32_COLORS[invName as ColorName];
    }

    // Try parsing as number
    const num = parseInt(colorName, 10);
    if (!isNaN(num) && num >= 0 && num <= 15) {
        return num;
    }

    return null;
}

/**
 * Get color name from value
 * @param value - Color integer value (0-15)
 * @returns Color name or null if invalid
 */
export function getColorName(value: number): string | null {
    for (const [name, val] of Object.entries(X32_COLORS)) {
        if (val === value) {
            return name.toLowerCase().replace(/_/g, '-');
        }
    }
    return null;
}

/**
 * Get list of available color names
 * @returns Array of color names
 */
export function getAvailableColors(): string[] {
    return Object.keys(X32_COLORS).map(name =>
        name.toLowerCase().replace(/_/g, '-')
    );
}

/**
 * Format color for display
 * @param value - Color integer value
 * @returns Formatted color string
 */
export function formatColor(value: number): string {
    const name = getColorName(value);
    return name || `Color ${value}`;
}