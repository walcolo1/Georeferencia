const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const capturesRoutes = require('./routes/capture.routes');
const syncLogsRoutes = require('./routes/sync_logs.routes');

const app = express();

// Middlewares
app.use(cors({
  origin: [
    "https://georeferencia-five.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Backend de Georreferencia funcionando correctamente"
  });
});
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/captures', capturesRoutes);
app.use('/api/sync_logs', syncLogsRoutes);

module.exports = app;
