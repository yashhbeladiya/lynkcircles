import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import ConnectionRequest from "../components/ConnectionRequest";
import UserCard from "../components/UserCard";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const Network = () => {
  const { data: user } = useQuery({ queryKey: ["authUser"] });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => await axiosInstance.get("/connections/requests"),
    enabled: !!user,
  });

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => await axiosInstance.get("/connections"),
  });

  console.log("connections", connections?.data);

  return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-1">
          <Sidebar user={user} />
        </div>

        <div className="col-span-1 lg:col-span-3">
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                My Network
              </Typography>
              {connectionRequests?.data?.length > 0 ? (
                <Box mb={4}>
                  <Typography variant="h5" gutterBottom>
                    Connection requests
                  </Typography>
                  {connectionRequests?.data.map((request: any) => (
                    <ConnectionRequest key={request.id} request={request} />
                  ))}
                </Box>
              ) : (
                <Card variant="outlined" sx={{ textAlign: "center", p: 4, border: '1px solid #333366', }}>
                  <Avatar sx={{ bgcolor: "secondary.main", mx: "auto", mb: 2 }}>
                    <PersonAddIcon />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    No connection requests
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    You don't have any pending connection requests.
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mt={2}>
                    Explore the community and connect with other users.
                  </Typography>
                </Card>
              )}
              {connections?.data?.length > 0 && (
                <Box mt={4}>
                  <Typography variant="h5" gutterBottom>
                    My Connections
                  </Typography>
                  <Grid container spacing={2}>
                    {connections?.data.map((connection: any) => (
                      <Grid size={{xs:12, md:6, lg:4}} key={connection._id}>
                        <UserCard user={connection} isConnection={true} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default Network;
