# 🖇 Mongoose DataLoader

[![](https://img.shields.io/npm/v/mongoose-dataloader)](https://www.npmjs.com/package/mongoose-dataloader)
[![](https://img.shields.io/bundlephobia/min/mongoose-dataloader)](https://bundlephobia.com/result?p=mongoose-dataloader)

Helps to avoid declaring [DataLoader](https://github.com/graphql/dataloader) every [Mongoose](https://mongoosejs.com/) model.

## What is the `DataLoader`?

- [DataLoader](https://github.com/graphql/dataloader)
  > DataLoader is a generic utility to be used as part of your application's data fetching layer to provide a simplified and consistent API over various remote data sources such as databases or web services via batching and caching.

## Install

```bash
$ yarn add mongoose-dataloader
```

## Usage

### Step 1. Create `mongooseDataloader` per request

```typescript
import { ApolloServer } from 'apollo-server'
import { mongooseDataloader } from 'mongoose-dataloader'

const apolloServer = new ApolloServer({
  // ...
  async context(/* ... */) {
    // ...

    const mongo = mongooseDataloader()

    return {
      mongo,
    }
  },
})
```

### Step 2. Use it with `mongoose.model`

```typescript
import mongoose from 'mongoose'

// Mongoose model declaration
const Article = mongoose.model(
  'Article',
  new Schema({
    user: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      required: true,
    },
  })
)

// Use it
const resolvers = {
  Something: {
    async someField(parent, args, ctx) {
      // ...

      const article = await ctx.mongo
        .use(Article, {
          key: '_id',
        })
        .load(/* ... */)

      // or with some additional conditions
      const article = await ctx.mongo
        .use(Article, {
          key: '_id',
          where: {
            user: 'SOME_USER_ID',
            deleted: false,
          },
        })
        .load(/* ... */)
    },
  },
}
```

## References

- [`graphql-dataloader-mongoose`](https://github.com/naver/graphql-dataloader-mongoose)
- [DataLoader](https://github.com/graphql/dataloader)
- [Mongoose](https://mongoosejs.com/)

## License

[Apache 2.0](./LICENSE)
