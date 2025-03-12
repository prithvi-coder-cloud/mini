const verifyToken = require('../middleware/auth');

// Example of protecting routes
router.get('/userdetails', verifyToken, async (req, res) => {
  // Route logic here
});

router.post('/jobs', verifyToken, async (req, res) => {
  // Route logic here
}); 