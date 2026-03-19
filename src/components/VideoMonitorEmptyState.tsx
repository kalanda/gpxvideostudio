import { Button } from "@heroui/react";
import { MapPin, Route } from "lucide-react";
import type { FC } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useGpxLoader } from "@/hooks/useGpxLoader";

export const VideoMonitorEmptyState: FC = () => {
  const { t } = useTranslation();
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const { loadFromFile, loadSample } = useGpxLoader();

  return (
    <div className="absolute inset-0 z-10 w-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-5 px-6 py-4 rounded-medium text-center bg-black/70">
        <input
          ref={gpxInputRef}
          type="file"
          accept=".gpx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void loadFromFile(file);
          }}
          className="hidden"
          aria-hidden
        />

        <div className="flex flex-col items-center gap-2">
          <Route size={28} className="text-primary-400" />
          <p className="text-base font-medium text-white">
            {t("emptyState.headline")}
          </p>
          <p className="text-sm text-white/40">{t("emptyState.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-primary-300">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[9px] font-bold text-primary-900">
              1
            </span>
            {t("emptyState.step1")}
          </div>
          <div className="h-px w-5 bg-white/15" />
          <div className="flex items-center gap-1.5 text-white/35">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/40">
              2
            </span>
            {t("emptyState.step2")}
          </div>
          <div className="h-px w-5 bg-white/15" />
          <div className="flex items-center gap-1.5 text-white/35">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/40">
              3
            </span>
            {t("emptyState.step3")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            color="primary"
            size="sm"
            startContent={<MapPin size={15} />}
            onPress={() => gpxInputRef.current?.click()}
          >
            {t("emptyState.loadGpx")}
          </Button>
          <Button
            variant="light"
            size="sm"
            className="text-white/40 data-[hover=true]:bg-white/5 data-[hover=true]:text-white/70"
            onPress={loadSample}
          >
            {t("emptyState.trySample")}
          </Button>
        </div>
      </div>
    </div>
  );
};
