import { describe, it } from "bun:test";
import { typeboxToMongooseSchema } from "../src/parser";
import { Type } from "@sinclair/typebox";

describe("main", () => {
    it("should pass", () => {
        const schema = Type.Object({
            string: Type.Optional(
                Type.String({
                    minLength: 3,
                    default: "salut",
                    maxLength: 10,
                    mongoose: { unique: true },
                })
            ),
            number: Type.Number({
                minimum: 3,
                default: 5,
                maximum: 10,
                mongoose: {},
            }),
            date: Type.Date({
                minimum: new Date("2020-01-01"),
                maximum: new Date("2021-01-01"),
                mongoose: {},
            }),
            buffer: Type.Uint8Array({
                minByteLength: 5,
                maxByteLength: 10,
                mongoose: {},
            }),
            bool: Type.Boolean({
                default: true,
                mongoose: {},
            }),
            mixed: Type.Any({
                mongoose: {},
            }),
            objectId: Type.String(),
            array: Type.Array(Type.String()),
            map: Type.Any(),
            decimal128: Type.Number(),
            stringEnum: Type.String({ mongoose: { enum: ["a", "b", "c"] } }),
            schema: Type.Object({
                nested: Type.String(),
            }),
        });

        const mongooseSchema = typeboxToMongooseSchema(schema, {
            toJSON: {
                transform: (_doc, ret) => {
                    delete ret.password;
                    delete ret.authTokens;
                },
            },
            methods: {
                getName: function () {
                    return this.string;
                },
            },
            virtuals: {
                id: {
                    get: function (this: any) {
                        return this._id.toHexString();
                    },
                    set: function (this: any, v: any) {
                        this._id = v;
                    },
                },
            },
        });
    });
});

// const schema = new mongoose.Schema(
//     {
//         string: {
//             type: String,
//             required: true,
//             minlength: 2,
//             maxlength: 20,
//         },
//         number: {
//             type: Number,
//             required: true,
//             min: 18,
//             max: 150,
//         },
//         date: {
//             type: Date,
//             required: true,
//             min: new Date("1900-01-01"),
//             max: new Date("2020-01-01"),
//         },
//         dateNow: {
//             type: Date,
//             default: Date.now,
//         },
//         buffer: {
//             type: Buffer,
//             required: true,
//         },
//         bool: {
//             type: Boolean,
//             required: true,
//             default: false,
//         },
//         mixed: {
//             type: mongoose.Schema.Types.Mixed,
//             required: true,
//         },
//         objectId: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: true,
//         },
//         array: {
//             type: [String],
//             required: true,
//         },
//         map: {
//             type: Map,
//             required: true,
//         },
//         decimal128: {
//             type: mongoose.Schema.Types.Decimal128,
//             required: true,
//         },
//         stringEnum: {
//             type: String,
//             enum: ["a", "b", "c"],
//             required: true,
//         },
//         schema: {
//             type: new mongoose.Schema({
//                 nested: String,
//             }),
//             required: true,
//         },
//         UUID: {
//             type: mongoose.Schema.Types.UUID,
//             required: true,
//         },
//         bigInt: {
//             type: mongoose.Schema.Types.BigInt,
//             required: true,
//         },
//     },
//     {
//         methods: {
//             method() {
//                 return this.string;
//             },
//         },
//     }
// );
