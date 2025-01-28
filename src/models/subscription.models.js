import mongoose, {Schema, SchemaType} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    chennel: {
        type: Schema.Types.ObjectId, // one to whom `subscriber` is SUBSCRIBING
        ref: "User"
    }
}, {timestamps: true})

export const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema)