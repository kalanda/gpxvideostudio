/** Map base layer theme (MiniMap). */
export enum MapTheme {
  None = "none",
  Light = "light",
  Dark = "dark",
  Colored = "colored",
}

/** MiniMap: north-up vs rotate with route direction. */
export enum MapBearingMode {
  Fixed = "fixed",
  Dynamic = "dynamic",
}

/** MiniMap: show full route in frame vs follow current point. */
export enum MapViewportMode {
  FullRoute = "full-route",
  FollowPoint = "follow-point",
}

/** MiniMap: camera tilt in degrees. */
export enum MapPitch {
  TopDown = "top-down",
  Tilted = "tilted",
}
