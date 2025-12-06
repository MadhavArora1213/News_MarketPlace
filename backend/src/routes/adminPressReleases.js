const express = require("express");
const router = express.Router();
console.log('Loading AdminPressReleaseController module');
const AdminPressReleaseController = require("../controllers/adminPressReleaseController");
console.log('AdminPressReleaseController loaded:', typeof AdminPressReleaseController);
const {
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission,
} = require("../middleware/auth");

console.log("Creating AdminPressReleaseController instance");
const adminPressReleaseController = new AdminPressReleaseController();

// All routes require admin authentication and panel access
router.use(verifyAdminToken);
router.use(requireAdminPanelAccess);
router.use(requireAdminPermission("manage_publications"));

// Get all press releases (admin management)
router.get("/", adminPressReleaseController.getAll);

// Get press release by ID
router.get("/:id", adminPressReleaseController.getById);

// Create a new press release
router.post(
  "/",
  adminPressReleaseController.upload.single("image_logo"),
  adminPressReleaseController.createValidation,
  adminPressReleaseController.create
);

// Update press release
router.put(
  "/:id",
  adminPressReleaseController.upload.single("image_logo"),
  adminPressReleaseController.updateValidation,
  adminPressReleaseController.update
);

// Approve press release
router.put("/:id/approve", adminPressReleaseController.approve);

// Reject press release
router.put("/:id/reject", adminPressReleaseController.reject);

// Delete press release
router.delete("/:id", adminPressReleaseController.delete);

module.exports = router;
