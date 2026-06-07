import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useInsights } from "@/hooks/useInsights";
import { useAuthUser } from "@/hooks/useAuthUser";

const StatCard = ({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: string | number;
  delta?: string;
  accent?: "primary" | "success" | "warning";
}) => (
  <Box
    sx={{
      p: 2.25,
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: "background.paper",
      position: "relative",
      overflow: "hidden",
      "&::before":
        accent === "primary"
          ? {
              content: '""',
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(99,102,241,0.06), transparent)",
              pointerEvents: "none",
            }
          : undefined,
    }}
  >
    <Typography
      variant="caption"
      sx={{
        display: "block",
        fontWeight: 700,
        fontSize: "0.6875rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "text.tertiary",
        position: "relative",
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 800,
        letterSpacing: "-0.02em",
        mt: 0.5,
        fontVariantNumeric: "tabular-nums",
        position: "relative",
        color:
          accent === "success"
            ? "success.main"
            : accent === "warning"
            ? "warning.main"
            : "text.primary",
      }}
    >
      {value}
    </Typography>
    {delta ? (
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 0.25,
          fontSize: "0.75rem",
          color: "text.tertiary",
          position: "relative",
        }}
      >
        {delta}
      </Typography>
    ) : null}
  </Box>
);

const Panel = ({
  title,
  subtitle,
  children,
  height = 240,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
}) => (
  <Box
    sx={{
      p: { xs: 2, sm: 2.5 },
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: "background.paper",
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>
      {title}
    </Typography>
    {subtitle ? (
      <Typography variant="caption" sx={{ display: "block", color: "text.tertiary", mt: 0.25 }}>
        {subtitle}
      </Typography>
    ) : null}
    <Box sx={{ mt: 2, height }}>{children}</Box>
  </Box>
);

const formatDateLabel = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const STATUS_COLORS: Record<string, string> = {
  Open: "#10b981",
  "In Progress": "#6366f1",
  Completed: "#71717a",
  Canceled: "#f59e0b",
};

const Insights = () => {
  const { data: user } = useAuthUser();
  const { data, isLoading } = useInsights();

  if (isLoading || !data || !user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const isWorker = data.role === "Worker";

  return (
    <Box
      sx={{
        maxWidth: 1280,
        mx: "auto",
        px: { xs: 1.5, sm: 2.5, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
          Insights
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isWorker
            ? "How your profile is performing on LynkCircles."
            : "How your job posts are performing."}
        </Typography>
      </Box>

      {isWorker ? (
        <WorkerView data={data} />
      ) : (
        <ClientView data={data} />
      )}
    </Box>
  );
};

const WorkerView = ({
  data,
}: {
  data: Extract<ReturnType<typeof useInsights>["data"], { role: "Worker" }>;
}) => {
  if (!data) return null;
  const t = data.totals;
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(6, 1fr)",
          },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <StatCard label="Saves" value={t.saves} accent="primary" />
        <StatCard label="Reviews" value={t.reviews} />
        <StatCard label="Avg rating" value={t.avgRating.toFixed(1)} accent="success" />
        <StatCard label="Completed" value={t.completedJobs} />
        <StatCard label="Applications" value={t.applications} />
        <StatCard label="Hire rate" value={`${t.hireRate}%`} accent="primary" />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 1.5,
        }}
      >
        <Panel
          title="Messages received"
          subtitle="Volume over the last 14 days"
          height={280}
        >
          <ResponsiveContainer>
            <AreaChart data={data.messageVolume} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#71717a" }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#71717a" }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
                labelFormatter={(l) => new Date(String(l)).toDateString()}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4338ca"
                strokeWidth={2}
                fill="url(#msgGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Rating distribution" subtitle="Across all reviews" height={280}>
          <ResponsiveContainer>
            <BarChart data={data.ratingDistribution} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="rating"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#71717a" }}
                tickFormatter={(v) => `${v}★`}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#71717a" }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.ratingDistribution.map((row, i) => (
                  <Cell
                    key={i}
                    fill={row.rating >= 4 ? "#10b981" : row.rating === 3 ? "#f59e0b" : "#f43f5e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </Box>
    </>
  );
};

const ClientView = ({
  data,
}: {
  data: Extract<ReturnType<typeof useInsights>["data"], { role: "Client" }>;
}) => {
  if (!data) return null;
  const t = data.totals;
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(6, 1fr)",
          },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <StatCard label="Posts" value={t.posts} accent="primary" />
        <StatCard label="Open" value={t.open} accent="success" />
        <StatCard label="In progress" value={t.inProgress} />
        <StatCard label="Completed" value={t.completed} />
        <StatCard label="Applicants" value={t.applicants} />
        <StatCard label="Hire rate" value={`${t.hireRate}%`} accent="primary" />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 1.5,
        }}
      >
        <Panel
          title="Posts created"
          subtitle="Over the last 14 days"
          height={280}
        >
          <ResponsiveContainer>
            <AreaChart data={data.postsByDay} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#71717a" }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#71717a" }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
                labelFormatter={(l) => new Date(String(l)).toDateString()}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4338ca"
                strokeWidth={2}
                fill="url(#postsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="By status" subtitle="Distribution of your posts" height={280}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data.postsByStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={48}
                outerRadius={88}
                paddingAngle={2}
              >
                {data.postsByStatus.map((row, i) => (
                  <Cell key={i} fill={STATUS_COLORS[row.status] ?? "#71717a"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5, justifyContent: "center" }}>
            {data.postsByStatus.map((row) => (
              <Box key={row.status} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    backgroundColor: STATUS_COLORS[row.status] ?? "#71717a",
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                  {row.status} ({row.count})
                </Typography>
              </Box>
            ))}
          </Box>
        </Panel>
      </Box>
    </>
  );
};

export default Insights;
