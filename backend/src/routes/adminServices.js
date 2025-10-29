const express = require('express');
const multer = require('multer');
const { requireAdmin } = require('../middleware/auth');
const { servicePayloadSchema, reorderSchema } = require('../utils/validators');
const {
  listAllServices,
  createService,
  updateService,
  deleteService,
  reorderServices,
} = require('../services/serviceService');
const { config } = require('../config');
const { prisma } = require('../utils/prisma');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAdmin);

router.get('/admin/services', async (_req, res, next) => {
  try {
    const services = await listAllServices();
    res.json({ services });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/services', async (req, res, next) => {
  try {
    const { error, value } = servicePayloadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const created = await createService(value);
    res.status(201).json({ service: created });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/services/:id', async (req, res, next) => {
  try {
    const { error, value } = servicePayloadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const updated = await updateService(req.params.id, value);
    res.json({ service: updated });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Service not found' });
    }
    next(err);
  }
});

router.delete('/admin/services/:id', async (req, res, next) => {
  try {
    await deleteService(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Service not found' });
    }
    next(err);
  }
});

router.patch('/admin/services/reorder', async (req, res, next) => {
  try {
    const { error, value } = reorderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const services = await reorderServices(value);
    res.json({ services });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/upload-icon', upload.single('icon'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Icon file is required' });
    }
    const allowedMime = ['image/png', 'image/svg+xml'];
    if (!allowedMime.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only PNG or SVG images are allowed' });
    }
    const sizeKb = req.file.size / 1024;
    if (sizeKb > config.maxUploadKb) {
      return res.status(400).json({ message: `Icon must be smaller than ${config.maxUploadKb}KB` });
    }

    const serviceId = req.body.serviceId;
    if (!serviceId) {
      return res.status(400).json({ message: 'serviceId is required' });
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        icon_blob: req.file.buffer,
        icon_mime: req.file.mimetype,
      },
    });

    res.json({
      service: {
        id: updated.id,
        icon: `data:${updated.icon_mime};base64,${updated.icon_blob.toString('base64')}`,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Service not found' });
    }
    next(err);
  }
});

module.exports = router;
