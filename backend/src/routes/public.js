const express = require('express');
const { listPublicServices } = require('../services/serviceService');

const router = express.Router();

router.get('/services', async (req, res, next) => {
  try {
    const services = await listPublicServices();
    res.json({ services });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
