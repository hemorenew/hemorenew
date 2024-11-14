import mongoose, { Schema } from 'mongoose';

const ColorSchema = new Schema(
  {
    name: {
      type: String,
    },
    value: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Color || mongoose.model('Color', ColorSchema);
