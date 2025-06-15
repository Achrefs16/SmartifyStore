import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    governorate: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['en_attente', 'confirmee', 'en_traitement', 'expediee', 'livree', 'annulee', 'remboursee', 'en_suspension', 'retournee', 'echouee'],
    default: 'en_attente'
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add pre-save middleware to ensure userId is null if not provided
orderSchema.pre('save', function(next) {
  if (!this.userId) {
    this.userId = null;
  }
  next();
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema); 