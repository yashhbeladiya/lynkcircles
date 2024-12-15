//@ts-nocheck

import React from "react";
import { Link } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { Avatar, Badge, Box, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Home, UserPlus, Bell } from "lucide-react";

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        // animation: 'ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }));

const Sidebar = ({ user }) => {
  return (
    <Box sx={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: 3, color: '#333366' }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Box
          sx={{
            height: '64px',
            borderRadius: '8px 8px 0 0',
            backgroundImage: `url("${user.bannerImage || "/banner.png"}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Link to={`/profile/${user.username}`}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar
              src={user.profilePicture || "/avatar.png"}
              alt={user.name}
              sx={{ width: 80, height: 80, mt: -4, border: '2px solid white' }}
            />
          </StyledBadge>
          <Typography variant="h6" sx={{ mt: 2, color: '#333366' }}>
            {user.firstName} {user.lastName}
          </Typography>
        </Link>
        <Typography variant="body2" color="textSecondary">
          {user.headline}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user.connections.length} connections
        </Typography>
      </Box>
      <Box sx={{ borderTop: '1px solid #ddd', p: 2 }}>
        <List>
          <ListItem component={Link} to="/" sx={{ color: '#333366', '&:hover': { backgroundColor: '#f0f0f0' } }}>
            <ListItemIcon>
              <Home size={20} style={{ color: '#333366' }} />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem component={Link} to="/network" sx={{ color: '#333366', '&:hover': { backgroundColor: '#f0f0f0' } }}>
            <ListItemIcon>
              <UserPlus size={20} style={{ color: '#333366' }} />
            </ListItemIcon>
            <ListItemText primary="My Network" />
          </ListItem>
          <ListItem component={Link} to="/notifications" sx={{ color: '#333366', '&:hover': { backgroundColor: '#f0f0f0' } }}>
            <ListItemIcon>
              <Bell size={20} style={{ color: '#333366' }} />
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItem>
        </List>
      </Box>
      <Box sx={{ borderTop: '1px solid #ddd', p: 2 }}>
        <Link to={`/profile/${user.username}`} style={{ color: '#333366', textDecoration: 'none' }}>
          <Typography variant="body2" fontWeight="bold">
            Visit your profile
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default Sidebar;