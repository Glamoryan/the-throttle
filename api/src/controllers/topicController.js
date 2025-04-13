const Topic = require('../models/Topic');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Tüm konuları getir
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ ownerId: req.user._id });
    return successResponse(res, 200, 'Konular başarıyla getirildi', topics);
  } catch (error) {
    return errorResponse(res, 500, 'Konular getirilirken bir hata oluştu', error);
  }
};

// Belirli bir konuyu getir
exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, ownerId: req.user._id });
    
    if (!topic) {
      return errorResponse(res, 404, 'Konu bulunamadı');
    }
    
    return successResponse(res, 200, 'Konu başarıyla getirildi', topic);
  } catch (error) {
    return errorResponse(res, 500, 'Konu getirilirken bir hata oluştu', error);
  }
};

// Yeni bir konu oluştur
exports.createTopic = async (req, res) => {
  try {
    const { type, title, description, parentId, weight, status } = req.body;
    
    const topic = new Topic({
      type,
      title,
      description,
      parentId,
      ownerId: req.user._id,
      weight,
      status
    });
    
    await topic.save();
    
    return successResponse(res, 201, 'Konu başarıyla oluşturuldu', topic);
  } catch (error) {
    return errorResponse(res, 500, 'Konu oluşturulurken bir hata oluştu', error);
  }
};

// Konuyu güncelle
exports.updateTopic = async (req, res) => {
  try {
    const { title, description, progress, weight, status } = req.body;
    
    const topic = await Topic.findOne({ _id: req.params.id, ownerId: req.user._id });
    
    if (!topic) {
      return errorResponse(res, 404, 'Konu bulunamadı');
    }
    
    // Güncellenecek alanları ayarla
    if (title) topic.title = title;
    if (description) topic.description = description;
    if (progress !== undefined) topic.progress = progress;
    if (weight !== undefined) topic.weight = weight;
    if (status) topic.status = status;
    
    await topic.save();
    
    return successResponse(res, 200, 'Konu başarıyla güncellendi', topic);
  } catch (error) {
    return errorResponse(res, 500, 'Konu güncellenirken bir hata oluştu', error);
  }
};

// Konuyu sil
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, ownerId: req.user._id });
    
    if (!topic) {
      return errorResponse(res, 404, 'Konu bulunamadı');
    }
    
    // Alt konuları da sil
    await Topic.deleteMany({ parentId: topic._id });
    
    await topic.remove();
    
    return successResponse(res, 200, 'Konu başarıyla silindi');
  } catch (error) {
    return errorResponse(res, 500, 'Konu silinirken bir hata oluştu', error);
  }
};

// Alt konuları getir
exports.getChildTopics = async (req, res) => {
  try {
    const childTopics = await Topic.find({ parentId: req.params.id, ownerId: req.user._id });
    return successResponse(res, 200, 'Alt konular başarıyla getirildi', childTopics);
  } catch (error) {
    return errorResponse(res, 500, 'Alt konular getirilirken bir hata oluştu', error);
  }
}; 