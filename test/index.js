import test from 'ava'
import { createStore } from '../src'

test('createStore.query should return matching entities', t => {
  const store = createStore({
    updateEntity: (x, y) => y,
    getEntityKey: x => x
  })
  const input = [1, 2, 3, 4, 5]
  store.add(input)
  const output = store.query(x => x < 3)
  t.deepEqual(output, [1, 2])
})

test('createStore.subscribe should prime callback', t => {
  const store = createStore({
    updateEntity: (x, y) => y,
    getEntityKey: x => x
  })
  const input = [1, 2, 3, 4, 5]
  store.add(input)
  store.subscribe({
    predicate: () => true,
    callback (output) {
      t.deepEqual(output, input)
    }
  })
})

test('createStore.subscribe should cancel', t => {
  t.plan(0)

  const store = createStore({
    updateEntity: (x, y) => y,
    getEntityKey: x => x
  })
  let isPrimed = false
  const cancel = store.subscribe({
    predicate: () => true,
    callback () {
      if (!isPrimed) {
        isPrimed = true
        return
      }

      t.fail()
    }
  })

  cancel()
  store.add([1])
})

test('createStore.subscribe should notify when a matching entity is added', t => {
  const store = createStore({
    updateEntity: (x, y) => y,
    getEntityKey: x => x
  })
  store.add([1, 2, 3, 5])
  let isPrimed = false
  store.subscribe({
    predicate: x => x < 5,
    callback (output) {
      if (!isPrimed) {
        isPrimed = true
        return
      }

      t.deepEqual(output, [1, 2, 3, 4])
    }
  })

  store.add([4])
})

test('createStore.subscribe should not notify when a not matching entity is added', t => {
  t.plan(0)
  const store = createStore({
    updateEntity: (x, y) => y,
    getEntityKey: x => x
  })
  store.add([1, 2, 3])
  let isPrimed = false
  store.subscribe({
    predicate: x => x < 5,
    callback (output) {
      if (!isPrimed) {
        isPrimed = true
        return
      }

      t.fail()
    }
  })

  store.add([5])
})

test('createStore.subscribe should notify when a matching entity is removed', t => {
  const store = createStore({
    updateEntity: (x, y) => y,
    getEntityKey: x => x
  })
  store.add([1, 2, 3, 4, 5])
  let isPrimed = false
  store.subscribe({
    predicate: x => x < 5,
    callback (output) {
      if (!isPrimed) {
        isPrimed = true
        return
      }

      t.deepEqual(output, [1, 2, 3])
    }
  })

  store.remove([4])
})

test('createStore.subscribe should not notify when a not matching entity is removed', t => {
  t.plan(0)

  const store = createStore({
    updateEntity: (x, y) => y,
    getEntityKey: x => x
  })
  store.add([1, 2, 3])
  let isPrimed = false
  store.subscribe({
    predicate: x => x < 5,
    callback (output) {
      if (!isPrimed) {
        isPrimed = true
        return
      }

      t.fail()
    }
  })

  store.remove([5])
})
