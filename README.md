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

```ts
// Declare a typescript schema
const userTSchema = Type.Object({
    username: Type.String({ minLength: 3, maxLength: 20, mongoose: { unique: true } }),
    password: Type.Optional(Type.String({ minLength: 6 })),
});

// Convert it
const mongooseSchema = typeboxToMongooseSchema(userTSchema);

// Use it
const userModel = mongoose.model("Users", mongooseSchema);
const users = await userModel.find();
```

## Versions

This lib has been tested using mongoose ^7 and ^8, and typebox ^0.31.28
