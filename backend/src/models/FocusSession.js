import mongoose from 'mongoose';

const FocusSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  goal: { 
    type: String, 
    required: true 
  },
  durationMinutes: { 
    type: Number, 
    required: true 
  },
  startTime: { 
    type: Date, 
    default: Date.now 
  },
  endTime: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'interrupted'], 
    default: 'active' 
  },
  productivityScore: { 
    type: Number, 
    default: 0 
  },
  blocksAvoided: { 
    type: Number, 
    default: 0 
  },
  xpEarned: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// TTL Index: Prune sessions after 30 days to keep DB lean
FocusSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.model('FocusSession', FocusSessionSchema);
