// Add this route to your backend
router.get('/completed-tests', async (req, res) => {
  try {
    const { email } = req.query;
    const completedTests = await Score.find({ email }); // Assuming you have a Score model
    res.json(completedTests);
  } catch (error) {
    console.error('Error fetching completed tests:', error);
    res.status(500).json({ message: 'Error fetching completed tests' });
  }
}); 