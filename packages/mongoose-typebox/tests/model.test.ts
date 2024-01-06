import { Type } from "@sinclair/typebox";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import {
  makeMongooseModel,
  parseObject,
  typeboxToMongooseSchema,
} from "../src/parser";

const connectToDb = async () => {
  const url = "mongodb://127.0.0.1:27017/test";
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
    const tSchema = Type.Object({
      firstName: Type.String({ mongoose: { unique: true } }),
      lastName: Type.String(),
      nested: Type.Object({
        nestedString: Type.String(),
      }),
    });
    const schema = typeboxToMongooseSchema(tSchema, {
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
    });

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
    expect(tSchema.properties.firstName.mongoose).not.toBeDefined();
  });
});
