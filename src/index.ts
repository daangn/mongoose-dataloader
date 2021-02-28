import DataLoader from 'dataloader'
import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
import { Document, FilterQuery, Model } from 'mongoose'

export class MongoLoader {
  private _loaderMap = new Map<string, MongoLoaderByModel<any, any>>()

  model<D extends Document>(
    model: Model<D>
  ): {
    by: <K extends D[keyof D]>(
      key: keyof D,
      where?: FilterQuery<D>
    ) => MongoLoaderByModel<D, K>
  } {
    return {
      by: (key, conditions = {}) => {
        const cacheKey = `${model.modelName}#${key}#${JSON.stringify(
          conditions
        )}`

        const loader = this._loaderMap.get(cacheKey)

        if (loader) {
          return loader
        }

        const newLoader = new MongoLoaderByModel<D, D[typeof key]>(
          model,
          key,
          conditions
        )
        this._loaderMap.set(cacheKey, newLoader)

        return newLoader
      },
    }
  }
}

export class MongoLoaderByModel<
  D extends Document,
  K extends D[keyof D]
> extends DataLoader<K, D | null> {
  constructor(model: Model<D>, key: keyof D, conditions: FilterQuery<D>) {
    super(
      (ids) => {
        return Promise.resolve()
          .then(() => {
            return model
              .find({
                ...conditions,
                [key]: { $in: ids },
              })
              .exec()
          })
          .then((documents) => {
            const documentsMap = keyBy(documents, key)
            return ids.map((id) => get(documentsMap, id as any, null))
          })
      },
      {
        maxBatchSize: 100,
      }
    )
  }
}
