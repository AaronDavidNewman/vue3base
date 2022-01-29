<sub>[Github repo](https://github.com/AaronDavidNewman/vue3base) </sub>
## VUE3 SFC component example (using webpack)

I couldn't find a project with no dependencies to use as a template for a webpack Vue3 SFC project.  I found the VUE3 documentation in this area lacking (as of Jan, 2022).  So I created this.

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
### 1: Reactivity can be a little fragile
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

### 2: VUE Rendering optimizations can sometimes have side-effects
VUE keeps a backing store of the DOM, so it can avoid an expensive DOM refresh if it is not required.  I have found at least 1 case where this had some side-effects. 

When there are no options in a 'select' list, I disable the element based on a value computed from the list size. When the whole list was removed and replaced with another empty list, I found that the computed value was not re-evaluated, and so the list was not disabled.  I'd imagine this is some type of optimization, or maybe some trick that I haven't leared yet.  I was able to work around this by splitting removal of the old list with creating the new list (using setTimeout).

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







