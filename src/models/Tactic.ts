import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITactic extends Document {
    name: string;
    mode: 'football' | 'futsal';
    formation: string;
    players: {
        id: string;
        name: string;
        number: number;
        x: number;
        y: number;
        color: string;
    }[];
    drawingData?: string; // SVG path or JSON string for lines
}

const TacticSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        mode: { type: String, enum: ['football', 'futsal'], required: true },
        formation: { type: String, required: true },
        players: [
            {
                id: { type: String, required: true },
                name: { type: String, required: true },
                number: { type: Number, required: true },
                x: { type: Number, required: true },
                y: { type: Number, required: true },
                color: { type: String, required: true },
            }
        ],
        drawingData: { type: String },
    },
    { timestamps: true }
);

const Tactic: Model<ITactic> = mongoose.models.Tactic || mongoose.model<ITactic>('Tactic', TacticSchema);
export default Tactic;
