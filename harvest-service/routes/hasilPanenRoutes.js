const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../config/auth');
const {
  addHarvest, getAllHarvest, getAvailableHarvest, getHarvestById, updateHarvest, deleteHarvest,
} = require('../controllers/hasilPanenController');

router.post('/', protect, upload.single('foto'), addHarvest);
router.get('/', protect, getAllHarvest);
router.get('/available', protect, getAvailableHarvest);
router.get('/:id', protect, getHarvestById);
router.put('/:id', protect, upload.single('foto'), updateHarvest);
router.delete('/:id', protect, deleteHarvest);

module.exports = router;
