import { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { Camera, MapPin, X } from "lucide-react";
import toast from "react-hot-toast";

import { UserAvatar } from "@/components/ui";
import { useUpdateProfile } from "@/hooks/useProfile";
import { getCurrentPosition } from "@/lib/geo";
import type { UserProfile } from "@/types/user";

interface Props {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
}

const readAsDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => (typeof r.result === "string" ? resolve(r.result) : reject(new Error("read failed")));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

/**
 * Profile editor modal. Sends only the fields the user actually changed
 * — empty strings/unmodified fields are omitted so the server's allow-
 * list update logic doesn't unintentionally clear them. Image fields
 * are sent as base64 data URIs (matches the existing backend contract
 * which forwards them to Cloudinary).
 */
type Coords = { lat: number; lng: number } | null;

const initialCoords = (user: UserProfile): Coords => {
  if (user.locationPoint?.coordinates?.length === 2) {
    const [lng, lat] = user.locationPoint.coordinates;
    if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
  }
  const legacy = user.locationCoordinates;
  if (
    legacy &&
    typeof legacy.lat === "number" &&
    typeof legacy.long === "number"
  ) {
    return { lat: legacy.lat, lng: legacy.long };
  }
  return null;
};

export const EditProfileDialog = ({ user, open, onClose }: Props) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [headline, setHeadline] = useState(user.headline ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [city, setCity] = useState(user.location?.city ?? "");
  const [state, setState] = useState(user.location?.state ?? "");
  const [coords, setCoords] = useState<Coords>(initialCoords(user));
  const [locating, setLocating] = useState(false);
  const [profileDataUri, setProfileDataUri] = useState<string | null>(null);
  const [bannerDataUri, setBannerDataUri] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const update = useUpdateProfile();

  // Reset state when the dialog reopens — avoids carrying stale draft
  // values from a prior open.
  useEffect(() => {
    if (!open) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setHeadline(user.headline ?? "");
    setBio(user.bio ?? "");
    setCity(user.location?.city ?? "");
    setState(user.location?.state ?? "");
    setCoords(initialCoords(user));
    setProfileDataUri(null);
    setBannerDataUri(null);
  }, [open, user]);

  const captureLocation = async () => {
    setLocating(true);
    try {
      const next = await getCurrentPosition();
      if (!next) {
        toast.error("Couldn't get your location. Check browser permissions.");
        return;
      }
      setCoords(next);
      toast.success("Location captured");
    } finally {
      setLocating(false);
    }
  };

  const clearLocation = () => setCoords(null);

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const dataUri = await readAsDataUri(file);
    setter(dataUri);
  };

  const handleSubmit = async () => {
    const payload: Record<string, unknown> = {};
    if (firstName !== user.firstName) payload.firstName = firstName;
    if (lastName !== user.lastName) payload.lastName = lastName;
    if (headline !== (user.headline ?? "")) payload.headline = headline;
    if (bio !== (user.bio ?? "")) payload.bio = bio;
    if (city !== (user.location?.city ?? "") || state !== (user.location?.state ?? "")) {
      payload.location = { ...user.location, city, state };
    }
    if (profileDataUri) payload.profilePicture = profileDataUri;
    if (bannerDataUri) payload.bannerImage = bannerDataUri;

    const initial = initialCoords(user);
    const coordsChanged =
      (coords?.lat !== initial?.lat) || (coords?.lng !== initial?.lng);
    if (coordsChanged && coords) {
      payload.coordinates = coords;
    }

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }
    await update.mutateAsync(payload);
    onClose();
  };

  const previewBanner = bannerDataUri ?? user.bannerImage ?? undefined;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        Edit profile
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <X size={16} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Banner + avatar previews */}
        <Box
          sx={{
            position: "relative",
            height: 120,
            borderRadius: 1.5,
            overflow: "hidden",
            background: previewBanner
              ? `url(${previewBanner}) center/cover`
              : (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
          }}
        >
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => void handleFile(e, setBannerDataUri)}
          />
          <IconButton
            size="small"
            onClick={() => bannerInputRef.current?.click()}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.55)",
              color: "#fff",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
            }}
            aria-label="Change banner"
          >
            <Camera size={14} />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: -3, ml: 1.5 }}>
          <Box
            sx={{
              position: "relative",
              borderRadius: "50%",
              outline: "4px solid",
              outlineColor: "background.paper",
              boxShadow: 2,
              cursor: "pointer",
            }}
            onClick={() => profileInputRef.current?.click()}
          >
            {profileDataUri ? (
              <Box
                component="img"
                src={profileDataUri}
                alt=""
                sx={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <UserAvatar user={user} size="xl" />
            )}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.4)",
                color: "#fff",
                opacity: 0,
                transition: "opacity 120ms ease",
                "&:hover": { opacity: 1 },
              }}
            >
              <Camera size={18} />
            </Box>
          </Box>
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => void handleFile(e, setProfileDataUri)}
          />
          <Typography variant="caption" color="text.secondary">
            Click to change photo / banner
          </Typography>
        </Box>

        {/* Form */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
            mt: 3,
          }}
        >
          <TextField
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Carpenter · Brooklyn, NY"
            sx={{ gridColumn: { sm: "1 / -1" } }}
            fullWidth
          />
          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            fullWidth
          />
          <TextField
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            fullWidth
          />
          <TextField
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            multiline
            minRows={3}
            sx={{ gridColumn: { sm: "1 / -1" } }}
            fullWidth
          />

          {/* Geolocation. Captured once and stored on the profile so
              every "near me" feature on the platform can use it. We
              never auto-prompt — the user explicitly clicks. */}
          <Box
            sx={{
              gridColumn: { sm: "1 / -1" },
              p: 1.5,
              borderRadius: 1.5,
              border: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <MapPin size={14} aria-hidden />
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: "0.8125rem" }}
                >
                  Your location
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}
                >
                  {coords
                    ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                    : "Captures your coordinates so jobs and Workers near you sort by distance"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {coords ? (
                <Button size="small" onClick={clearLocation} color="inherit">
                  Clear
                </Button>
              ) : null}
              <Button
                size="small"
                variant={coords ? "outlined" : "contained"}
                onClick={captureLocation}
                disabled={locating}
                startIcon={
                  locating ? (
                    <CircularProgress size={12} color="inherit" />
                  ) : (
                    <MapPin size={13} />
                  )
                }
              >
                {coords ? "Update" : "Use my location"}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={update.isPending}
          startIcon={update.isPending ? <CircularProgress size={12} color="inherit" /> : null}
        >
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
