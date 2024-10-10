import mongoose, { Schema } from 'mongoose';

const WashingSchema = new Schema(
  {
    patient: {
      type: String,
      trim: true,
      maxlength: [150, 'Name cannot be more than 150 characters'],
      required: true,
    },
    filter: {
      type: String,
      trim: true,
      maxlength: [150, 'Name cannot be more than 150 characters'],
      required: true,
    },
    startDate: {
      type: Date,
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

export default mongoose.models.Washing ||
  mongoose.model('Washing', WashingSchema);
