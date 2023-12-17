import { Kind, Static, TArray, TEnum, TObject, TRef, TSchema } from "@sinclair/typebox";
import mongoose, {
    SchemaDefinition,
    SchemaDefinitionType,
    SchemaOptions,
    SchemaTypeOptions,
} from "mongoose";

export function typeboxToMongooseSchema<
    T extends TObject<any>,
    Extra extends SchemaOptions<Static<T>>
>(schema: T, options?: Extra) {
    const schemaDefinition = parseObject(schema);
    const mongooseSchema = new mongoose.Schema<DocTypeWithMethods<T, Extra>>(
        schemaDefinition,
        options
    );

    return mongooseSchema;
}

type DocTypeWithMethods<T extends TObject, Extra extends SchemaOptions<Static<T>>> = Static<T> &
    Extra["methods"];

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
    maxLength: "maxlength",
    minLength: "minlength",
    minimum: "min",
    maximum: "max",
    default: "default",
    minByteLength: "minlength",
};

function getPrimitiveType(entry: TSchema) {
    const type: string = entry.type;

    if (entry.mongoose?.ref) {
        return mongoose.Schema.Types.ObjectId;
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
            if (
                def.type &&
                def.type !== mongoose.Schema.Types.ObjectId &&
                entry.required?.includes(key)
            ) {
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
