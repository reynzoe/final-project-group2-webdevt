import mongoose from 'mongoose';

const { Schema } = mongoose;

const ScoreSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 32
        },
        score: {
            type: Number,
            required: true,
            min: 0
        },
        coins: {
            type: Number,
            required: false,
            min: 0,
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// For fast leaderboard queries
ScoreSchema.index({ score: -1, createdAt: 1 });

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);


