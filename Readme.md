<sub>[Github](https://github.com/AaronDavidNewman/vue3base) code [demo](https://aarondavidnewman.github.io/vue3base/src/index.html) component</sub>
## VUE3 SFC component example (using webpack)

I created this project with 2 goals in mind: 
1. create a VUE3 + SFC+webpack template to use for other projects
2. create a complete implementation of a VUE component using the composition API, for something resembling a real-world component

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

## What I learned about the composition API
### Reactivity is directional
Props are passed from parent components to child components.  Props passed into a component are read-only.  The should not be mutated by the child.

The pattern is: events from child to parent, mutation from parent to child . toRef makes the data reactive, but it doesn't affect whether you can mutate it. So if you go:

``` javascript
const selectedTree = toRef(props, 'selectedTree');
selectedTree.value='foo'; // not allowed - selectedTree.value is read-only
```

if you go:

``` javascript
const selectedTree = ref('');
const selectedTreeRo = toRef('selectedTree', props); // react to prop
watch(texteEnvoyeRo, (value) => {
  selectedTree.value = selectedTreeRo.value; // OK, selectedTree is yours
});
```

now selectedTree is yours, and you can mutate it, and react to changes in selectedTreeRo.

### 'Composables' and the Compostion API
As the [documentation](https://vuejs.org/guide/reusability/composables.html#async-state-example)  points out, the `setup` function does not expose `this` pointer, nor do any of the lifecycle event hooks.  The component uses the reactive data it needs for its template logic, and passes other functions to a `composable` - a function that manages the logic of the component's data.  

This extra level of indirection took some getting used to.  But it makes sense - in general, it's a bad OO practice to tie something to an object instance that has it's own life cycle.  Components are tied to the DOM and other components, they aren't really instances of classes in the usual sense.

To me, this sounded a lot like the adapter pattern (the composable 'adapts' the data to the form the UI expects, and adapts the UI changes to the server/persistent store).  I intitially called the composable directory 'adapters', but now that I see the official documentation has been updated, I switched it back to 'composables'.

### 1: Composition API and Options API are different - use one or the other
_Update_: VUE3 is now the official default version of VUE, and much of the ambiguity mentioned below between Options API and Composition API has been clarified.

Many of the examples, both in the offical documentation, and the little snippets you can find on 'fiddle' sites, use the options API.  You shouldn't use options API with composition API, it will cause confusion about the handling of your component's data.

I found [this nugget on SO:](https://stackoverflow.com/questions/64175377/using-this-in-lifecycle-hook-created-from-composition-api) from some of the creators of VUE (not sure if this is a Evan Yue quote or not).

> If we bind the lifecycle hooks in setup to the instance, it would only cause confusion and encourage antipatterns. You make a choice, options api, or composition api. If you choose composition api, there is nothing interesting for you on `this`. Everything is contained in the setup closure. If we added it, typescript inference would be harder to implement, and people will start using the options api in combination with it.

One sort of annoying thing, or at least something to remember, is that `this` is still used in the composition API.  Methods use 'this' for props, and all template variables have an implied `this`.  This is true in both APIs.  So a prop called `foo` in setup is `this.foo` in the object.  In a way though, this helps to remember about [shallow unwrapping](https://vuejs.org/api/reactivity-core.html#ref) which I talk about below.

### Reactivity uses the Proxy object
Tool kits like React, Angular, and Vue are made possible by the `Proxy` object built into Javascript.  I never even knew about this thing!  But it is pretty interesting. If you go:

``` javascript
const proxyObject = new Proxy(baseObject, myHandler);
```
you can return `proxyObject` in place of baseObject.  Any time `proxyObject` is referenced or changed, `myHandler` is notified of the change to `baseObject`.  This allows Vue to bind DOM elements to javascript variables.  It also allows values mutated in parent components to be updated in child components.

### Reactivity is not limited to components.
It is possible to explicitly create refs to variables created outside the context of a component.  In fact, this is a key part of the composition pattern.  You can create reactive data and send it into your components, and use it to communicate with it by attaching watchers to it.  Or the components can indicate UI changes through the reactive data.

The key to understanding VUE 3 is to understand how to use the reactive API.  

1. use `ref` or `reactive` to make variables you declare yourself reactive.
2. use `reactive` to make an object or array reactive, `ref` to make a literal (a number, string, or boolean) reactive.  Arrays can use either `ref` or `reactive` but I prefer the `reactive` syntax.
3. use `toRef` to make a field of a reactive object reactive.  

If you have:

``` javascript
  const foo = reactive({
      bar: 'cow',
      orb: 'dog'
  });
```

`foo` is reactive, but `bar` and `orb` are _not_ reactive.  This surprised me at first.  So if you want to `watch` them only, you would go:

``` javascript
   const reactBar = toRef(foo.bar);
   ...
   watch(reactBar, (value) => {
       // do stuff when foo.bar changes
   });
```

**Note and Warning** about `reference unwrapping`:
If you use `ref` or `toRef`, you reference the value of the variable `foo` with `foo.value`.  In templates and in methods (any context where `this` is implied), the variable is reference as `this.foo`, _not_ `this.foo.value`.  

Fields within objects created with `reactive` are always `obj.foo`, and not `obj.foo.value`.   

### Reactivity can be fragile

There's even a term for it - 'loss of reactivity'

if `proxyObject` is a reactive array, for instance, it doesn't work to just say: 

``` javascript
proxyObject = [] // wrong way, reactivity is lost
```
to clear the array.  You need to go: 

``` javascript
proxyObject.splice(0) // right way, proxyObject remains reactive
```

Likewise if you have a javascript object, you need to individually assign each key to a value.  If you just go `proxyObject = someOtherObject`, the proxy reference is lost.

Just remember that you can't go `obj = otherObj` - you will lose the reactivity of `obj`.  Instead, assign the object key values: from `obj[field1] = otherObj[field1]`.

If you want to make a non-reactive value passed in as a prop reactive, you can use 'toRef':

``` javascript
const someValue = props.someValue; // someValue is _not_ reactive
const someValue = toRef(props, 'someValue'); // someValue is now reactive
const someObject = props.someObject;
const field1 = toRef(someObject, 'field1'); // make props.someObject.field1 reactive
```

### Each .vue file is a single component
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

### VUE Rendering optimizations can sometimes have side-effects
I believe this only affects the built-in select control using the disabled, default option trick (blank initial selection).

``` html
<option value="default" style="display: none">Select a {{ label }}</option>
```

VUE keeps a backing store of the DOM, so it can avoid an expensive DOM refresh if it is not required.  I have found at least 1 case where this had some side-effects. 

When there are no options in a 'select' list, I disable the element based on a value computed from the list size. When the whole list was removed and replaced with another empty list, I found that the computed value was not re-evaluated, and so the list was not disabled.  I'd imagine this is some type of optimization, or maybe some trick that I haven't leared yet.  I was able to work around this by splitting removal of the old list with creating the new list (using setTimeout).

### Tools
__EDIT__: now that VUE3 is the official version of VUE, I'm not sure if the `@next` is still required, I have to test this out.  `npm install vue` should just give you vue3.

You can just `npm install` this project, but it would have helped me if I knew which tools are needed and why, and what they do.  

If you are using [Vite](https://vitejs.dev/) or [Vue CLI](https://cli.vuejs.org/) to generate your configuration, know that it will generate dependencies for all these tools, including a webpack config, whether you like to be aware of it or not.

*  `vue@next` will give you VUE3.  You get VUE2 without the @next
*  `vue-loader@next` give you the vue-loader for VUE3.  Must be > 16
*  `npm install @vue/compiler-sfc` this is different than the default compiler used for VUE2 but is required for compiling Vue3
* `css-loader` and `vue-style-loader` to compile the CSS part of the SFC
* `typescript` and `ts-loader` are required by webpack, even for a javascript application.  (this application is javascript but I plan to do a typescript version which has some other requirements)

None of the VUE files need to be included in the build directly.  As long as they are imported into the .js file you're building, the `VueLoaderPlugin` (see the plugins section of the webpack config, in Gruntfile.js) will find the correct loader, and compile the vue and css files.

Note that if you are using vue-cli and similar tools to generate your configuration, it is generating a tsconfig and webpack config, whether you are aware of it or not.

### To build
Assuming you have [node/npm](https://nodejs.org/en/download/) and [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed already...

```
git clone https://github.com/AaronDavidNewman/vue3base.git
cd vue3base
npm install
npm install -g grunt-cli
grunt
```

Load `src/index.html` to see the demo components.

Grunt is only used as a task runner for webpack, so running from webpack config should be a short walk.




