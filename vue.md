#### initState 函数里面执行顺序

beforeCreate ->inject -> Props -> Methods -> Data -> Computed -> Watch ->provide-> created

#### 组件化设计

表单 Form（容器、全局校验）
条目 formItem（数据校验，显示错误信息）
输入框 input（数据收集） input 事件处理 value 双绑

#### js 是如何监听 HistoryRouter 的变化的

通过浏览器的地址栏来改变切换页面，前端实现主要有两种方式：

1. 通过 hash 改变，利用 window.onhashchange 监听。
2. HistoryRouter：通过 history 的改变，进行 js 操作加载页面，然而 history 并不像 hash 那样简单，因为 history 的改变，除了浏览器的几个前进后退（使用 history.back(), history.forward()和 history.go() 方法来完成在用户历史记录中向后和向前的跳转。）等操作会主动触发 popstate 事件，pushState，replaceState 并不会触发 popstate 事件，要解决 history 监听的问题，方法是：
   首先完成一个订阅-发布模式，然后重写 history.pushState, history.replaceState,并添加消息通知，这样一来只要 history 的无法实现监听函数就被我们加上了事件通知，只不过这里用的不是浏览器原生事件，而是通过我们创建的 event-bus 来实现通知，然后触发事件订阅函数的执行。

```js
class Dep {
  // 订阅池
  constructor(name) {
    this.id = new Date(); //这里简单的运用时间戳做订阅池的ID
    this.subs = []; //该事件下被订阅对象的集合
  }
  defined() {
    // 添加订阅者
    Dep.watch.add(this);
  }
  notify() {
    //通知订阅者有变化
    this.subs.forEach((e, i) => {
      if (typeof e.update === "function") {
        try {
          e.update.apply(e); //触发订阅者更新函数
        } catch (err) {
          console.warr(err);
        }
      }
    });
  }
}
Dep.watch = null;
class Watch {
  constructor(name, fn) {
    this.name = name; //订阅消息的名称
    this.id = new Date(); //这里简单的运用时间戳做订阅者的ID
    this.callBack = fn; //订阅消息发送改变时->订阅者执行的回调函数
  }
  add(dep) {
    //将订阅者放入dep订阅池
    dep.subs.push(this);
  }
  update() {
    //将订阅者更新方法
    var cb = this.callBack; //赋值为了不改变函数内调用的this
    cb(this.name);
  }
}
```

重写 history 方法，并添加 window.addHistoryListener 事件机制。

```js
var addHistoryMethod = (function () {
  var historyDep = new Dep();
  return function (name) {
    if (name === "historychange") {
      return function (name, fn) {
        var event = new Watch(name, fn);
        Dep.watch = event;
        historyDep.defined();
        Dep.watch = null; //置空供下一个订阅者使用
      };
    } else if (name === "pushState" || name === "replaceState") {
      var method = history[name];
      return function () {
        method.apply(history, arguments);
        historyDep.notify();
      };
    }
  };
})();
window.addHistoryListener = addHistoryMethod("historychange");
history.pushState = addHistoryMethod("pushState");
history.replaceState = addHistoryMethod("replaceState");
```

我们利用了 Vue 提供的 API：defineReactive，使得 this.\_router.history 对象得到监听。

因此当我们第一次渲染**router-view**这个组件的时候，会获取到`this._router.history`这个对象，从而就会被监听到获取`this._router.history`。就会把**router-view**组件的依赖**wacther**收集到`this._router.history`对应的收集器**dep**中，因此`this._router.history`每次改变的时候。`this._router.history`对应的收集器**dep**就会通知**router-view**的组件依赖的**wacther**执行**update()**，从而使得`router-view`重新渲染（**其实这就是 vue 响应式的内部原理**）

#### Vue 生命周期经历哪些阶段

详细来说：开始创建、初始化数据、编译模板、挂载 Dom、渲染 → 更新 → 渲染、销毁等一系列过程

1.  实例化 vue(组件)对象：new Vue()
2.  初始化事件和生命周期 init events 和 init cycle
3.  beforeCreate 函数：
    在实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前被调用。
    即此时 vue（组件）对象被创建了，但是 vue 对象的属性还没有绑定，如 data 属性，computed 属性还没有绑定，即没有值。
    此时还没有数据和真实 DOM。
    即：属性还没有赋值，也没有动态创建 template 属性对应的 HTML 元素（二阶段的 createUI 函数还没有执行）
