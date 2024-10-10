import mongoose, { Schema } from 'mongoose';

const FilterSchema = new Schema(
  {
    brand: {
      type: String,
      trim: true,
      maxlength: [150, 'Name cannot be more than 150 characters'],
      unique: true,
    },
    model: {
      type: String,
      trim: true,
      maxlength: [150, 'Name cannot be more than 150 characters'],
      unique: true,
    },
    serial: {
      type: String,
      trim: true,
      maxlength: [20, 'Plate cannot be more than 20 characters'],
      unique: true,
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'inactive'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Filter || mongoose.model('Filter', FilterSchema);
