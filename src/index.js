exports.createStore = function createStore ({
  getEntityKey,
  updateEntity,

  entityStore = {},
  entityDependentStore = {},
  subscriptions = new Set()
}) {
  function notify (subscriptions) {
    subscriptions.forEach(subscription => {
      const entities = []
      subscription.entities.forEach(key => {
        entities.push(entityStore[key])
      })
      subscription.callback(entities)
    })
  }

  return {
    add (entities) {
      const effectedSubscriptions = new Set()

      entities.forEach(entity => {
        const entityKey = getEntityKey(entity).toString()
        const existingEntity = entityStore[entityKey]
        const updatedEntity = updateEntity(existingEntity, entity)

        let activeSubscriptions = entityDependentStore[entityKey]
        if (!activeSubscriptions) {
          activeSubscriptions = entityDependentStore[entityKey] = new Set()
        }

        subscriptions.forEach(subscription => {
          let isActive = false
          const startSize = activeSubscriptions.size
          if (subscription.predicate(entity)) {
            activeSubscriptions.add(subscription)
            subscription.entities.add(entityKey)
            isActive = true
          } else {
            activeSubscriptions.delete(subscription)
            subscription.entities.delete(entityKey)
          }

          if (isActive || startSize !== activeSubscriptions.size) {
            effectedSubscriptions.add(subscription)
          }
        })

        if (!activeSubscriptions.size) {
          delete entityDependentStore[entityKey]
        }

        entityStore[entityKey] = updatedEntity
      })

      notify(effectedSubscriptions)
    },

    remove (entities) {
      const effectedSubscriptions = new Set()

      entities.forEach(entity => {
        const key = getEntityKey(entity).toString()
        const dependentSubscriptions = entityDependentStore[key]
        if (dependentSubscriptions) {
          dependentSubscriptions.forEach(subscription => {
            effectedSubscriptions.add(subscription)

            subscription.entities.delete(key)
          })
        }
        delete entityStore[key]
        delete entityDependentStore[key]
      })

      notify(effectedSubscriptions)
    },

    query (predicate) {
      const results = []
      for (const key in entityStore) {
        const entity = entityStore[key]
        if (predicate(entity)) {
          results.push(entity)
        }
      }
      return results
    },

    subscribe (subscription) {
      const { predicate } = subscription
      const entities = new Set()
      for (const key in entityStore) {
        if (predicate(entityStore[key])) {
          entities.add(key)
          let dependentSubscriptions = entityDependentStore[key]
          if (!dependentSubscriptions) {
            dependentSubscriptions = entityDependentStore[key] = new Set()
          }
          dependentSubscriptions.add(subscription)
        }
      }

      subscription.entities = entities
      subscriptions.add(subscription)
      notify([subscription])

      return () => {
        subscriptions.delete(subscription)
      }
    }
  }
}
