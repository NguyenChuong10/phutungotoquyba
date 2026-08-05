import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    service: "Phu Tung Oto Q.BA Enterprise API",
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Q.BA Enterprise API] Server running on port ${PORT}`);
  });
}

export default app;
