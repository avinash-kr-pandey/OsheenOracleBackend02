const upload = require("../upload");

router.put("/update-profile-image/:id", upload.single("file"), async (req, res) => {
  try {
    const userId = req.params.id;

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/images/${req.file.filename}`;

    // DB update (example MongoDB)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedUser
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
