import mongoose, { Schema } from 'mongoose';

const WashingSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    filter: {
      type: Schema.Types.ObjectId,
      ref: 'Filter',
      required: true,
    },
    attended: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    residualVolume: {
      type: Number,
      default: 0,
    },
    integrityTest: {
      type: Number,
      default: 0,
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
