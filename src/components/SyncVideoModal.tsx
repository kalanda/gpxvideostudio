import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Slider,
  Tab,
  Tabs,
  Tooltip,
} from "@heroui/react";
import bbox from "@turf/bbox";
import { ChevronLeft, ChevronRight, Link2, Pause, Play } from "lucide-react";
import type { MapMouseEvent } from "maplibre-gl";
import { type FC, useEffect, useRef, useState } from "react";
import { Layer, Map as MaplibreMap, Source } from "react-map-gl/maplibre";
import { MAP_THEMES_BASEMAP_URLS } from "@/constants/defaults";
import { useBackgroundVideoStore } from "@/stores/backgroundVideoStore";
import { useProjectVideoSettingsStore } from "@/stores/projectVideoSettingsStore";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { MapTheme } from "@/types/map";
import { formatPlaybackTime } from "@/utils/format/formatPlaybackTime";
import { interpolateAtTime } from "@/utils/interpolation/interpolateAtTime";
import "maplibre-gl/dist/maplibre-gl.css";

const SATELLITE_STYLE = {
  version: 8 as const,
  sources: {
    "esri-satellite": {
      type: "raster" as const,
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles &copy; Esri",
    },
  },
  layers: [
    {
      id: "esri-satellite",
      type: "raster" as const,
      source: "esri-satellite",
    },
  ],
};

