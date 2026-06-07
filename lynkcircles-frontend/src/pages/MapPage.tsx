import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Briefcase, Crosshair, Layers, ShieldCheck, Users } from "lucide-react";

import { useAuthUser } from "@/hooks/useAuthUser";
import { useMapData, type JobPin, type WorkerPin } from "@/hooks/useDiscovery";
import { SERVICE_CATALOG } from "@/data/serviceCatalog";
import { getCurrentPosition } from "@/lib/geo";

type LayerMode = "all" | "workers" | "jobs";

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

const workerIcon = (pin: WorkerPin): L.DivIcon => {
  const initials = `${pin.firstName[0] ?? ""}${pin.lastName[0] ?? ""}`.toUpperCase();
  const photo = pin.profilePicture
    ? `<img src="${pin.profilePicture}" alt="" />`
    : `<span>${initials}</span>`;
  const badge = pin.verified
    ? `<span class="lc-badge" aria-hidden="true"></span>`
    : "";
  return L.divIcon({
    html: `<div class="lc-pin lc-pin-worker">${photo}${badge}</div>`,
    className: "lc-pin-wrap",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
};

const jobIcon = (): L.DivIcon =>
  L.divIcon({
    html: `<div class="lc-pin lc-pin-job"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg></div>`,
    className: "lc-pin-wrap",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

const Recenter = ({ to }: { to: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (to) map.flyTo(to, 12, { duration: 0.8 });
  }, [to, map]);
  return null;
};

const MapPage = () => {
  const { data: authUser } = useAuthUser();
  const { data, isLoading } = useMapData();
  const [layer, setLayer] = useState<LayerMode>("all");
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);
  const [recenter, setRecenter] = useState<[number, number] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const userCenter = useMemo<[number, number] | null>(() => {
    if (authUser?.locationCoordinates?.lat && authUser?.locationCoordinates?.long) {
      return [authUser.locationCoordinates.lat, authUser.locationCoordinates.long];
    }
    return null;
  }, [authUser]);

  const initialCenter = userCenter ?? DEFAULT_CENTER;
  const initialZoom = userCenter ? 11 : DEFAULT_ZOOM;

  const workers = useMemo(() => {
    if (!data || layer === "jobs") return [];
    return serviceFilter
      ? data.workers.filter((w) =>
          w.headline?.toLowerCase().includes(serviceFilter.toLowerCase()),
        )
      : data.workers;
  }, [data, layer, serviceFilter]);

  const jobs = useMemo(() => {
    if (!data || layer === "workers") return [];
    return serviceFilter
      ? data.jobs.filter((j) => j.serviceKeys.includes(serviceFilter))
      : data.jobs;
  }, [data, layer, serviceFilter]);

  const handleLocate = async () => {
    const pos = await getCurrentPosition();
    if (pos) setRecenter([pos.lat, pos.lng]);
    else if (userCenter) setRecenter(userCenter);
  };

  return (
    <Box sx={{ position: "relative", height: { xs: "calc(100vh - 120px)", md: "calc(100vh - 60px)" } }}>
      <style>{`
        .lc-pin-wrap { background: transparent; border: none; }
        .lc-pin {
          width: 40px; height: 40px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px;
          color: #fff; box-shadow: 0 6px 16px rgba(67,56,202,0.35);
          border: 2px solid #fff; position: relative;
        }
        .lc-pin-worker { background: linear-gradient(135deg, #4338ca, #6366f1); overflow: hidden; }
        .lc-pin-worker img { width: 100%; height: 100%; object-fit: cover; border-radius: 999px; }
        .lc-pin-worker span { font-family: 'Inter Variable', sans-serif; }
        .lc-pin-job { background: linear-gradient(135deg, #059669, #10b981); }
        .lc-pin .lc-badge {
          position: absolute; bottom: -2px; right: -2px;
          width: 14px; height: 14px; border-radius: 999px;
          background: #10b981; border: 2px solid #fff;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0; overflow: hidden;
          box-shadow: 0 12px 32px rgba(0,0,0,0.18);
        }
        .leaflet-popup-content { margin: 0; }
        .leaflet-popup-tip { box-shadow: 0 6px 14px rgba(0,0,0,0.1); }
      `}</style>

      <Box
        ref={containerRef}
        sx={{
          position: "absolute",
          inset: 0,
          ".leaflet-container": {
            height: "100%",
            width: "100%",
            backgroundColor: (t) =>
              t.palette.mode === "dark" ? "#18181b" : "#e4e4e7",
          },
        }}
      >
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {workers.map((w) => (
            <Marker key={`w-${w.id}`} position={[w.lat, w.lng]} icon={workerIcon(w)}>
              <Popup>
                <WorkerPopup pin={w} />
              </Popup>
            </Marker>
          ))}
          {jobs.map((j) => (
            <Marker key={`j-${j.id}`} position={[j.lat, j.lng]} icon={jobIcon()}>
              <Popup>
                <JobPopup pin={j} />
              </Popup>
            </Marker>
          ))}
          <Recenter to={recenter} />
        </MapContainer>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 500,
          pointerEvents: "none",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            pointerEvents: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            p: 0.5,
            borderRadius: 999,
            backgroundColor: (t) =>
              t.palette.mode === "dark" ? "rgba(24,24,27,0.92)" : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            border: 1,
            borderColor: "divider",
            boxShadow: 2,
          }}
        >
          <LayerToggle
            active={layer === "all"}
            onClick={() => setLayer("all")}
            icon={<Layers size={14} />}
            label="All"
            count={(data?.workers.length ?? 0) + (data?.jobs.length ?? 0)}
          />
          <LayerToggle
            active={layer === "workers"}
            onClick={() => setLayer("workers")}
            icon={<Users size={14} />}
            label="Workers"
            count={data?.workers.length ?? 0}
          />
          <LayerToggle
            active={layer === "jobs"}
            onClick={() => setLayer("jobs")}
            icon={<Briefcase size={14} />}
            label="Jobs"
            count={data?.jobs.length ?? 0}
          />
        </Box>

        <Box sx={{ pointerEvents: "auto" }}>
          <IconButton
            onClick={handleLocate}
            aria-label="Recenter on me"
            sx={{
              backgroundColor: (t) =>
                t.palette.mode === "dark" ? "rgba(24,24,27,0.92)" : "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              border: 1,
              borderColor: "divider",
              boxShadow: 2,
              "&:hover": { backgroundColor: "background.paper" },
            }}
          >
            <Crosshair size={16} />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 500,
          pointerEvents: "none",
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 0.5,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Chip
          label="All services"
          onClick={() => setServiceFilter(null)}
          color={serviceFilter === null ? "primary" : "default"}
          variant={serviceFilter === null ? "filled" : "outlined"}
          sx={{
            pointerEvents: "auto",
            backgroundColor: serviceFilter === null
              ? undefined
              : (t) => (t.palette.mode === "dark" ? "rgba(24,24,27,0.92)" : "rgba(255,255,255,0.95)"),
            backdropFilter: "blur(10px)",
            fontWeight: 600,
            flexShrink: 0,
          }}
        />
        {SERVICE_CATALOG.flatMap((c) => c.services).map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            onClick={() => setServiceFilter(s.key === serviceFilter ? null : s.key)}
            color={serviceFilter === s.key ? "primary" : "default"}
            variant={serviceFilter === s.key ? "filled" : "outlined"}
            sx={{
              pointerEvents: "auto",
              backgroundColor: serviceFilter === s.key
                ? undefined
                : (t) => (t.palette.mode === "dark" ? "rgba(24,24,27,0.92)" : "rgba(255,255,255,0.95)"),
              backdropFilter: "blur(10px)",
              fontWeight: 500,
              flexShrink: 0,
            }}
          />
        ))}
      </Box>

      {isLoading ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.4)",
            zIndex: 600,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      ) : null}
    </Box>
  );
};

