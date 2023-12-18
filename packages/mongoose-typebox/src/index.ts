import { SchemaTypeOptions } from "mongoose";
import { typeboxToMongooseSchema, makeMongooseModel } from "./parser";

export { typeboxToMongooseSchema, makeMongooseModel };

declare module "@sinclair/typebox" {
    interface SchemaOptions {
        mongoose?: SchemaTypeOptions<any>;
    }
}
