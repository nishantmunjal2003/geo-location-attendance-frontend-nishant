import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

const GlassCard = styled(Paper)(({ theme }) => ({
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(20px)",
    boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.04)",
    borderRadius: theme.shape.borderRadius * 1.5,
    overflow: "hidden",
    border: "1px solid rgba(13, 125, 112, 0.14)",
}));

export default GlassCard;