const LayerToggle = ({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.625,
      px: 1.25,
      py: 0.625,
      borderRadius: 999,
      border: "none",
      cursor: "pointer",
      backgroundColor: active ? "primary.main" : "transparent",
      color: active ? "primary.contrastText" : "text.primary",
      fontWeight: 600,
      fontSize: "0.8125rem",
      transition: "all 120ms ease",
      "&:hover": {
        backgroundColor: active ? "primary.dark" : "action.hover",
      },
    }}
  >
    {icon}
    <span>{label}</span>
    <Box
      component="span"
      sx={{
        fontSize: "0.6875rem",
        fontVariantNumeric: "tabular-nums",
        opacity: 0.75,
      }}
    >
      {count}
    </Box>
  </Box>
);

const WorkerPopup = ({ pin }: { pin: WorkerPin }) => (
  <Box sx={{ p: 1.75, minWidth: 200 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: pin.profilePicture
            ? `url(${pin.profilePicture}) center/cover`
            : "linear-gradient(135deg, #4338ca, #6366f1)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {!pin.profilePicture ? `${pin.firstName[0]}${pin.lastName[0]}` : null}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {pin.firstName} {pin.lastName}
          </Typography>
          {pin.verified ? (
            <ShieldCheck size={12} color="#10b981" aria-label="Verified" />
          ) : null}
        </Box>
        {pin.city ? (
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            {pin.city}
          </Typography>
        ) : null}
      </Box>
    </Box>
    {pin.headline ? (
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 0.75,
          color: "text.secondary",
          fontSize: "0.75rem",
          lineHeight: 1.4,
        }}
      >
        {pin.headline}
      </Typography>
    ) : null}
    <Button
      component={RouterLink}
      to={`/profile/${pin.username}`}
      fullWidth
      variant="contained"
      size="small"
      sx={{ mt: 1.25, fontWeight: 600 }}
    >
      View profile
    </Button>
  </Box>
);

const JobPopup = ({ pin }: { pin: JobPin }) => (
  <Box sx={{ p: 1.75, minWidth: 220, maxWidth: 280 }}>
    <Box
      sx={{
        display: "inline-block",
        px: 0.875,
        py: 0.25,
        borderRadius: 999,
        backgroundColor: "rgba(16,185,129,0.12)",
        color: "#059669",
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {pin.jobType}
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.75, lineHeight: 1.3 }}>
      {pin.jobTitle}
    </Typography>
    {pin.serviceLabels?.length ? (
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
        {pin.serviceLabels.slice(0, 2).join(" · ")}
      </Typography>
    ) : null}
    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.75, gap: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {pin.budget}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.tertiary" }}>
        {pin.location.split(",")[0]}
      </Typography>
    </Box>
    <Button
      component={RouterLink}
      to={`/works/${pin.id}`}
      fullWidth
      variant="contained"
      size="small"
      sx={{ mt: 1.25, fontWeight: 600 }}
    >
      View job
    </Button>
  </Box>
);

export default MapPage;
