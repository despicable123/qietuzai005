#### initState函数里面执行顺序
beforeCreate  ->inject -> Props ->  Methods ->  Data -> Computed -> Watch ->provide-> created

#### 组件化设计
表单 Form（容器、全局校验）
条目 formItem（数据校验，显示错误信息）
输入框 input（数据收集）  input事件处理  value双绑

#### js是如何监听HistoryRouter的变化的
通过浏览器的地址栏来改变切换页面，前端实现主要有两种方式：
1. 通过hash改变，利用window.onhashchange 监听。
2. HistoryRouter：通过history的改变，进行js操作加载页面，然而history并不像hash那样简单，因为history的改变，除了浏览器的几个前进后退（使用 history.back(), history.forward()和 history.go() 方法来完成在用户历史记录中向后和向前的跳转。）等操作会主动触发popstate 事件，pushState，replaceState 并不会触发popstate事件，要解决history监听的问题，方法是：

首先完成一个订阅-发布模式，然后重写history.pushState, history.replaceState,并添加消息通知，这样一来只要history的无法实现监听函数就被我们加上了事件通知，只不过这里用的不是浏览器原生事件，而是通过我们创建的event-bus 来实现通知，然后触发事件订阅函数的执行。

```js
class Dep {                  // 订阅池
    constructor(name){
        this.id = new Date() //这里简单的运用时间戳做订阅池的ID
        this.subs = []       //该事件下被订阅对象的集合
    }
    defined(){              // 添加订阅者
        Dep.watch.add(this);
    }
    notify() {              //通知订阅者有变化
        this.subs.forEach((e, i) => {
            if(typeof e.update === 'function'){
                try {
                   e.update.apply(e)  //触发订阅者更新函数
                } catch(err){
                    console.warr(err)
                }
            }
        })
    }
}
Dep.watch = null;
class Watch {
    constructor(name, fn){
        this.name = name;       //订阅消息的名称
        this.id = new Date();   //这里简单的运用时间戳做订阅者的ID
        this.callBack = fn;     //订阅消息发送改变时->订阅者执行的回调函数     
    }
    add(dep) {                  //将订阅者放入dep订阅池
       dep.subs.push(this);
    }
    update() {                  //将订阅者更新方法
        var cb = this.callBack; //赋值为了不改变函数内调用的this
        cb(this.name);         
    }
}
```

重写history方法，并添加window.addHistoryListener事件机制。

```js
var addHistoryMethod = (function(){
        var historyDep = new Dep();
        return function(name) {
            if(name === 'historychange'){
                return function(name, fn){
                    var event = new Watch(name, fn)
                    Dep.watch = event;
                    historyDep.defined();
                    Dep.watch = null;       //置空供下一个订阅者使用
                }
            } else if(name === 'pushState' || name === 'replaceState') {
                var method = history[name];
                return function(){
                    method.apply(history, arguments);
                    historyDep.notify();
                }
            }
        }
}())
window.addHistoryListener = addHistoryMethod('historychange');
history.pushState =  addHistoryMethod('pushState');
history.replaceState =  addHistoryMethod('replaceState');
```

我们利用了Vue提供的API：defineReactive，使得this._router.history对象得到监听。

因此当我们第一次渲染**router-view**这个组件的时候，会获取到`this._router.history`这个对象，从而就会被监听到获取`this._router.history`。就会把**router-view**组件的依赖**wacther**收集到`this._router.history`对应的收集器**dep**中，因此`this._router.history`每次改变的时候。`this._router.history`对应的收集器**dep**就会通知**router-view**的组件依赖的**wacther**执行**update()**，从而使得`router-view`重新渲染（**其实这就是vue响应式的内部原理**）

#### Vue生命周期经历哪些阶段
详细来说：开始创建、初始化数据、编译模板、挂载Dom、渲染→更新→渲染、销毁等一系列过程
1. 实例化vue(组件)对象：new Vue()
2. 初始化事件和生命周期 init events 和 init cycle
3. beforeCreate函数：
在实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前被调用。
即此时vue（组件）对象被创建了，但是vue对象的属性还没有绑定，如data属性，computed属性还没有绑定，即没有值。
此时还没有数据和真实DOM。
即：属性还没有赋值，也没有动态创建template属性对应的HTML元素（二阶段的createUI函数还没有执行）
4. 挂载数据（属性赋值）
包括 属性和computed的运算
5. Created函数：
vue对象的属性有值了，但是DOM还没有生成，$el属性还不存在。
此时有数据了，但是还没有真实的DOM
​ 即：data，computed都执行了。属性已经赋值，但没有动态创建template属性对应的HTML元素，所以，此时如果更改数据不会触发updated函数
​ 如果：数据的初始值就来自于后端，可以发送ajax，或者fetch请求获取数据，但是，此时不会触发updated函数
6. 检查
    - 6.1 检查是否有el属性
​ 检查vue配置，即new Vue{}里面的el项是否存在，有就继续检查template项。没有则等到手动绑定调用 vm.el的绑定。

    - 6.2 检查是否有template属性
检查配置中的template项，如果没有template进行填充被绑定区域，则被绑定区域的el对outerHTML（即整个#app DOM对象，包括和标签）都作为被填充对象替换掉填充区域。即： 如果vue对象中有 template属性，那么，template后面的HTML会替换$el对应的内容。如果有render属性，那么render就会替换template。 即：优先关系时： render > template > el

7. beforeMount函数：
模板编译(template)、数据挂载(把数据显示在模板里)之前执行的钩子函数
此时 this.$el有值，但是数据还没有挂载到页面上。即此时页面中的{{}}里的变量还没有被数据替换
8. 模板编译：用vue对象的数据（属性）替换模板中的内容
9. Mounted函数：
模板编译完成，数据挂载完毕
即：此时已经把数据挂载到了页面上，所以，页面上能够看到正确的数据了。
一般来说，我们在此处发送异步请求（ajax，fetch，axios等），获取服务器上的数据，显示在DOM里。
10. beforeUpdate函数：
组件更新之前执行的函数，只有数据更新后，才能调用（触发）beforeUpdate，注意：此数据一定是在模板上出现的数据，否则，不会，也没有必要触发组件更新（因为数据不出现在模板里，就没有必要再次渲染）
数据更新了，但是，vue（组件）对象对应的dom中的内部（innerHTML）没有变，所以叫作组件更新前
11. updated函数：
组件更新之后执行的函数
vue（组件）对象对应的dom中的内部（innerHTML）改变了，所以，叫作组件更新之后
12. activated函数：keep-alive组件激活时调用
13. activated函数：keep-alive组件停用时调用
14. beforeDestroy：vue（组件）对象销毁之前
15. destroyed：vue组件销毁后

Vue 的缓存机制并不是直接存储 DOM 结构，而是将 DOM 节点抽象成了一个个 VNode节点，所以，keep- alive的缓存也是基于VNode节点的而不是直接存储DOM结构。

其实就是将需要缓存的VNode节点保存在this.cache中／在render时,如果VNode的name符合在缓存条件（可以用include以及exclude控制），则会从this.cache中取出之前缓存的VNode实例进行渲染。

#### vue组件通信
1. $attrs是一个对象存储父组件传递过来但是子组件props没接收的属性
2. $children可以拿到非原生组件，子组件不保证顺序
3. $ref可以拿到任意组件
4. $parent.$emit、$parent.$on 兄弟组件
5. 祖先 provide(){return xxx:123}  后代 inject：['xxx']  单向数据流
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
  <slot v-bind:user="user">
  </slot>
</span>
```