# YJS

[Yjs](https://github.com/yjs/yjs) is a small, high performant [CRDT](https://crdt.tech/implementations) implementation exposing its internal data representation as **shared types**.

These **shared types** include

- Y.Map
- Y.Array
- Y.Text
- Y.Xml

These types are automatically merged and changes are tracked.

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

### Attributions

The info for this lab was sourced from Kevin Jahn's talk "[Yjs: A CRDT framework for shared editing Enable shared editing in every application](https://www.youtube.com/watch?v=RqXMh4C_HkI)" and from the [Yjs docs](https://github.com/yjs/yjs/blob/master/README.md).
