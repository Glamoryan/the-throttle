const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  getChildTopics
} = require('../controllers/topicController');

// Tüm route'lar için kimlik doğrulama gerekli
router.use(authenticate);

// Tüm konuları getir
router.get('/', getAllTopics);

// Belirli bir konuyu getir
router.get('/:id', getTopicById);

// Alt konuları getir
router.get('/:id/children', getChildTopics);

// Yeni bir konu oluştur
router.post('/', createTopic);

// Konuyu güncelle
router.put('/:id', updateTopic);

// Konuyu sil
router.delete('/:id', deleteTopic);

module.exports = router; 