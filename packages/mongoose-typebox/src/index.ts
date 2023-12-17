import { SchemaTypeOptions } from "mongoose";
import { typeboxToMongooseSchema } from "./parser";

export { typeboxToMongooseSchema };

declare module "@sinclair/typebox" {
    interface SchemaOptions {
        mongoose?: SchemaTypeOptions<any>;
    }
}
