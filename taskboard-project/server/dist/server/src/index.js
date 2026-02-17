import express from "express";
import cors from "cors";
import { tasksRouter } from "./routes/tasks.js";
const app = express();
const PORT = process.env.PORT || 3011;
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use("/api/tasks", tasksRouter);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
export default app;
//# sourceMappingURL=index.js.map