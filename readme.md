# YJS

_This repo serves as an in-depth explanation of Yjs. It is for my own reference (and others if they find it useful :))._

##### [Click here for an overview of CRDTs and why they exist!](https://github.com/jaqarrick/yjs-lab/blob/main/crdt.md)

[Yjs](https://github.com/yjs/yjs) is a small, high performant [CRDT](https://crdt.tech/implementations) implementation exposing its internal data representation as **shared types**.

These **shared types** include

- Y.Map
- Y.Array
- Y.Text
- Y.Xml

These types are automatically merged and changes are tracked.

#### Y.Doc()

Yjs documents are collections of shared objects / types that sync automatically.

```
const doc = new Y.Doc()
```
Every change happens inside a **transaction**:

`doc.transact(function(Transaction): void [, origin:any])`

Ydoc events are called in the following order: 

1. `ydoc.on('beforeTransaction', event => { .. })`
2. The transaction is executed.
3. `ydoc.on('beforeObserverCalls', event => {})`
4. `ytype.observe(event => { .. }) `
5. `ytype.observeDeep(event => { .. }) `
6. `ydoc.on('afterTransaction', event => {}) `
7. `ydoc.on('update', update => { .. }) `


#### Yjs Ecosystem

There are is a huge ecosystem of **modules** that work together with Yjs. There are three general categories of modules.

1. **Connectors**
   These deal with how Yjs connects and shares data using different communication protocols. - _y-webrtc_ - _y-websocket_ - _y-dat (WIP)_
2. **Persistence**
   Store data in a database (either server or browser side) - _y-indexeddb_ - _y-redis_ - _y-leveldb_
3. **Editor Bindings**
   Connect yjs to existing editors - _y-prosemirror_ - _y-quill_ - _y-codemirror_ - _y-ace_ - _y-monaco_ - _y-gutenberg (WIP)_

### Demo

The enclosed demo is a simple showcase of Yjs' `Y.doc` and `Y.array`, shared over `y-websocket`. The app is a simple canvas, which allows multiple users to draw and erase shapes.

Check it out [here](https://github.com/jaqarrick/yjs-lab/tree/main/demo)!

### Detailed Overview

_This section is a summary of the following sources: [YJS Internals](https://github.com/yjs/yjs/blob/main/INTERNALS.md), "[How Yjs works from the inside out](https://www.youtube.com/watch?v=0l5XgnQ6rB4)"._ 

#### List Items
All objects/types in YJS are stored in a list, making YJS a **list CRDT**. `yArray`, for example are _lists of arbitrary items_. `yText` is a _list of characters_, where multiple characters can be wrapped in a single linked list `Item`. `yMap` are _lists of entries_, where the last inserted entry for each key is used and other duplicates with each key are flagged and deleted. 

An `Item` is made up of two objects: 
- An `Item` used to relate the item to adjacent ones. 
- An `AbstractType` Object, which can be `yText` for instance. 

The item's `content` maps to the `AbstractType` object, and the `AbstractType` object's `_item` field references the item. 

Each client is assigned a 53-bit integer `clientID` property on first insert. 
All inserted items are given a unique ID, formed from the `clientID` and `clock` that counts up from 0 after first insertion. 

See in [/src/utils/ID.js](https://github.com/yjs/yjs/blob/main/src/utils/ID.js):
```
export class ID {
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor (client, clock) {
    /**
     * Client id
     * @type {number}
     */
    this.client = client
    /**
     * unique per client id, continuous number
     * @type {number}
     */
    this.clock = clock
  }
}
```

Items also stores references to the IDs of the preceding and succeeding item as `origin` and `originRight`, used when peers concurrently insert at the same location in a document. 

##### Multiple Characters 
A run of characters like `"abc"` are treated as a single item in YJS, only if they are inserted by the same client, they're inserted in order, and all characters have either been deleted or all characters are not deleted. The item will be split if the run is interrupted.  

##### Item Storage

Items are stored in a tree of doubly-linked lists in _document order_, where each item has `left` and `right` properties linking to its siblings and a `parent` property. 

These items are _also referenced in insertion order_ inside the struct store, in chronological order. This is in order to find an item in the tree with a given ID and to efficiently gather the operations a peer is missing during sync. 

**Caching**: Yjs stores a cache of the 10 most recently lookup up insert positions in the document. This helps out with performance significantly. For instance if a client wants to insert something at position 1000, it is likely that the `Item` currently at that position lives in the cache. Reducing the time from O(n) in a linear search. 

##### Reference for `Item`

 Property | Type | Description 
 --- | --- | ---
 `origin` | `ID or null` | The item that was originally to the left of current item
 `left` | `Item or null` | The item that is currently to the left of the item
 `right` | `Item or null` | The item that is currently to the right of this item 
 `parent` | `String or null` | If the parent refers to the current item with a key, they key refers to the list in which to insert this item. 
 `content` | `number` | Maps to the `AbstractType` object




##### Deletions in Yjs
Deletions are handled quite differently from insertions. Insertions are a treated as a sequential operation based CRDT, whereas deletions are treated as a simpler, state based CRDT. 
- No data is kept about when an item was deleted, or which user deleted it. 
- The struct store doesn't contain any deletion records. 
- The clientID's clock isn't incremented.

If garbage collection is enabled and a deleted objet contains children, the content is replaced with a `GC` object, which only stores the length of the removed content. 

Two mechanisms occur when something has been deleted: 
1. The ID(s) of the deleted item(s) are listed locally inside the transaction. 
2. A snapshot is specified using both the ID mappings and the set of all deleted items. Although this takes O(n) time, realistically this data set is tiny. 

##### Transactions
All updates in Yjs happen within a transaction. (Defined in src/utils/Transaction.js.), which collects a set of updates to the yDoc to be applied on remote peers atomically. 

When a transaction has been committed locally, it generates a compressed _update message_ which is sent to the synchronized remote peers to notify them of the change. This message contains: 
- The set of newly inserted items.
- The set of items deleted within the transaction.

### Attributions
The info for this lab was sourced from Kevin Jahn's talk "[Yjs: A CRDT framework for shared editing Enable shared editing in every application](https://www.youtube.com/watch?v=RqXMh4C_HkI)" and from the [Yjs docs](https://docs.yjs.dev/).
