import Box from "@mui/material/Box";

interface Props {
  size?: number;
}

export const Logo = ({ size = 32 }: Props) => (
  <Box
    component="img"
    src="/logolc1.png"
    width={size}
    height={size}
    alt="LynkCircles"
    draggable={false}
    sx={{
      display: "block",
      borderRadius: 1,
      userSelect: "none",
    }}
  />
);
