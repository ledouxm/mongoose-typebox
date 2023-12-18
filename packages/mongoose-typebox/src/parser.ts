import { Kind, Static, TArray, TEnum, TObject, TRef, TSchema } from "@sinclair/typebox";
import mongoose, {
    Model,
    SchemaDefinition,
    SchemaDefinitionType,
    SchemaOptions,
    SchemaTypeOptions,
} from "mongoose";

export function typeboxToMongooseSchema<
    T extends TObject<any>,
    Extra extends SchemaOptions<Static<T>>
>(tSchema: T, options?: Extra) {
    type DocType = Static<T>;
    type ModelWithStatics = Model<DocType, {}, Extra["methods"] & Extra["virtuals"]> &
        Extra["statics"];

    const schemaDefinition = parseObject(tSchema);
    const schema = new mongoose.Schema<DocType, ModelWithStatics>(schemaDefinition, options);

    cleanTSchema(tSchema);

    return schema;
}

const cleanTSchema = (tSchema: TObject) => {
    Object.keys(tSchema.properties).forEach((key) => {
        delete tSchema.properties[key].mongoose;
    });
};

export function makeMongooseModel<DocType, ModelType>(
    name: string,
    schema: mongoose.Schema<DocType, ModelType>
) {
    return mongoose.model<DocType, ModelType>(name, schema);
}

function parse(entry: TSchema): SchemaTypeOptions<any> {
    if (isPrimitive(entry)) {
        return parsePrimitive(entry);
    } else if (entry.type === "object") {
        return parseObject(entry as TObject);
    } else if (entry.type === "array") {
        return parseArray(entry as TArray);
    } else if ("$ref" in entry) {
        return parseRef(entry as TRef);
    } else if ("anyOf" in entry) {
        return parseEnum(entry as TEnum);
    } else if (entry[Kind] === "Any") {
        return { type: mongoose.Schema.Types.Mixed };
    }

    throw new Error(`Could not parse entry: ${JSON.stringify(entry)}`);
}

function isPrimitive(entry: TSchema) {
    return primitiveTypes.includes(entry.type);
}

const primitiveTypes = ["string", "integer", "number", "boolean", "Date", "Uint8Array"];
const primitiveTypesMap = {
    string: String,
    integer: Number,
    number: Number,
    boolean: Boolean,
    Date: Date,
    Uint8Array: Buffer,
};

const optionsMap = {
    default: "default",
    minLength: "minlength",
    maxLength: "maxlength",
    minimum: "min",
    maximum: "max",
    minByteLength: "minlength",
    maxByteLength: "maxlength",
};

function getPrimitiveType(entry: TSchema) {
    const type: string = entry.type;

    if (entry.mongoose?.ref) {
        return mongoose.Types.ObjectId;
    }

    return primitiveTypesMap[type as keyof typeof primitiveTypesMap];
}

function parsePrimitive(entry: TSchema) {
    const def: SchemaTypeOptions<any> = {};

    def.type = getPrimitiveType(entry); //primitiveTypesMap[type as keyof typeof primitiveTypesMap];

    for (const key in entry) {
        if (key in optionsMap) {
            def[optionsMap[key as keyof typeof optionsMap]] = entry[key];
        }
    }

    return { ...entry.mongoose, ...def };
}

export function parseObject(entry: TObject) {
    const objectDef: SchemaDefinition<SchemaDefinitionType<any>> = {};

    for (const key in entry.properties) {
        const property = entry.properties[key];
        const def = parse(property);
        if (def) {
            if (def.type && def.type !== mongoose.Types.ObjectId && entry.required?.includes(key)) {
                def.required = true;
            }

            objectDef[key] = def;
        }
    }

    return objectDef;
}

function parseArray(entry: TArray) {
    const itemDef = parse(entry.items);
    const def: SchemaTypeOptions<Array<any>> = {};

    if (itemDef.ref) {
        return [itemDef];
    }

    def.type = isPrimitive(entry.items) ? [itemDef.type] : [itemDef];

    return def;
}

function parseRef(entry: TRef) {
    return {
        type: String,
        ref: entry.$ref,
    };
}

function parseEnum(entry: TEnum) {
    const options = entry.anyOf;
    const values = options.map((option) => option.const ?? option.static);
    const def = parse({ ...options[0] });

    def.enum = values;

    return def;
}
