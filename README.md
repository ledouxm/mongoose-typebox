# mongoose-typebox

Convert a **typebox** schema into a **mongoose** schema

## Installation

```bash
npm i mongoose-typebox --save
```

```bash
yarn add mongoose-typebox
```

```bash
pnpm i mongoose-typebox
```

```bash
bun i mongoose-typebox
```

Or whatever we use these days

## Usage

### Basic

Some mongoose options are automatically inferred from typebox options :
| **typebox** | **mongoose** |
|---------------|--------------|
| minLength | minlength |
| maxLength | maxlength |
| minimum | min |
| maximum | max |
| minByteLength | minlength |

All of them options are available in `{ mongoose: { ... } }` (these **overwrites** the ones above)

```ts
// Declare a typescript schema
const userTSchema = Type.Object({
    username: Type.String({
        minLength: 3,
        maxLength: 20,
        mongoose: { unique: true },
    }),
    password: Type.String({ minLength: 6 }),
    firstName: Type.String(),
    lastName: Type.String(),
    middleName: Type.Optional(Type.String()),
});

// Convert it
const userSchema = typeboxToMongooseSchema(userTSchema);
// Use it
const userModel = mongoose.model("Users", userSchema);

const users = await userModel.find();
```

### Extra data

#### Methods & Statics

Anything you would've used as the second arg in `new mongoose.Schema()`, you can use as the second arg of `typeboxToMongooseSchema`

> :warning: However, virtuals are not yet supported

```ts
const userSchema = typeboxToMongooseSchema(userTSchema, {
    toJSON: {
        transform: function (_doc, ret) {
            delete ret.password;
        },
    },
    methods: {
        getFullName: function () {
            return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(" ");
        },
    },
    statics: {
        getByFirstName: function (firstName: string) {
            return this.find({ firstName });
        },
    },
});

const userModel = makeMongooseModel("Users", userSchema);
```

Since mongoose.Model is a generic type, you **must** use the `makeMongooseModel` helper function to keep **statics and methods type-safety**

### How to get x mongoose types

#### Enum

```ts
Type.Union([Type.Literal("on"), Type.Literal("off")]);
```

or

```ts
enum Status {
    On = "on",
    Off = "off",
}

Type.Enum(Status),
```

#### Buffer

```ts
Type.Uint8Array();
```

#### Mixed

```ts
Type.Any();
```

#### ObjectId (Ref)

```ts
Type.String({ ref: "Ref" });
```

or if the relation is 0,n

```ts
Type.Array(Type.String({ ref: "Ref" }));
```

#### Decimal128

```ts
Type.Number({ mongoose: { type: mongoose.Types.Decimal128 } });
```

#### BigInt

```ts
Type.Number({ mongoose: { type: mongoose.Types.BigInt } });
```

#### UUID

```ts
Type.String({ mongoose: { type: mongoose.Types.UUID } });
```

#### Map

:warning: Not supported

## Usage with Fastify

If you use this lib along with fastify, you may need to use this snippet

```ts
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = addFormats(new Ajv({}), [
    "date-time",
    "time",
    "date",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uri",
    "uri-reference",
    "uuid",
    "uri-template",
    "json-pointer",
    "relative-json-pointer",
    "regex",
]).addKeyword("mongoose");

server.setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema);
});
```

## Versions

This lib has been tested using mongoose ^7 and ^8, and typebox ^0.31.28
