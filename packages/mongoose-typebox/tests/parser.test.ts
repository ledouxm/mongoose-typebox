import { Type } from "@sinclair/typebox";
import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import { parseObject } from "../src/parser";

describe("Parser tests", () => {
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
                maxlength: 10,
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

    it("should generate an enum with string literals", () => {
        const schema = Type.Object({
            literal: Type.Union([
                Type.Literal("placed"),
                Type.Literal("approved"),
                Type.Literal("delivered"),
            ]),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            literal: {
                type: String,
                enum: ["placed", "approved", "delivered"],
                required: true,
            },
        });
    });

    it("should generate an enum with an enum", () => {
        enum Status {
            Placed = "placed",
            Approved = "approved",
            Delivered = "delivered",
        }

        const schema = Type.Object({
            literal: Type.Enum(Status),
        });

        const mongooseSchemaDef = parseObject(schema);
        expect(mongooseSchemaDef).toEqual({
            literal: {
                type: String,
                enum: ["placed", "approved", "delivered"],
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
                type: mongoose.Types.ObjectId,
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
                    type: mongoose.Types.ObjectId,
                    ref: "Ref2",
                },
            ],
        });
    });
});
