const express = require("express");
const {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} = require("../controllers/reportController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/daily", getDailyReport);
router.get("/month-to-date", getMonthToDateReport);
router.get("/monthly", getPreviousMonthReport);
router.get("/previous-month", getPreviousMonthReport);

module.exports = router;
