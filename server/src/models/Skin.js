import mongoose from 'mongoose';

const { Schema } = mongoose;

const SkinSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, unique: true, maxlength: 64 },
        price: { type: Number, required: true, min: 0 },
        image: { type: String, required: true, trim: true } // URL or asset path
    },
    { timestamps: true }
);

// Useful for store queries by price
SkinSchema.index({ price: 1 });

export default mongoose.models.Skin || mongoose.model('Skin', SkinSchema);

