const express = require("express");
const cors = require("cors");
const path = require("path");

const { loadSalesData } = require("./utils/csvLoader");
const salesRoutes = require("./routes/salesRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// CSV is expected at backend/truestate_assignment_dataset.csv
const CSV_PATH = path.join(__dirname, "..", "truestate_assignment_dataset.csv");

loadSalesData(CSV_PATH)
  .then((salesData) => {
    console.log(`✅ Loaded ${salesData.length} sales records`);

  app.get("/", (req, res) => {
  res.send("Backend is running. Use /api/sales for data.");
    });

    app.use((req, res, next) => {
      req.salesData = salesData;
      next();
    });

    app.use("/api", salesRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to load CSV:", err);
    process.exit(1);
  });
