import mongoose from 'mongoose';

const FanLoyaltySchema = new mongoose.Schema({
  creatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  fanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  bondScore: { 
    type: Number, 
    default: 0 
  },
  rankSuffix: { 
    type: String, 
    enum: ['Elite', 'Legend', 'Patron', 'Fan'], 
    default: 'Fan' 
  },
  totalGemsContributed: { 
    type: Number, 
    default: 0 
  },
  lastActive: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Compounded index for lightning-fast rank lookups
FanLoyaltySchema.index({ creatorId: 1, bondScore: -1 });

export default mongoose.model('FanLoyalty', FanLoyaltySchema);