export type SyncVideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const SyncVideoModal: FC<SyncVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    backgroundVideoUrl,
    videoTrimStartSeconds,
    flipHorizontal,
    flipVertical,
  } = useBackgroundVideoStore();
  const { fps } = useProjectVideoSettingsStore();
  const { telemetryPoints, setGpxTrimStartSeconds } = useTelemetryStore();

  // --- video state ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);

  // --- telemetry / map state ---
  const totalElapsed =
    telemetryPoints && telemetryPoints.features.length > 0
      ? (telemetryPoints.features[telemetryPoints.features.length - 1]
          ?.properties.elapsed ?? 0)
      : 0;
  const [selectedElapsed, setSelectedElapsed] = useState(0);
  const [mapStyle, setMapStyle] = useState<"map" | "satellite">("map");

  // Reset slider when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedElapsed(0);
      setVideoCurrentTime(0);
      setVideoIsPlaying(false);
    }
  }, [isOpen]);

  // --- video element handlers ---
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setVideoCurrentTime(v.currentTime);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setVideoDuration(v.duration);
  };

  const handleVideoEnded = () => setVideoIsPlaying(false);
  const handleVideoPlay = () => setVideoIsPlaying(true);
  const handleVideoPause = () => setVideoIsPlaying(false);

  const toggleVideoPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  };

  const handleVideoSeek = (value: number | number[]) => {
    const v = videoRef.current;
    if (!v) return;
    const t = typeof value === "number" ? value : (value[0] ?? 0);
    v.currentTime = t;
    setVideoCurrentTime(t);
  };

  const stepFrame = (direction: 1 | -1) => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = Math.max(
      0,
      Math.min(v.duration, v.currentTime + direction / fps),
    );
  };

  // --- map click: jump to nearest telemetry point ---
  const handleMapClick = (e: MapMouseEvent) => {
    if (!telemetryPoints || telemetryPoints.features.length === 0) return;
    const { lng, lat } = e.lngLat;
    let nearestElapsed = 0;
    let minDistSq = Infinity;
    for (const feature of telemetryPoints.features) {
      const [fLon, fLat] = feature.geometry.coordinates;
      const dLon = fLon - lng;
      const dLat = fLat - lat;
      const distSq = dLon * dLon + dLat * dLat;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearestElapsed = feature.properties.elapsed;
      }
    }
    setSelectedElapsed(nearestElapsed);
  };

  // --- interpolated telemetry point for map ---
  const currentTelemetryPoint =
    telemetryPoints && telemetryPoints.features.length > 0
      ? interpolateAtTime(telemetryPoints, selectedElapsed, 0, totalElapsed)
      : null;

  // --- GeoJSON for map layers ---
  const routeGeoJson = telemetryPoints
    ? {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: telemetryPoints.features.map(
            (f) => f.geometry.coordinates,
          ),
        },
        properties: {},
      }
    : null;

  const currentPointGeoJson = currentTelemetryPoint
    ? {
        type: "Feature" as const,
        geometry: currentTelemetryPoint.geometry,
        properties: {},
      }
    : null;

  // --- map initial bounds ---
  const initialBounds =
    telemetryPoints && telemetryPoints.features.length >= 2
      ? bbox(telemetryPoints)
      : null;

  // --- map style URL ---
  const mapStyleUrl =
    mapStyle === "satellite"
      ? SATELLITE_STYLE
      : (MAP_THEMES_BASEMAP_URLS[MapTheme.Light] ?? "");

  // --- sync action ---
  const handleSync = () => {
    if (!currentTelemetryPoint) return;
    const videoPositionSeconds = videoCurrentTime;
    const telemetryElapsed = currentTelemetryPoint.properties.elapsed;
    const newGpxTrimStart =
      telemetryElapsed - videoPositionSeconds + videoTrimStartSeconds;
    setGpxTrimStartSeconds(Math.max(0, newGpxTrimStart));
    onClose();
  };

  const currentTelemetryTime = currentTelemetryPoint?.properties.time;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="normal">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Link2 size={20} />
            Sync video with telemetry
          </div>
          <p className="text-sm text-foreground/70">
            Align the video and GPX track to synchronize them. Navigate to a
            recognisable moment in both, then press Sync.
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 divide-x divide-divider">
            {/* ── Left: video panel ── */}
            <div className="flex flex-col gap-3 p-4">
              <p className="text-sm font-medium text-foreground/70">Video</p>
              <div className="relative flex-1 bg-black rounded-medium overflow-hidden flex items-center justify-center">
                {backgroundVideoUrl ? (
                  <video
                    ref={videoRef}
                    src={backgroundVideoUrl}
                    className="max-h-full max-w-full object-contain"
                    style={{
                      transform: [
                        flipHorizontal ? "scaleX(-1)" : "",
                        flipVertical ? "scaleY(-1)" : "",
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined,
                    }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnded}
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onClick={toggleVideoPlay}
                    playsInline
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  <p className="text-foreground/40 text-sm">No video loaded</p>
                )}
              </div>

              {/* Video controls */}
              <div className="flex flex-col gap-2">
                <Slider
                  size="sm"
                  step={1 / fps}
                  minValue={0}
                  maxValue={Math.max(1, videoDuration)}
                  value={videoCurrentTime}
                  onChange={handleVideoSeek}
                  aria-label="Video position"
                  isDisabled={!backgroundVideoUrl}
                />

                <div className="flex items-center gap-2">
                  <Tooltip content="Previous frame">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onPress={() => stepFrame(-1)}
                      isDisabled={!backgroundVideoUrl}
                      aria-label="Previous frame"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                  </Tooltip>

                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={toggleVideoPlay}
                    isDisabled={!backgroundVideoUrl}
                    aria-label={videoIsPlaying ? "Pause" : "Play"}
                  >
                    {videoIsPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </Button>

                  <Tooltip content="Next frame">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onPress={() => stepFrame(1)}
                      isDisabled={!backgroundVideoUrl}
                      aria-label="Next frame"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </Tooltip>

                  <span className="font-mono text-xs text-foreground/70 tabular-nums">
                    {formatPlaybackTime(videoCurrentTime)}
                    {" / "}
                    {formatPlaybackTime(videoDuration)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right: map panel ── */}
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground/70">
                  GPX track
                </p>
                <Tabs
                  size="sm"
                  selectedKey={mapStyle}
                  onSelectionChange={(k) =>
                    setMapStyle(k as "map" | "satellite")
                  }
                  aria-label="Map style"
                >
                  <Tab key="map" title="Map" />
                  <Tab key="satellite" title="Satellite" />
                </Tabs>
              </div>

              <div
                className="relative flex-1 rounded-medium overflow-hidden"
                style={{
                  minHeight: "300px",
                  cursor: telemetryPoints ? "crosshair" : "default",
                }}
              >
                {telemetryPoints && initialBounds ? (
                  <MaplibreMap
                    mapStyle={mapStyleUrl}
                    initialViewState={{
                      bounds: [
                        initialBounds[0],
                        initialBounds[1],
                        initialBounds[2],
                        initialBounds[3],
                      ],
                      fitBoundsOptions: { padding: 40 },
                    }}
                    style={{ width: "100%", height: "100%" }}
                    attributionControl={false}
                    onClick={handleMapClick}
                  >
                    {/* Full route line */}
                    {routeGeoJson && (
                      <Source id="route" type="geojson" data={routeGeoJson}>
                        <Layer
                          id="route-line"
                          type="line"
                          paint={{
                            "line-color": "#6366f1",
                            "line-width": 3,
                            "line-opacity": 0.7,
                          }}
                          layout={{ "line-cap": "round", "line-join": "round" }}
                        />
                      </Source>
                    )}

                    {/* Current selected point */}
                    {currentPointGeoJson && (
                      <Source
                        id="current-point"
                        type="geojson"
                        data={currentPointGeoJson}
                      >
                        <Layer
                          id="current-point-halo"
                          type="circle"
                          paint={{
                            "circle-radius": 10,
                            "circle-color": "#6366f1",
                            "circle-opacity": 0.3,
                          }}
                        />
                        <Layer
                          id="current-point-dot"
                          type="circle"
                          paint={{
                            "circle-radius": 6,
                            "circle-color": "#6366f1",
                            "circle-stroke-color": "#ffffff",
                            "circle-stroke-width": 2,
                          }}
                        />
                      </Source>
                    )}
                  </MaplibreMap>
                ) : (
                  <div className="flex h-full items-center justify-center bg-default-100 rounded-medium">
                    <p className="text-foreground/40 text-sm">
                      No GPX track loaded
                    </p>
                  </div>
                )}
              </div>

              {/* Telemetry position slider */}
              <div className="flex flex-col gap-1">
                <Slider
                  size="sm"
                  label="Track position"
                  step={0.1}
                  minValue={0}
                  maxValue={Math.max(1, totalElapsed)}
                  value={selectedElapsed}
                  onChange={(v) =>
                    setSelectedElapsed(typeof v === "number" ? v : (v[0] ?? 0))
                  }
                  getValue={(v) =>
                    formatPlaybackTime(
                      typeof v === "number" ? v : ((v as number[])[0] ?? 0),
                    )
                  }
                  isDisabled={!telemetryPoints}
                  aria-label="Telemetry position"
                  classNames={{
                    value: "text-xs text-foreground/70 font-mono tabular-nums",
                    label: "text-xs text-foreground/70",
                  }}
                />

                {currentTelemetryTime && (
                  <p className="text-xs text-foreground/50 font-mono tabular-nums">
                    GPS time:{" "}
                    {currentTelemetryTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSync}
            isDisabled={!backgroundVideoUrl || !telemetryPoints}
          >
            Sync these points
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
