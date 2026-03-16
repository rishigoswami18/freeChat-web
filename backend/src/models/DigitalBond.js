import mongoose from 'mongoose';

const DigitalBondSchema = new mongoose.Schema({
  creatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null, // null if not yet sold
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  },
  rarity: { 
    type: String, 
    enum: ['Exclusive', 'Rare', 'Unique'], 
    default: 'Exclusive' 
  },
  metadata: {
     assetUrl: String,
     perks: [String]
  },
  isSold: { 
    type: Boolean, 
    default: false 
  },
  soldAt: { 
    type: Date 
  }
}, { timestamps: true });

export default mongoose.model('DigitalBond', DigitalBondSchema);
