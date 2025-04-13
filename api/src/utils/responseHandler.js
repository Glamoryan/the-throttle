/**
 * Başarılı API yanıtları için standart format
 * @param {Object} res - Express response nesnesi
 * @param {Number} statusCode - HTTP durum kodu
 * @param {String} message - Başarı mesajı
 * @param {Object} data - Yanıt verisi
 * @returns {Object} - JSON yanıtı
 */
exports.successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

/**
 * Hata API yanıtları için standart format
 * @param {Object} res - Express response nesnesi
 * @param {Number} statusCode - HTTP durum kodu
 * @param {String} message - Hata mesajı
 * @param {Object} error - Hata detayları
 * @returns {Object} - JSON yanıtı
 */
exports.errorResponse = (res, statusCode, message, error = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    error: error ? {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } : undefined
  });
}; 