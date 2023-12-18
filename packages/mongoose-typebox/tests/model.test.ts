import { Type } from "@sinclair/typebox";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { makeMongooseModel, typeboxToMongooseSchema } from "../src/parser";

const connectToDb = async () => {
    const url = "mongodb://localhost:27017/test";
    await mongoose.connect(url);
};

describe("Model tests", () => {
    beforeAll(async () => {
        await connectToDb();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    it("should", async () => {
        const schema = typeboxToMongooseSchema(
            Type.Object({
                firstName: Type.String(),
                lastName: Type.String(),
            }),
            {
                statics: {
                    findByFirstName: function (firstName: string) {
                        return this.find({ firstName });
                    },
                },
                methods: {
                    getFullName: function () {
                        return `${this.firstName} ${this.lastName}`;
                    },
                },
            }
        );

        schema.pre("save", function (next) {
            expect(true).toBe(true);
            next();
        });

        const model = makeMongooseModel("Users", schema);

        const doc = new model({
            firstName: "John",
            lastName: "Doe",
        });
        await doc.save();

        const retrievedDoc = await model.findByFirstName("John");
        expect(retrievedDoc).toHaveLength(1);

        expect(doc.getFullName()).toEqual("John Doe");
    });
});
