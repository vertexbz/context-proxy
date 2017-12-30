# context-proxy

context-proxy traps calls in exactly the same way as normal js Proxy, but `this` context of every trap will be `context` parameter of constructor or function call.

## Usage

```js
import CProxy from 'context-proxy';

const target = {}; // proxy target

const context = {/* context */};


const proxy = CProxy(target, {/* handlers */}, context);
// or with new operator
const proxy = new CProxy(target, {/* handlers */}, context);

```