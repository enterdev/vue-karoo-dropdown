## Vue dropdown component with search option

### Install
```bash
npm install @enterdev/vue-karoo-dropdown
yarn add @enterdev/vue-karoo-dropdown
```

```js
import Vue from "vue";
```

**ES6**
```js
import vDropdown from "@enterdev/vue-karoo-dropdown";
```

**CommonJS**
```js
var vDropdown = require('@enterdev/vue-karoo-dropdown');
```
**Component setup**
```js
Vue.component("vue-dropdown", vDropdown);
```

### Typical use:
``` html
<vue-dropdown
    v-model="property"
    v-bind:options="[
        { label: 'Latvia', code: 'lv' },
        { label: 'Lithuania', code: 'lt' },
        { label: 'Estonia', code: 'ee' },
        { label: 'Sweden', code: 'se' },
        { label: 'Finland', code: 'fi' }
    ]"
    v-bind:text-field="'label'"
    v-bind:value-field="'code'"
    v-bind:options-label="'Select'"/>
```

### Styles: (must be added manually)

```js
import "dist/vue-dropdown.css";
```

### Demo
[This is an external link to demo](https://codesandbox.io/s/youthful-currying-q3481s)

### License
```
MIT License
```