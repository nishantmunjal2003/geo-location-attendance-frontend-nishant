import React from "react";
import { Box, Container, Link, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 2.5,
                px: 2,
                mt: "auto",
                background: "rgba(255, 255, 255, 0.94)",
                backdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(13, 125, 112, 0.12)",
                boxShadow: "0px -2px 14px rgba(15, 23, 42, 0.03)",
                textAlign: "center",
            }}
        >
            <Container maxWidth="md">
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1.5,
                        fontSize: "0.85rem",
                        color: "#475569",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.85rem" }}>
                            This app is from{" "}
                            <Link
                                href="https://nishantmunjal.com/nmril"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    color: "#0D7D70",
                                    fontWeight: 700,
                                    textDecoration: "none",
                                    "&:hover": { textDecoration: "underline" },
                                }}
                            >
                                NMRIL Labs (nishantmunjal.com/nmril)
                            </Link>
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: "center",
                            gap: { xs: 0.5, sm: 2 },
                        }}
                    >
                        <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.825rem" }}>
                            <strong style={{ color: "#0F172A" }}>Project Co-Ordinator:</strong> Dr. Nishant Kumar
                        </Typography>
                        <Box sx={{ display: { xs: "none", sm: "block" }, color: "rgba(13, 125, 112, 0.25)" }}>•</Box>
                        <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.825rem" }}>
                            <strong style={{ color: "#0F172A" }}>Developer:</strong> Rajeev Sahu
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
