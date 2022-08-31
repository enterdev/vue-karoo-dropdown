## Vue dropdown component with search option

### Install
```bash
npm install vue-karoo-dropdown
yarn install vue-karoo-dropdown
```

```js
import Vue from "vue";
```

**ES6**
```js
import vDropdown from "vue-karoo-dropdown";
```

**CommonJS**
```js
var vDropdown = require('vue-karoo-dropdown');
```
**Component setup**
```js
Vue.component("vue-dropdown", vDropdown);
```

### Typical use:
``` html
<vue-dropdown
    v-model="property"
    v-bind:options="[{label: 'Canada', code: 'ca'},{label: 'Latvia', code: 'lv'}]"
    v-bind:text-field="'label'"
    v-bind:value-field="'code'"
    v-bind:options-label="'Select'"/>
```

### Styles: (must be added manually)

```js
import "vue-select/dist/vue-dropdown.css";
```

### License
```
MIT License
```