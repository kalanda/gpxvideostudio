export const SPEED_SMOOTHING_FACTOR = 2;

/** Half-window (metres) for the moving-average elevation pre-smoother used before computing slope. */
export const ELEVATION_SMOOTH_HALF_M = 30;

/** Half-window (metres) for the centered-difference slope estimator applied to smoothed elevation. */
export const SLOPE_WINDOW_HALF_M = 60;

export const WIDTH_HEIGHT_MIN = 720;
export const WIDTH_HEIGHT_MAX = 4096;

export const FPS_MIN = 1;
export const FPS_MAX = 60;

/** Reference resolution for overlay layout (landscape); content is designed at this size and scaled to fit. */
export const OVERLAY_REFERENCE_WIDTH = 1920;
export const OVERLAY_REFERENCE_HEIGHT = 1080;

/** Number of decimals for SVG paths to optimize rendering */
export const SVG_PATH_PRECISION = 2;