4.  挂载数据（属性赋值）
    包括 属性和 computed 的运算
5.  Created 函数：
    vue 对象的属性有值了，但是 DOM 还没有生成，$el 属性还不存在。
    此时有数据了，但是还没有真实的 DOM
    ​ 即：data，computed 都执行了。属性已经赋值，但没有动态创建 template 属性对应的 HTML 元素，所以，此时如果更改数据不会触发 updated 函数
    ​ 如果：数据的初始值就来自于后端，可以发送 ajax，或者 fetch 请求获取数据，但是，此时不会触发 updated 函数
6.  检查 - 6.1 检查是否有 el 属性
    ​ 检查 vue 配置，即 new Vue{}里面的 el 项是否存在，有就继续检查 template 项。没有则等到手动绑定调用 vm.el 的绑定。

        - 6.2 检查是否有template属性

    检查配置中的 template 项，如果没有 template 进行填充被绑定区域，则被绑定区域的 el 对 outerHTML（即整个#app DOM 对象，包括和标签）都作为被填充对象替换掉填充区域。即： 如果 vue 对象中有 template 属性，那么，template 后面的 HTML 会替换$el 对应的内容。如果有 render 属性，那么 render 就会替换 template。 即：优先关系时： render > template > el

7.  beforeMount 函数：
    模板编译(template)、数据挂载(把数据显示在模板里)之前执行的钩子函数
    此时 this.$el 有值，但是数据还没有挂载到页面上。即此时页面中的{{}}里的变量还没有被数据替换
8.  模板编译：用 vue 对象的数据（属性）替换模板中的内容
9.  Mounted 函数：
    模板编译完成，数据挂载完毕
    即：此时已经把数据挂载到了页面上，所以，页面上能够看到正确的数据了。
    一般来说，我们在此处发送异步请求（ajax，fetch，axios 等），获取服务器上的数据，显示在 DOM 里。
10. beforeUpdate 函数：
    组件更新之前执行的函数，只有数据更新后，才能调用（触发）beforeUpdate，注意：此数据一定是在模板上出现的数据，否则，不会，也没有必要触发组件更新（因为数据不出现在模板里，就没有必要再次渲染）
    数据更新了，但是，vue（组件）对象对应的 dom 中的内部（innerHTML）没有变，所以叫作组件更新前
11. updated 函数：
    组件更新之后执行的函数
    vue（组件）对象对应的 dom 中的内部（innerHTML）改变了，所以，叫作组件更新之后
12. activated 函数：keep-alive 组件激活时调用
13. activated 函数：keep-alive 组件停用时调用
14. beforeDestroy：vue（组件）对象销毁之前
15. destroyed：vue 组件销毁后

Vue 的缓存机制并不是直接存储 DOM 结构，而是将 DOM 节点抽象成了一个个 VNode 节点，所以，keep- alive 的缓存也是基于 VNode 节点的而不是直接存储 DOM 结构。

其实就是将需要缓存的 VNode 节点保存在 this.cache 中／在 render 时,如果 VNode 的 name 符合在缓存条件（可以用 include 以及 exclude 控制），则会从 this.cache 中取出之前缓存的 VNode 实例进行渲染。

#### vue 组件通信

1. $attrs 是一个对象存储父组件传递过来但是子组件 props 没接收的属性
2. $children 可以拿到非原生组件，子组件不保证顺序
3. $ref 可以拿到任意组件
4. $parent.$emit、$parent.$on 兄弟组件
5. 祖先 provide(){return xxx:123} 后代 inject：['xxx'] 单向数据流
6. eventBus
7. 具名插槽

```html
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>

  <p>A paragraph for the main content.</p>
  <p>And another one.</p>

  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

```html
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

8. 作用域插槽

```html
<current-user v-slot:default="slotProps">
  {{ slotProps.user.firstName }}
</current-user>
```

```html
<span>
  <slot v-bind:user="user"> </slot>
</span>
```
