<sub>[Github repo](https://github.com/AaronDavidNewman/vue3base) </sub>
## VUE3 SFC component example (using webpack)

I couldn't find a project with no dependencies to use as a template for a webpack Vue3 SFC project using the composition API.  I found the VUE3 documentation in this area lacking (as of Jan, 2022).  So I created this.

This project simulates a tree selection, by using a series of 'select' controls that represent levels of the tree.  It consists of a parent component and 2 child components.  Choosing a parent branch enables child branches.  It looks like this:

![](https://imgur.com/J5vS1Rs.png)

### To build:

```
git clone https://github.com/AaronDavidNewman/vue3base.git
cd vue3base
npm install
npm install -g grunt-cli
grunt
```

Load `src/index.html` to see the demo components.

Grunt is only used as a task runner for webpack, so running from webpack config should be an short walk.

## How it works
To implement the tree browser, there are 3 components and a composible/adapter.  There is also some sample data which similates a repository:

1. the top-level component handles the events coming from the child components - the tree selection, and the tree level selection.  The only logic here is to set the reactive data when the component value changes.  There is also a tab control, just to play with 'computed' property.
2. treeetop.vue contains the options to select from among different trees, and treeview.vue selects different levels within the tree.
3. treeview.js is the adapter/composible.  It watches the reactive variables selected in the components, and updates the reactive variables that represent the tree structure accordingly.
4. sampleData represents a repository, that just has the data in a table but could use an xhr call to a server (it is async).

Note that there is no logic in the top component (app.vue) itself.  The setup function only declares the reactive variables it uses, and leaves the logic to the composible.  This is a feature of the Composition API.

## What I learned
### 1: Components are not objects - Composition API and setup
With the composition API, there is a `setup` function that takes the place of a constructor for the component.  In `setup`, there is no reference to the component's 'this' object, nor a reference to the component itself.  So all the data that your component will ever need must be present in `setup`.

To provide seperation of concerns, you are expected to provide one or more 'composables', which is basically the logic of your component.  You pass the composable your reactive variables, and it returns functions and other reactive variables that your component needs.

To me, this sounded a lot like the adapter pattern (the composible adapts the data so it updates the UI at the right time, and adapts the UI changes to the store), so I called the directory 'adapters' instead of 'composibles' (also, composible is a strange word).

A component is just the reactive data that makes up the component, and the events that come from the DOM and other components.  If you are trying to make it into something else, you're doing it wrong and probably the logic you want belongs somewhere else.  Or maybe, the composition API is not for you.  I found [this nugget on SO:](https://stackoverflow.com/questions/64175377/using-this-in-lifecycle-hook-created-from-composition-api)


> If we bind the lifecycle hooks in setup to the instance, it would only cause confusion and encourage antipatterns. You make a choice, options api, or composition api. If you choose composition api, there is nothing interesting for you on this. Everything is contained in the setup closure. If we added it, typescript inference would be harder to implement, and people will start using the options api in combination with it.

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
proxyObject = [] // wrong way
```
to clear the array.  You need to go: 

``` javascript
proxyObject.splice(0) // right way
```

Likewise if you have a javascript object, you need to individually assign each key to a value.  If you just go `proxyObject = someOtherObject`, the proxy reference is lost.

### 3. Making your data reactive
It is possible to explicitly create refs to variables created outside the VUE framework, also.  The key to understanding VUE 3 is to understand how to use the  reactive API:

1. use `toRef` to make a field of an object reactive, whether the parent object is reactive or not.
2. use `ref` to make a string, boolean or number variable reactive.
3. use `reactive` to make an object or array reactive.  (arrays can use either `ref` or `reactive` but I prefer the `reactive`)

If you want to make a non-reactive value passed in as a prop reactive, you can use 'toRef':

``` javascript
const someValue = props.someValue; // someValue is _not_ reactive
const someValue = toRef(props, 'someValue'); // someValue is now reactive
const someObject = props.someObject;
const field1 = toRef(somObject, 'field1'); // make props.someObject.field1 reactive
```

### 3: Each .vue file is a single component
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

### 4: VUE Rendering optimizations can sometimes have side-effects
I believe this only affects the built-in select control using the disabled, default option trick (blank initial selection).

``` html
<option value="default" style="display: none">Select a {{ label }}</option>
```

VUE keeps a backing store of the DOM, so it can avoid an expensive DOM refresh if it is not required.  I have found at least 1 case where this had some side-effects. 

When there are no options in a 'select' list, I disable the element based on a value computed from the list size. When the whole list was removed and replaced with another empty list, I found that the computed value was not re-evaluated, and so the list was not disabled.  I'd imagine this is some type of optimization, or maybe some trick that I haven't leared yet.  I was able to work around this by splitting removal of the old list with creating the new list (using setTimeout).

### 5: Tools

WRT building apps using webpack, you need the following tools.  I know it's all in the package.json, but it would have helped me if I knew what is needed and why, and what they do.

NOTE: You can just `npm install` for this project, you don't need to install these individually.  This is just for information.

*  `vue@next` will give you VUE3.  You get VUE2 without the @next
*  `vue-loader@next` give you the vue-loader for VUE3.  Must be > 16
*  `npm install @vue/compiler-sfc` this is different than the default compiler used for VUE2 but is required for compiling Vue3
* `css-loader` and `vue-style-loader` to compile the CSS part of the SFC
* `typescript` and `ts-loader` are required by webpack, even for a javascript application.  (this application is javascript but I plan to do a typescript version which has some other requirements)

None of the VUE files need to be included in the build directly.  As long as they are imported into the .js file you're building, the `VueLoaderPlugin` (see the plugins section of the webpack config, in Gruntfile.js) will find the correct loader, and compile the vue and css files.

Note that if you are using vue-cli and similar tools to generate your configuration, it is generating a tsconfig and webpack config, whether you are aware of it or not.






