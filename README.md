# Storeo
> A data store with subscriptions

[![npm](https://img.shields.io/npm/v/storeo.svg)](https://www.npmjs.com/package/storeo)

The data store manages "entities" (values, objects).
Entities can be added, removed, and updated.
Queries can be performed on the store using predicates (filters).
Subscriptions are notified as entities matching their predicates change.

## Purpose

Storeo was designed to be an in-memory store for client-side applications.
It can serve as both a caching layer and reconciler for data change.

Storing the results of HTTP requests, we can save on future similar requests.
Updating the store with real-time events, we can live-update subscriptions.
Updating the store with user changes, we can synchronize views.

Storeo also works on Node.

## Example

```js
import { createStore } from 'storeo'

const store = createStore({
  // return a unique identifier for an "entity"
  // key is toString'd for indexing
  getEntityKey: entity => entity.id,

  // update the stored entity based on new information
  // could be a full replacement or some kind of merge
  updateEntity: (currentEntity, incomingEntity) => incomingEntity
})

store.add([
  { id: 1, name: 'Cake' },
  { id: 2, name: 'Ham' }
])

// one-shot queries
const entities = store.query(entity => true) // return all

// live updating queries
const cancelSubscription = store.subscribe({
  predicate: entity => entity.name.startsWith('C'),
  callback (entities) {
    /*
    called with all matching entities when
      - the subscription is created
      - entries matched the predicate are added/removed/updated
    */
  }
})

// remove entities
store.remove([{ id: 1 }])

// stop receiving updates
cancelSubscription()
```

## The name

Storeo has the word "store" in it.
Storeo stores entities.

Storeo is one letter away from "stereo."
Stereos broadcast music to listeners, kind of like subscriptions.

Storeo contains the word "oreo."
Storeo was designed as a reconciler between client/server data.
The client and server are the cookie, Storeo is the filling.