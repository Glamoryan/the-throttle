const mongoose = require('mongoose');

/**
 * Mongoose schema for Topic model
 * 
 * @typedef {Object} TopicSchema
 * @property {string} type - Type of topic ('roadmap', 'subtopic', 'task')
 * @property {string} title - Title of the topic
 * @property {string} [description] - Optional description of the topic
 * @property {mongoose.Types.ObjectId} [parentId] - Reference to parent topic (null for top-level topics)
 * @property {mongoose.Types.ObjectId} ownerId - Reference to the user who owns this topic
 * @property {number} progress - Progress percentage (0-100)
 * @property {number} weight - Weight of this topic for progress calculation
 * @property {string} status - Current status ('pending', 'in-progress', 'done')
 * @property {boolean} isPublic - Whether this topic is publicly visible
 * @property {Date} createdAt - Automatically added timestamp for creation
 * @property {Date} updatedAt - Automatically added timestamp for updates
 */
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
  },
  isPublic: {
    type: Boolean,
    default: true // Default to public
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Indexes for query optimization
topicSchema.index({ parentId: 1 });
topicSchema.index({ ownerId: 1 });
topicSchema.index({ type: 1 });
topicSchema.index({ status: 1 });

/**
 * Calculates the progress of a topic based on its children's progress
 * 
 * @async
 * @method calculateProgress
 * @memberof TopicSchema
 * @instance
 * @returns {Promise<number>} - The calculated progress (0-100)
 * @description
 * For tasks, returns the direct progress value. 
 * For topics with children, calculates a weighted average of all children's progress.
 */
topicSchema.methods.calculateProgress = async function() { // To-do: move to service layer
  if (this.type === 'task') {
    return this.progress;
  }

  const children = await this.constructor.find({ parentId: this._id });
  
  if (children.length === 0) {
    return 0;
  }
  
  // To-do: Upgrade/refactor calculateProgress method
  let totalWeight = 0;
  let weightedProgress = 0;
  
  for (const child of children) {
    const childProgress = await child.calculateProgress();
    totalWeight += child.weight;
    weightedProgress += childProgress * child.weight;
  }
  
  return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
};

/**
 * Pre-save middleware to update parent's progress when a child is modified
 * 
 * @async
 * @function preSaveMiddleware
 * @memberof TopicSchema
 * @param {function} next - Mongoose middleware next function
 * @description
 * When a topic's progress or status changes, this middleware will update
 * the parent topic's progress by recalculating it based on all children.
 */
topicSchema.pre('save', async function(next) {
  if (this.isModified('progress') || this.isModified('status')) {
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