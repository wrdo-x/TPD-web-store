const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  productController.createProduct,
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  productController.deleteProduct,
);

module.exports = router;
