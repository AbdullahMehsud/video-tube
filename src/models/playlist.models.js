import mongoose, {Schema} from "mongoose"

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos: [{
        type: Schema.Types.ObjectId,
        ref: "Video",
        default: []
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    thumbnail: {
        type: String,
        required: true
    }
},
{
    timestamps: true
}
)

export const PlaylistModel = mongoose.model("Playlist", playlistSchema)
