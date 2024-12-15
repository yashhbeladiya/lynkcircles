import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Avatar,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledButton = styled(Button)({
  backgroundColor: "#333366",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#2a2a5a",
  },
});

function UserCard({ user, isConnection }: { user: any; isConnection: boolean }) {
  return (
    <Card sx={{ maxWidth: 345, textAlign: "center", transition: "all 0.3s", "&:hover": { boxShadow: 6 }, border: '1px solid #333366', }}>
      <Link to={`/profile/${user.username}`} style={{ textDecoration: "none", color: "inherit" }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={user.profilePicture || "/avatar.png"}
              alt={user.name}
              sx={{ width: 96, height: 96, mb: 2 }}
            />
            <Typography variant="h6" component="div">
              {user.firstName} {user.lastName}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            {user.headline}
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            {user.connections?.length} connections
          </Typography>
        </CardContent>
      </Link>
      <CardContent>
        <StyledButton fullWidth>
          {isConnection ? "Connected" : "Connect"}
        </StyledButton>
      </CardContent>
    </Card>
  );
}

export default UserCard;