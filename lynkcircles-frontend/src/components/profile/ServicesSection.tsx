import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { Plus, Wrench } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { useWorkDetails, useDeleteWorkDetail } from "@/hooks/useWorkDetails";
import { ServiceCard } from "./ServiceCard";
import { CreateServiceDialog } from "./CreateServiceDialog";

interface Props {
  username: string;
  isOwn: boolean;
}

export const ServicesSection = ({ username, isOwn }: Props) => {
  const { data: services, isLoading } = useWorkDetails(username);
  const deleteService = useDeleteWorkDetail(username);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1.25,
          mb: 1.75,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
          Services offered
        </Typography>
        {isOwn ? (
          <Button
            size="small"
            startIcon={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            Add service
          </Button>
        ) : null}
      </Box>

      {isLoading ? (
        <ServicesSkeleton />
      ) : !services || services.length === 0 ? (
        <Box
          sx={(theme) => ({
            p: 4,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <EmptyState
            icon={Wrench}
            title={isOwn ? "Add your first service" : "No services listed yet"}
            description={
              isOwn
                ? "Tell clients what you do. The more specific, the easier you are to find."
                : "When this Worker lists a service, you'll be able to hire them from here."
            }
            action={
              isOwn
                ? { label: "Add service", onClick: () => setCreateOpen(true) }
                : undefined
            }
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              canManage={isOwn}
              onDelete={(id) => deleteService.mutate(id)}
            />
          ))}
        </Box>
      )}

      {isOwn ? (
        <CreateServiceDialog
          username={username}
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      ) : null}
    </Box>
  );
};

const ServicesSkeleton = () => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
      gap: 1.5,
    }}
  >
    {[0, 1].map((i) => (
      <Box
        key={i}
        sx={(theme) => ({
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Skeleton width="55%" height={20} />
        <Skeleton width="35%" height={14} sx={{ mt: 0.5 }} />
        <Skeleton width="100%" height={14} sx={{ mt: 1.5 }} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="30%" height={18} sx={{ mt: 1 }} />
      </Box>
    ))}
  </Box>
);
