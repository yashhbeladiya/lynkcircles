import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-3px); opacity: 1; }
`;

interface Props {
  name?: string;
}

export const TypingIndicator = ({ name }: Props) => (
  <Box
    role="status"
    aria-live="polite"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      pl: 1.5,
      py: 0.5,
      color: "text.secondary",
      fontSize: "0.75rem",
    }}
  >
    {name ? <span>{name} is typing</span> : null}
    <Box sx={{ display: "inline-flex", gap: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            bgcolor: "text.tertiary",
            animation: `${bounce} 1.2s infinite`,
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </Box>
  </Box>
);
