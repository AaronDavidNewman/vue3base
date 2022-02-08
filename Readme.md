<sub>[Github](https://github.com/AaronDavidNewman/vue3base) code [demo](https://aarondavidnewman.github.io/vue3base/src/index.html) component</sub>
## VUE3 SFC component example (using webpack)

I created this project with 2 goals in mind: 
1. create a VUE3+SFC+webpack template to use for other projects
2. create a complete implementation of a VUE component using the composition API, in something resembling a real-world situation

The components simulate a tree selection, by using a series of 'select' controls that represent levels of the tree.  Choosing a parent populates child branches and enables more lists.  You can demo the component [here](https://aarondavidnewman.github.io/vue3base/src/index.html)

It looks like this:

![](https://imgur.com/7Ao9kJj.png)

In practice, the sample data represents a tree with only one branch per level, but the same component logic will work with a full tree structure.

## How it works
To implement the tree browser, there are 3 components and a [composition function](https://v3.vuejs.org/guide/composition-api-introduction.html#standalone-computed-properties).  There is also some sample data which simulates a repository that could supply different tree data.

The `setup` function in the top-level component creates reactive variables that are changed in response to the selection in the child components:

``` javascript
 setup(props) {
    const selectedTree = ref('');
    const selectedLevel = ref(-1);
    const { compLevels, treelist } = manageTree(selectedTree, selectedLevel);
```
`selectedTree` is set based on the first dropdown choice (the list of trees).  `selectedLevel` is set based on the other controls, representing the levels of the tree.

The last line calls the composition function, and gets the tree variables for the child controls.  The composition function maintains the reactive arrays that represent the drop-down lists, as they evolve from the user choices and data on the server.  `compLevels` controls the tree levels (treeview.vue), and `treelist` controls the list of trees available (treetop.vue).  The child components take these values as input variables.  Here is the template for the top-level (App.vue).

``` html
 <treetop :treelist="treelist" :domId="domId" @tree-selected="treeSelected"></treetop>
          <div v-for="level in compLevels" :key="level.id">
            <treeview
              :items="level.items"
              :label="level.label"
              :id="level.id"
              :level="level.level"
              @level-selected="levelSelected"
              :domId="domId"
            >
            </treeview>
          </div>
```
The child controls iterate through these arrays using the `v-for` template binding, and update whenever the variables change.  For instance, `compList.items` for the `treeview` object:

```html
<select @change="selected" :disabled="isDisabled">
    <option v-for="item in items" :key="item.label" v-bind:value="item.id">
        {{ item.label }}
    </option>
</select>
```
Selecting a new list calls the `selected` method of the component, which triggers a change in `selectedLevel`, which then updates the `items`, etc.

The composition function handles the logic of the trees, including getting the data from the repo, by `watch`ing the variables set by the dropdowns, and updating treelist and compLevels accordingly:

``` javascript
export default function manageTree(treeSelectionRef, levelSelectionRef) {
    const treelist = reactive([]);  // list of all available trees
    const compLevels = reactive([]); // branches of each level of the current tree
...
    populateTreeList();
    watch(treeSelectionRef, (value) => {
        treeSelected(value);
    });
    watch(levelSelectionRef, (value) => {
        getTreeLevel(value);
    });
```    

`treeSelected` and `getTreeLevel` are both implemented within the closure of the composition function.  This is the Composition API way.

## What I learned
### 1: Components are not objects - Composition API and setup
With the composition API, `setup` takes the place of a constructor for the component.  In `setup`, there is no reference to the component's 'this' object, nor a reference to the component itself.  So all the data that your component will ever need must be present in `setup` closure.

To provide seperation of concerns, you are expected to provide one or more 'composables', which is basically the logic for handling your components' data.  You pass the composable your reactive variables from the setup function, and it returns functions and other reactive variables that your component needs.

To me, this sounded a lot like the adapter pattern (the composible adapts the data so it updates the UI at the right time, and adapts the UI changes to the server/persistent store), so I called the directory 'adapters' instead of 'composibles' (also, composible is a strange word).

A component is just the reactive data that makes up the component, and the events that come from the DOM and other components.  If you are trying to make it into something else, you're doing it wrong and probably the logic you want belongs somewhere else.  Or maybe, the composition API is not for you.  I found [this nugget on SO:](https://stackoverflow.com/questions/64175377/using-this-in-lifecycle-hook-created-from-composition-api)


> If we bind the lifecycle hooks in setup to the instance, it would only cause confusion and encourage antipatterns. You make a choice, options api, or composition api. If you choose composition api, there is nothing interesting for you on `this`. Everything is contained in the setup closure. If we added it, typescript inference would be harder to implement, and people will start using the options api in combination with it.

Note that this only refers to the setup function and composition API.  You can still do it the old way (called `Options API').  Also, 'this' is available to call methods and reference data in methods called from DOM events, or events generated from other components.  But it is a bad idea to combine options API and composition API.  Forever will it rule your destiny, etc.  This is also something not clear from the Guide - most of the examples are options API.

### 2: Reactivity can be a little fragile
Tool kits like React, Angular, and Vue are made possible by the `Proxy` object built into Javascript.  I never even knew about this thing!  But it is pretty interesting. If you go:

``` javascript
const proxyObject = new Proxy(baseObject, myHandler);
```
you can return `proxyObject` in place of baseObject.  Any time `proxyObject` is referenced or changed, `myHandler` is notified of the change to `baseObject`.  This allows Vue to bind DOM elements to javascript variables.  It also allows values mutated in parent components to be updated in child components.

The 'any time' part is not quite true, because of the way references work.  (there is a name for this: "reactivity loss" )

if `proxyObject` is an array, for instance, it doesn't work to just say: 

``` javascript
proxyObject = [] // wrong way, reactivity is lost
```
to clear the array.  You need to go: 

``` javascript
proxyObject.splice(0) // right way, proxyObject remains reactive
```

Likewise if you have a javascript object, you need to individually assign each key to a value.  If you just go `proxyObject = someOtherObject`, the proxy reference is lost.

### 3. Making your data reactive
The key to understanding VUE 3 is to understand how to use the  reactive API.  It is possible to explicitly create refs to variables created outside the context of a component.  

1. use `toRef` to make a field of an object passed into `setup` reactive.
2. use `ref` or `reactive` to make variables you declare yourself reactive.
3. use `reactive` to make an object or array reactive, `ref` to make a literal (a number, string, or boolean) reactive.  Arrays can use either `ref` or `reactive` but I prefer the `reactive` syntax.

**Note and Warning** about `reference unwrapping`:
If you use `ref` or `toRef`, you reference the value of the variable `foo` with `foo.value`.  However, if this is a prop, in templates and in methods (any context where `this` is implied), the variable is reference as `this.foo`, _not_ `this.foo.value`.  

Fields within objects created with `reactive` are still `obj.foo`, and not `obj.foo.value`.   Just remember that you can't go `obj = otherObj` - you will lose the reactivity of `obj`.  Instead, assign the object key values: from `obj[field1] = otherObj[field1]`.

If you want to make a non-reactive value passed in as a prop reactive, you can use 'toRef':

``` javascript
const someValue = props.someValue; // someValue is _not_ reactive
const someValue = toRef(props, 'someValue'); // someValue is now reactive
const someObject = props.someObject;
const field1 = toRef(someObject, 'field1'); // make props.someObject.field1 reactive
```

### 4: Each .vue file is a single component
This is a hard rule for SFC that isn't emphasized in the documentation.  Apparently all the tooling is dependent on each component being the default export from the module.  So each component will start like:

`myComponent.vue`:
``` javascript
export default defineComponent({
    ...
});
```
and when importing components into your javascript, you need to go:

``` javascript
import { default as myComponent } from './components/myComponent.vue';
```

it does _not_ work to `export const myComponent = ...` or `import { myComponent }...` or `import *`.

You can export several components as child components:

`myComponent.vue`:
``` javascript
import { default as childCompA } from './someComp.vue';
import { default as childCompB } from './someOtherComp.vue';
export default defineComponent({
    components: { childCompA, childCompB }
    ...
});
```
as long as myComponent is the default component from that module.

### 5: VUE Rendering optimizations can sometimes have side-effects
I believe this only affects the built-in select control using the disabled, default option trick (blank initial selection).

``` html
<option value="default" style="display: none">Select a {{ label }}</option>
```

VUE keeps a backing store of the DOM, so it can avoid an expensive DOM refresh if it is not required.  I have found at least 1 case where this had some side-effects. 

When there are no options in a 'select' list, I disable the element based on a value computed from the list size. When the whole list was removed and replaced with another empty list, I found that the computed value was not re-evaluated, and so the list was not disabled.  I'd imagine this is some type of optimization, or maybe some trick that I haven't leared yet.  I was able to work around this by splitting removal of the old list with creating the new list (using setTimeout).

### 6: Tools

WRT building apps using webpack, you need the following tools.  I know it's all in the package.json, but it would have helped me if I knew what is needed and why, and what they do.

NOTE: You can just `npm install` for this project, you don't need to install these individually.  This is just for information.

*  `vue@next` will give you VUE3.  You get VUE2 without the @next
*  `vue-loader@next` give you the vue-loader for VUE3.  Must be > 16
*  `npm install @vue/compiler-sfc` this is different than the default compiler used for VUE2 but is required for compiling Vue3
* `css-loader` and `vue-style-loader` to compile the CSS part of the SFC
* `typescript` and `ts-loader` are required by webpack, even for a javascript application.  (this application is javascript but I plan to do a typescript version which has some other requirements)

None of the VUE files need to be included in the build directly.  As long as they are imported into the .js file you're building, the `VueLoaderPlugin` (see the plugins section of the webpack config, in Gruntfile.js) will find the correct loader, and compile the vue and css files.

Note that if you are using vue-cli and similar tools to generate your configuration, it is generating a tsconfig and webpack config, whether you are aware of it or not.

### To build:

```
git clone https://github.com/AaronDavidNewman/vue3base.git
cd vue3base
npm install
npm install -g grunt-cli
grunt
```

Load `src/index.html` to see the demo components.

Grunt is only used as a task runner for webpack, so running from webpack config should be a short walk.




