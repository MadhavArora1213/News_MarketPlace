const express = require("express");
const router = express.Router();
console.log('Loading AdminPressReleaseController module');
const AdminPressReleaseController = require("../controllers/adminPressReleaseController");
console.log('AdminPressReleaseController loaded:', typeof AdminPressReleaseController);
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission,
} = require("../middleware/auth");

console.log("Creating AdminPressReleaseController instance");
const adminPressReleaseController = new AdminPressReleaseController();

// Bulk operations & export
router.get("/template", verifyAdminToken, requireAdminPanelAccess, adminPressReleaseController.downloadTemplate);
router.post("/bulk-upload", verifyAdminToken, requireAdminPanelAccess, requireAdminPermission("manage_publications"), adminPressReleaseController.csvUpload.single("file"), adminPressReleaseController.bulkUpload);
router.get("/export", verifyAdminToken, requireAdminPanelAccess, adminPressReleaseController.downloadCSV);

// Get all press releases (authenticated users can view)
router.get("/", verifyToken, adminPressReleaseController.getAll);

// Get press release by ID
router.get("/:id", verifyToken, adminPressReleaseController.getById);

// Create a new press release
router.post(
  "/",
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission("manage_publications"),
  adminPressReleaseController.upload.single("image_logo"),
  adminPressReleaseController.createValidation,
  adminPressReleaseController.create
);

// Update press release
router.put(
  "/:id",
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission("manage_publications"),
  adminPressReleaseController.upload.single("image_logo"),
  adminPressReleaseController.updateValidation,
  adminPressReleaseController.update
);

// Approve press release
router.put("/:id/approve", verifyAdminToken, requireAdminPanelAccess, requireAdminPermission("manage_publications"), adminPressReleaseController.approve);

// Reject press release
router.put("/:id/reject", verifyAdminToken, requireAdminPanelAccess, requireAdminPermission("manage_publications"), adminPressReleaseController.reject);

// Delete press release
router.delete("/:id", verifyAdminToken, requireAdminPanelAccess, requireAdminPermission("manage_publications"), adminPressReleaseController.delete);

module.exports = router;
