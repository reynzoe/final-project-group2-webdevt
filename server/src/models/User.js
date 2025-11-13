import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            minlength: 3,
            maxlength: 32
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        // Store a hash, not a raw password
        passwordHash: { type: String, required: true },

        role: { type: String, enum: ['player', 'admin', 'banned'], default: 'player', index: true },

        coins: { type: Number, default: 0, min: 0 },

        ownedSkins: [{ type: Schema.Types.ObjectId, ref: 'Skin' }],

        // Optional equipped skin
        equippedSkin: { type: Schema.Types.ObjectId, ref: 'Skin', default: null }
    },
    { timestamps: true }
);

// Fast lookups
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);

