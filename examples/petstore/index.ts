import { Type } from "@sinclair/typebox";
import mongoose from "mongoose";
import { typeboxToMongooseSchema } from "mongoose-typebox";

const orderTSchema = Type.Object({
    id: Type.Number({ mongoose: { unique: true } }),
    petId: Type.Number({ mongoose: { ref: "Pets" } }),
    quantity: Type.Number({ minimum: 0 }),
    shipDate: Type.Date({ mongoose: { min: new Date("2020-01-01") } }),
    status: Type.Union([
        Type.Literal("placed"),
        Type.Literal("approved"),
        Type.Literal("delivered"),
    ]),
    complete: Type.Boolean({ default: false }),
});

const addressTSchema = Type.Object({
    id: Type.Number(),
    street: Type.String(),
    city: Type.String(),
    state: Type.Object(Type.String()),
    zip: Type.String(),
});

const userTSchema = Type.Object({
    id: Type.Number(),
    username: Type.String({ mongoose: { unique: true } }),
    firstName: Type.String(),
    lastName: Type.String(),
    email: Type.String(),
    password: Type.String(),
    phone: Type.String(),
    userStatus: Type.Number(),
    address: Type.Array(Type.Number({ ref: "Addresses" })),
});

const petTSchema = Type.Object({
    id: Type.Number({ mongoose: { unique: true } }),
    category: Type.Object({
        id: Type.Number(),
        name: Type.String(),
    }),
    name: Type.String(),
    photoUrls: Type.Array(Type.String()),
    tags: Type.Array(
        Type.Object({
            id: Type.Number(),
            name: Type.String(),
        })
    ),
    status: Type.Union([Type.Literal("available"), Type.Literal("pending"), Type.Literal("sold")]),
});

const orderModel = mongoose.model("Orders", typeboxToMongooseSchema(orderTSchema));
const addressModel = mongoose.model("Addresses", typeboxToMongooseSchema(addressTSchema));
const petModel = mongoose.model("Pets", typeboxToMongooseSchema(petTSchema));

const userSchema = typeboxToMongooseSchema(userTSchema, {
    methods: {
        getFullName() {
            return `${this.firstName} ${this.lastName}`;
        },
    },
});

// mongoose hooks
userSchema.pre("save", function (next) {
    console.log("Saving user");
    next();
});

const userModel = mongoose.model("Users", userSchema);
