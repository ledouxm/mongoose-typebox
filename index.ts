import {
  NumericOptions,
  StringOptions,
  TArray,
  TEnum,
  TObject,
  TRef,
  TSchema,
} from '@sinclair/typebox';
import {
  SchemaDefinition,
  SchemaDefinitionProperty,
  SchemaDefinitionType,
} from 'mongoose';

function createMongooseSchemaFromTypeBox(schema: TObject) {
  return parseObject(schema);
}

function parse(entry: TSchema): SchemaDefinitionProperty<any> {
  if (isPrimitive(entry)) {
    return parsePrimitive(entry);
  } else if (entry.type === 'object') {
    return parseObject(entry as TObject);
  } else if (entry.type === 'array') {
    return parseArray(entry as TArray);
  } else if ('$ref' in entry) {
    return parseRef(entry as TRef);
  } else if ('anyOf' in entry) {
    return parseEnum(entry as TEnum);
  }

  throw new Error(`could not parse entry: ${JSON.stringify(entry)}`);
}

function isPrimitive(entry: TSchema) {
  return ['string', 'integer', 'number', 'boolean'].includes(entry.type);
}

function parsePrimitive(entry: TSchema) {
  const type = entry.type;

  if (type === 'string') {
    const e = entry as StringOptions<typeof entry.format>;
    const def: SchemaDefinitionProperty<any> = {};

    def.type = String;

    if (e.maxLength) {
      def.maxlength = e.maxLength;
    }

    if (e.minLength) {
      def.minlength = e.minLength;
    }

    return def;
  }

  if (type === 'number' || type === 'integer') {
    const e = entry as NumericOptions;
    const def: SchemaDefinitionProperty<any> = {};

    def.type = Number;

    if (e.minimum) {
      def.min = e.minimum;
    }

    if (e.maximum) {
      def.max = e.maximum;
    }

    return def;
  }

  if (type === 'boolean') {
    return { type: Boolean };
  }

  throw new Error(`${type} in primitive not handled yet`);
}

function parseObject(entry: TObject) {
  const objectDef: SchemaDefinition<SchemaDefinitionType<any>> = {};

  if (!!entry.instanceOf) {
    const type = entry.instanceOf;

    if (type === 'Date') {
      return { type: Date };
    }

    throw new Error(`unhandled instanceOf ${type}`);
  }

  for (const key in entry.properties) {
    const property = entry.properties[key];
    const def: any = parse(property);

    if (def) {
      if (def.type && entry.required?.includes(key)) {
        // FIXME: uncommenting this causes the property of optional property to be tagged as required
        // def.required = 'true';
      }

      if (property.default) {
        def.default = property.default;
      }

      objectDef[key] = def;
    }
  }

  return objectDef;
}

function parseArray(entry: TArray) {
  const itemDef: any = parse(entry.items);
  const def: SchemaDefinitionProperty<Array<any>> = {};

  def.type = isPrimitive(itemDef) ? [itemDef.type] : [itemDef];

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
  const def: any = parse({ ...options[0] });

  def.enum = values;

  return def;
}

export default createMongooseSchemaFromTypeBox;
