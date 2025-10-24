import mongoose from 'mongoose';

const { Schema } = mongoose;

const SaveSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        score: { type: Number, required: true, min: 0 },
        level: { type: Number, required: true, min: 1 }
    },
    {
        // Keep createdAt for when the save happened; omit updatedAt
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Leaderboard and recent saves
SaveSchema.index({ score: -1, createdAt: -1 });
SaveSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Save || mongoose.model('Save', SaveSchema);

