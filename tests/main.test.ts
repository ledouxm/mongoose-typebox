import { describe, expect, it } from "bun:test";
import { parseObject } from "../src/parser";
import { Type } from "@sinclair/typebox";
import mongoose from "mongoose";

describe("main", () => {
    it("should generate a required string", () => {
        const schema = Type.Object({
            string: Type.String({
                default: "Hello world",
                minLength: 3,
                mongoose: {
                    unique: true,
                    maxlength: 20,
                },
            }),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            string: {
                type: String,
                default: "Hello world",
                minlength: 3,
                maxlength: 20,
                unique: true,
                required: true,
            },
        });
    });

    it("should generate an optionnal number", () => {
        const schema = Type.Object({
            number: Type.Optional(
                Type.Number({
                    default: 5,
                    minimum: 3,
                    mongoose: {
                        max: 10,
                    },
                })
            ),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            number: {
                type: Number,
                default: 5,
                min: 3,
                max: 10,
            },
        });
    });

    it("should generate a date", () => {
        const schema = Type.Object({
            date: Type.Date({
                default: new Date("2020-01-01"),
                minimum: new Date("2020-01-01"),
                maximum: new Date("2021-01-01"),
            }),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            date: {
                type: Date,
                default: new Date("2020-01-01"),
                min: new Date("2020-01-01"),
                max: new Date("2021-01-01"),
                required: true,
            },
        });
    });

    it("should generate a buffer", () => {
        const schema = Type.Object({
            buffer: Type.Uint8Array({
                minByteLength: 5,
                maxByteLength: 10,
            }),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            buffer: {
                type: Buffer,
                minlength: 5,
                required: true,
            },
        });
    });

    it("should generate a boolean", () => {
        const schema = Type.Object({
            bool: Type.Boolean({
                default: true,
            }),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            bool: {
                type: Boolean,
                default: true,
                required: true,
            },
        });
    });

    it("should generate a mixed", () => {
        const schema = Type.Object({
            mixed: Type.Any(),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            mixed: {
                type: mongoose.Schema.Types.Mixed,
                required: true,
            },
        });
    });

    it("should generate a ref", () => {
        const schema = Type.Object({
            objectId: Type.String({ mongoose: { ref: "Ref1" } }),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            objectId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ref1",
            },
        });
    });

    it("should generate an array of ref", () => {
        const schema = Type.Object({
            array: Type.Array(Type.String({ mongoose: { ref: "Ref2" } })),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            array: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Ref2",
                },
            ],
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
