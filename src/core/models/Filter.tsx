import mongoose, { Schema } from 'mongoose';

const FilterSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [150, 'Name cannot be more than 150 characters'],
      required: [true, 'Brand is required'],
    },
    model: {
      type: String,
      trim: true,
      maxlength: [150, 'Name cannot be more than 150 characters'],
      required: [true, 'Model is required'],
    },
    primingReal: {
      type: Number,
      required: true,
    },
    firstUse: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: 'active',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Filter || mongoose.model('Filter', FilterSchema);
