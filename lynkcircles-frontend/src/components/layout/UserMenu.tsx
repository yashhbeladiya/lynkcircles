import { useState, type MouseEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { User as UserIcon, Settings, LogOut } from "lucide-react";

import { UserAvatar } from "@/components/ui";
import { useAuthUser, useLogout } from "@/hooks/useAuthUser";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const UserMenu = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { data: user } = useAuthUser();
  const logout = useLogout();

  const open = Boolean(anchor);
  const handleOpen = (event: MouseEvent<HTMLElement>) =>
    setAnchor(event.currentTarget);
  const handleClose = () => setAnchor(null);

  const handleLogout = async () => {
    handleClose();
    await logout.mutateAsync();
    navigate("/signin", { replace: true });
  };

  if (!user) return null;

  return (
    <>
      <Tooltip title="Account">
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{ ml: 0.5, p: 0.25 }}
          aria-label="Open account menu"
        >
          <UserAvatar user={user} size="sm" verified={user.verified} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: { minWidth: 220, mt: 1, borderRadius: 1.5 },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{user.username}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          component={RouterLink}
          to={`/profile/${user.username}`}
          onClick={handleClose}
        >
          <ListItemIcon>
            <UserIcon size={16} />
          </ListItemIcon>
          <ListItemText primary="Your profile" />
        </MenuItem>
        <MenuItem component={RouterLink} to="/settings" onClick={handleClose}>
          <ListItemIcon>
            <Settings size={16} />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Box sx={{ px: 2, py: 1 }}>
          <LanguageSwitcher />
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} disabled={logout.isPending}>
          <ListItemIcon>
            <LogOut size={16} />
          </ListItemIcon>
          <ListItemText primary={logout.isPending ? "Signing out…" : "Sign out"} />
        </MenuItem>
      </Menu>
    </>
  );
};
