const router = require("express").Router();
const { registerUser, getUsers, getUserById, updateUser, changePassword } = require("./userController");

router.post("/register", registerUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);

// Hapus user
router.delete("/:id", require("./userController").deleteUser);
router.post("/:id/change-password", changePassword);

module.exports = router;