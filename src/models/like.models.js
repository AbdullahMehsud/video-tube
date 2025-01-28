import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema({
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        tweets: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        }
},
{timestamps: true}
)

export const likeModel = mongoose.model("Like", likeSchema)