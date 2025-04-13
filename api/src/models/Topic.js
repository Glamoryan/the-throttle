const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['roadmap', 'subtopic', 'task'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    default: null
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  weight: {
    type: Number,
    min: 0,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'done'],
    default: 'pending'
  }
}, {
  timestamps: true // createdAt ve updatedAt alanlarını otomatik olarak ekler
});

// İndeksler
topicSchema.index({ parentId: 1 });
topicSchema.index({ ownerId: 1 });
topicSchema.index({ type: 1 });
topicSchema.index({ status: 1 });

// Progress hesaplama metodu
topicSchema.methods.calculateProgress = async function() {
  if (this.type === 'task') {
    return this.progress;
  }
  
  // Alt öğeleri bul
  const children = await this.constructor.find({ parentId: this._id });
  
  if (children.length === 0) {
    return 0;
  }
  
  // Ağırlıklı ortalama hesapla
  let totalWeight = 0;
  let weightedProgress = 0;
  
  for (const child of children) {
    const childProgress = await child.calculateProgress();
    totalWeight += child.weight;
    weightedProgress += childProgress * child.weight;
  }
  
  return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
};

// Progress güncelleme middleware
topicSchema.pre('save', async function(next) {
  if (this.isModified('progress') || this.isModified('status')) {
    // Üst öğeyi bul ve güncelle
    if (this.parentId) {
      const parent = await this.constructor.findById(this.parentId);
      if (parent) {
        parent.progress = await parent.calculateProgress();
        await parent.save();
      }
    }
  }
  next();
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic; 