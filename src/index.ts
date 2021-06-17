import DataLoader from 'dataloader'
import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
import { Document, DocumentDefinition, FilterQuery, Model } from 'mongoose'

type OnlyKeys<T extends {}> = {
  [key in keyof T as T[key] extends string | number ? key : never]: T[key]
}

type KeyType<Doc, KeyName extends string | number | symbol> = Doc extends {
  [key in KeyName]: unknown
}
  ? Doc[KeyName]
  : unknown

export function mongooseDataloader() {
  const loaderMap = new Map<string, DataLoader<any, any>>()

  function use<
    Doc extends Document,
    KeyName extends keyof OnlyKeys<DocumentDefinition<Doc>>
  >(
    model: Model<Doc>,
    {
      key,
      where = {},
    }: {
      key: KeyName
      where?: FilterQuery<Doc>
    }
  ): DataLoader<KeyType<Doc, KeyName>, Doc | null> {
    const cacheKey = [model.modelName, key, JSON.stringify(where)].join('#')
    const loader = loaderMap.get(cacheKey)

    if (loader) {
      return loader
    }

    const newLoader = new DataLoader<KeyType<Doc, KeyName>, Doc | null>(
      async (ids) => {
        const docs = await model.find({
          ...where,
          [key]: { $in: ids },
        })
        const docMap = keyBy(docs, key)
        return ids.map((id) => get(docMap, id as string | number, null))
      },
      {
        maxBatchSize: 100,
      }
    )

    loaderMap.set(cacheKey, newLoader)
    return newLoader
  }

  return {
    use,
  }
}
