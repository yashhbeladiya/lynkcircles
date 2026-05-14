import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { CameraOff, Plus } from "lucide-react";

import { EmptyState } from "@/components/ui";
import {
  useDeletePortfolio,
  useUserPortfolio,
  useWorkDetails,
} from "@/hooks/useWorkDetails";
import { PortfolioCard } from "./PortfolioCard";
import { CreatePortfolioDialog } from "./CreatePortfolioDialog";
import { PortfolioDetailDialog } from "./PortfolioDetailDialog";
import type { JobPortfolio } from "@/types/workDetail";

interface Props {
  username: string;
  isOwn: boolean;
}

/**
 * Gallery of every job this Worker has completed. Click any tile to
 * open a detail view with full description, every photo, and the
 * client reviews (with proof images). Owner can add new entries
 * inline; reviews are added from the detail view to keep the section
 * header uncluttered.
 */
export const PortfolioSection = ({ username, isOwn }: Props) => {
  const { data: portfolio, isLoading } = useUserPortfolio(username);
  // Need services to populate the "service" dropdown in the create
  // dialog. Same query is already cached by ServicesSection — react-
  // query dedupes, so this is cheap.
  const { data: services } = useWorkDetails(username);
  const deletePortfolio = useDeletePortfolio(username);
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<JobPortfolio | null>(null);

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
          px: 0.5,
        }}
      >
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          Portfolio · completed work
        </Typography>
        {isOwn && services && services.length > 0 ? (
          <Button
            size="small"
            startIcon={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            Add job
          </Button>
        ) : null}
      </Box>

      {isLoading ? (
        <GallerySkeleton />
      ) : !portfolio || portfolio.length === 0 ? (
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
            icon={CameraOff}
            title={isOwn ? "Show off your work" : "No completed work to show"}
            description={
              isOwn
                ? "Add a finished job — photos of the result, a quick description, and the client. Reviews from your clients show up below each entry and build long-term trust."
                : "When this Worker logs completed work, photos and client reviews will appear here."
            }
            action={
              isOwn && services && services.length > 0
                ? { label: "Add your first job", onClick: () => setCreateOpen(true) }
                : undefined
            }
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {portfolio.map((entry) => (
            <PortfolioCard
              key={entry._id}
              entry={entry}
              canManage={isOwn}
              onOpen={() => setDetail(entry)}
              onDelete={() => deletePortfolio.mutate(entry._id)}
            />
          ))}
        </Box>
      )}

      {isOwn && services ? (
        <CreatePortfolioDialog
          username={username}
          services={services}
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      ) : null}
      <PortfolioDetailDialog
        username={username}
        entry={detail}
        isOwn={isOwn}
        open={!!detail}
        onClose={() => setDetail(null)}
      />
    </Box>
  );
};

const GallerySkeleton = () => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "repeat(2, minmax(0, 1fr))",
        sm: "repeat(3, minmax(0, 1fr))",
      },
      gap: 1.5,
    }}
  >
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={(theme) => ({
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
          overflow: "hidden",
        })}
      >
        <Skeleton variant="rectangular" width="100%" sx={{ paddingTop: "62%" }} />
        <Box sx={{ p: 1.75 }}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
        </Box>
      </Box>
    ))}
  </Box>
);
