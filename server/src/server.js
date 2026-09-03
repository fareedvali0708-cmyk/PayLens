const app = require("./app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[PayLens] Server running on http://localhost:${PORT}`);
  console.log(`[PayLens] Health check → http://localhost:${PORT}/api/health`);
});
