<sub>[Github repo](https://github.com/AaronDavidNewman/vue3base) </sub>
## VUE3 SFC component example (using webpack)

I couldn't find a project with no dependencies to use as a template for a webpack Vue3 SFC project using the composition API.  I found the VUE3 documentation in this area lacking (as of Jan, 2022).  So I created this.

This widget is just a series of dropdown lists that simulates traversal of a tree.  It consists of a parent component and 2 child components.  Choosing a parent branch enables child branches.  It looks like this:

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

## What I learned
### 1: Components are not classes - Composition API and setup
With the composition API, there is a `setup` function that takes the place of a constructor for the component.  In the setup, there is no reference to the component's 'this' object, nor a reference to the component itself.

In particular, it's a little jarring that the lifecycle hooks the component gets (created, mounted, etc) don't expose this, either.

This is an intentional departure from typical component libraries.  What you do have access to are all the reactive data (props) that your component will ever use.  You also have access to a context that lets you send events to other components.

A component is just the reactive data that makes up the component, and the events that come from the DOM and other components.  If you are trying to make it into something else, you're doing it wrong and probably the logic you want belongs somewhere else.  I found [this nugget on SO:](https://stackoverflow.com/questions/64175377/using-this-in-lifecycle-hook-created-from-composition-api)


> If we bind the lifecycle hooks in setup to the instance, it would only cause confusion and encourage antipatterns. You make a choice, options api, or composition api. If you choose composition api, there is nothing interesting for you on this. Everything is contained in the setup closure. If we added it, typescript inference would be harder to implement, and people will start using the options api in combination with it.

Note that this only referes to the setup function and composition API.  You can still do it the old way, and 'this' from methods and template variables acts the same.

### 2: Reactivity can be a little fragile
Tool kits like React, Angular, and Vue are made possible by the `Proxy` object built into Javascript.  I never even knew about this thing!  But it is pretty interesting. If you go:

``` javascript
const proxyObject = new Proxy(baseObject, myHandler);
```
you can return `proxyObject` in place of baseObject.  Any time `proxyObject` is referenced or changed, `myHandler` is notified of the change to `baseObject`.  This allows Vue to bind DOM elements to javascript variables.  It also allows values mutated in parent components to be updated in child components.

The 'any time' part is not quite true, because of the way references work.  if `proxyObject` is an array, for instance, it doesn't work to just say: 

``` javascript
proxyObject = [] // wrong way
```
to clear the array.  You need to go: 

``` javascript
proxyObject.splice(0) // right way
```

Likewise if you have a javascript object, you need to individually assign each key to a value.  If you just go `proxyObject = someOtherObject`, the proxy reference is lost.

It is possible to explicitly create refs to variables created outside the VUE framework, also.

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

### 4: Tools

WRT building apps using webpack, you need the following tools.  I know it's all in the package.json, but it would have helped me if I knew what is needed and why, and what they do.

NOTE: You can just `npm install` for this project, you don't need to install these individually.  This is just for information.

*  `vue@next` will give you VUE3.  You get VUE2 without the @next
*  `vue-loader@next` give you the vue-loader for VUE3.  Must be > 16
*  `npm install @vue/compiler-sfc` this is different than the default compiler used for VUE2 but is required for compiling Vue3
* `css-loader` and `vue-style-loader` to compile the CSS part of the SFC
* `typescript` and `ts-loader` are required by webpack, even for a javascript application.  (this application is javascript but I plan to do a typescript version which has some other requirements)

None of the VUE files need to be included in the build directly.  As long as they are imported into the .js file you're building, the `VueLoaderPlugin` (see the plugins section of the webpack config, in Gruntfile.js) will find the correct loader, and compile the vue and css files.







