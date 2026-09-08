import React from "react";
import { Box, Container } from "@mui/material";
import Footer from "../Footer/Footer";

const MainLayout = ({ children, navbar }) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            {navbar}
            <Container
                component="main"
                maxWidth="xl"
                sx={{
                    flexGrow: 1,
                    py: 3, // Add vertical padding
                    px: { xs: 1, md: 3 }, // Add horizontal padding
                }}
            >
                {children}
            </Container>
            <Footer />
        </Box>
    );
};

export default MainLayout;
