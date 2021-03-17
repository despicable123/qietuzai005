## git 命令
* git reflog 查看操作历史
* git checkout -- file 丢弃工作区的修改 使得这个文件回到最近一次git commit或git add时的状态 其实是用版本库里的版本替代工作区的版本
* git checkout - 切换分支  
* git reset HEAD <file>可以把暂存区的修改撤销掉（unstage），重新放回工作区

* 场景1：当你改乱了工作区某个文件的内容，想直接丢弃工作区的修改时，用命令git checkout -- file。

* 场景2：当你不但改乱了工作区某个文件的内容，还添加到了暂存区时，想丢弃修改，分两步，第一步用命令git reset HEAD <file>，就回到了场景1，第二步按场景1操作。

* 场景3：已经提交了不合适的修改到版本库时，想要撤销本次提交，参考版本回退一节，不过前提是没有推送到远程库。(git reset --hard HEAD^)HEAD指向的版本就是当前版本，因此，Git允许我们在版本的历史之间穿梭，使用命令git reset * --hard commit_id

* 要关联一个远程库，使用命令git remote add origin git@server-name:path/repo-name.git；
关联后，使用命令git push -u origin master第一次推送master分支的所有内容；
此后，每次本地提交后，只要有必要，就可以使用命令git push origin master推送最新修改；

* 每次提交，Git都把它们串成一条时间线，这条时间线就是一个分支。截止到目前，只有一条时间线，在Git里，这个分支叫主分支，即master分支。HEAD严格来说不是指向提交，而是指向master，master才是指向提交的，所以，HEAD指向的就是* 当前分支。

## js对象
1. weakMap：弱映射造就了在js中实现真正私有变量的一种方式（私有变量存储在弱映射中，对象实例为键，私有成员字典为值）
    ```js
    const User = (()=>{
        const wm = new WeakMap()
        class User{
        }
    return User
    })()
    ```

    ```js
    const host = new WeakMap();
    class User{
        constructor(name){
            this.name = name;
            host.set(this,"https")
        }

        set host(url){
            host.set(this,url)
        }

        get host(){
            return host.get(this)
        }
    }
    let hd = new User()
    hd.host //读取私有属性，对外不暴露host 不可修改

2.	assign 将每个源对象可枚举和自由属性复制到目标对象，使用源对象的get获取属性的值，使用目标对象上的set设置属性的值/
3.	assign不会回滚，尽力而为。
4.	Objectis(a,b)检查超过多个用递归
    ```js
    function fn(x,…rest){
        return Object.is(x,rest[0]) && (rest.length < 2) || fn(…rest)
    }
    ```
5.	解构在内部使用函数toObject
6.	工厂模式可以解决创建多个类似对象的问题，但没有解决的对象标识问题（即新创建的对象是什么类型）
7.	构造函数模式没有显式创建对象、属性和方法直接复制给this、没有return（构造函数名称的首字母都是要大写的，非构造函数小写字母开头）
8.	没有用new调用的构造函数，属性和方法会被添加到window对象中
9.	函数也是对象，构造函数里的方法每次调用都会初始化一个对象，每个实例都会有自己的方法（）实例。
10.	原型模式下实例共有的方法取等。与构造函数模式不同，使用这种原型定义的属性和方法是由所有实例共享的。
11. Person.prototype.constructor指向Person
12. 构造函数的prototype属性引用原型对象，原型对象有一个constructor属性引用构造函数，构成循环引用
13. 实例用过_proto_链接到原型对象，构造函数通过prototype属性链接到原型对象
14. Object.create(指定继承的原型)
15. 实例添加属性回遮蔽原型对象的同名属性，用delete可以完全删除实例上的这个属性
16. hasOwnProperty（key）用于确认某个属性是在实例上还是在原型对象上，实例true  可用于组件是否配置某些必要属性
17. 属性 + in 操作符对实例原型都可
18. 原型模式弱化了向构造函数初始化参数的能力，会导致所有实例默认都取得相同的属性值，原型最主要问题源自它的共享特性（实例会共享引用值属性）
19. js没有接口继承，因为函数没有签名
20. 继承实际上是重写了子构造函数的原型，重写整个原型会切断最初原型与构造函数的联系，但实例引用的仍然是最初的原型
21. 原型链第二个问题是子类型在实例化时不能给父类型的构造函数传参
22. 盗用构造函数缺点是必须在构造函数中定义方法，因此函数不能重用。字类不能访问父类原型上定义的方法
23. Object.create(null)可以创建没有原型的完全数据字典对象
24. Object.setPrototypeOf(obj,parent) 为obj设置一个原型
25. Object.getPrototypeOf(obj) 找原型
26. obj.isPrototypeOf(obj)用于判断一个对象是否是另一个对象的长辈
27. instanceof用于判断一个对象是否在某一构造函数的原型链上
28. __proto__上有get set属性用来判断指向的目标是否是对象，不是就不指向
29. 

+ 组合继承，原型链继承原型上的属性和方法，盗用构造函数继承实例属性。父类构造函数始终会被调用两次：1、创建子类原型 2、字类构造函数中调用  
+ 原型式继承 浅复制，引用类型会和子类共享 适合不需要单独创建构造函数，但仍需要在对象间共享信息的场合。
+ 寄生式继承 思路类似寄生构造函数和工厂模式：创建一个实现继承的函数，以某种方式增强对象，然后返回这个对象。适合主要关注对象，而不在乎类型和构造函数的场景。
+ 寄生式组合继承 取得父类原型的一个副本，将返回的新对象赋值给字类原型 创建对象、增强对象、赋值对象  1、盗用构造函数继承属性 2、寄生式继承方法

* Object.getOwnPropertyDescriptor 获取属性特征
* Object.preventExtensions(object) 不可以往该对象添加属性
* Object.seal() 阻止添加新属性并将所有现有属性标记为不可配置。当前属性的值只要原来是可写的就可以改变
* Object.freeze() 不可改，比seal更严格
* set property （v） 控制访问 get property 访问器
* 用symbol可以把属性私有
* 检查原型链（instance of）
 ```js
    function checkPrototype(obj,constructor){
        if(!obj._proto_) return false;
        if(obj._proto_ == constructor.prototype) return true;
        return checkPrototype(obj._proto_,constructor);
    }
  ```

## 代理
1. new Proxy（）
2. 实现双向绑定
    ```js
    function View(){
        let proxy = new Proxy({},{
            get(obj,property){},
            set(obj,property,value){
                document
                    .querySelectorAll(`[v-model="${property}"]`)
                    .forEach(item => {
                        item.value = value
                    })
                document
                    .querySelectorAll(`[v-bind="${property}"]`)
                    .forEach(item => {
                        item.innerHTML = value
                    })
            }
        })
        this.init = function(){
            const els = document.querySelectorAll("[v-model]")
            els.forEach(item=>{
                item.addEventListener("keyup",function(){
                    proxy[this.getAttribute('v-model')] = this.value;
                })
            })
        }
    }
    ```
3. 代理工厂
4. proxy.prototype是undefined，只有用严格相等才能区分代理和目标
5. 

## 类
* 类实质上还是用原型和构造函数的概念
* 类定义没有声明提升
* 类和函数一样不能再求值前被引用 类是块作用域
* 实例可访问name属性，类表达式作用外不行
* 类构造函数必须用new操作符调用(p1.constructor() Error    new p1.constructor())
* 类是特殊函数，prototype指向自身，类本身在new调用时就会被当成构造函数，类中的constructor方法不会被当作构造函数，不能用constructor使用instanceof
* 类中的this内容都会存在于不同的实例上，类块中定义的所有内容都会定义在类原型上
* 类定义支持获取和设置访问器。语法与行为跟普通对象一样
* 静态类成员只能有一个，定义在类本身，静态类方法适合作为实例工厂
* 调用super（）会调用父类构造函数，并将返回实例赋值给this

## 柯里化函数的应用
用于检测浏览器兼容性，头部添加一个立即执行函数检测兼容性

## 函数
1. 模块模式（模块增强模式在表达式内创造要返回的字面量对象的实例，即new一个对象并添加属性和方法）
```js
    let application = function(){
        //私有变量和方法
        let components = new Array()

        //初始化
        components.push(new BaseComponent())
        //公共接口
        return{
            getComponent(){
                return components.length
            }
            registerComponent(component){
                if(typeof component == 'object'){
                    components.push(component)
                }
            }
        }
    }() //单例对象管理应用程序级的信息。
```
2. 如果构造函数返回一个对象，则该对象作为整个表达式的值返回，而传入构造函数的this将被丢弃，但是如果构造函数返回的是非对象类型，则忽略返回值，返回新创建的对象。
3. var注册在最近的函数环境，无视块作用域，for循环的块级作用域会被var忽略。
4. 生成器函数能生成一组值的序列，但每个值的生成是基于每次请求，并不同于标准函数那样立即生成。
5. 调用生成器函数不一定会执行生成器函数体，通过创建迭代器对象，可以与生成器通信。迭代器用于控制生成器的执行，迭代器对象暴露的最基本接口时next方法，这个方法可以用来向生成器请求一个值进而控制生成器。
6. 生成器函数遍历dom树
```js
    function* DomTraversal(element){
        yield element
        element = element.firstElementChild
        while (element){
            yield* DomTraversal(element)
            element = element.nextElementSibling
        }
    }

    const subTree = document.getElementById("subTree")
    for(let element of DomTraversal(subTree)){
        console.log(element.nodeName)
    }
```
7. 标准函数仅仅会被重复调用，每次调用都会创建一个新的执行环境上下文。相比之下，生成器的执行环境上下文则会暂时挂起并在将来恢复。
8. 


## promise
1. promise.resolve()静态方法能够包装任何非promise值，包括错误对象，将其转化为解决的期约，如果传入的参数本身就是一个期约，那它的行为就类似于一个空包装。可以说是一个幂等方法，这个幂等性会保留传入期约的状态。
2. promise.reject()没有幂等性，传入一个期约对象，这个期约会成为它返回的拒绝期约的理由
3. promise.all()/race(),一个拒绝合成拒绝，一个待定合成待定。
4. ```js
    function compose(...fns){
        return (x)=>fns.reduce((promise, fn)=>promise.then(fn),Promise.resolve(x))
    }

    let addTen = compose(...fns);  addTen(8).then(console.log);
    ```
5. await后面跟着一个立即可用的值，函数的其余部分也会被异步求值，js运行时在碰到await关键字时，会记录在哪里暂停执行，等到await右边的值可用了，js在运行时会向消息队列中推送一个任务，这个任务会恢复异步函数的执行。如果await后面是一个期约，为了执行异步函数，实际上会有两个任务被添加到消息队列并被异步求值。
6. ```js
    async function sleep(delay){
        return new Promise(resolve)=>{setTimeout(resolve,delay)}
    }
    ```
7. promise包装定时器
   ```js
        function timeout(delay = 1000){
            return new Promise((resolve)=>setTimeout(resolve,delay))
        }
        timeout(2000)
            .then(()=>{
                console.log('123')
                return timeout(2000)
            })
            .then(()=>{
                console.log('456')
            })
   ```
8. 扁平化定时器 
    ```js
    function interval(delay = 1000,callback){
        return new Promise(resolve=>{
            let id = setInterval(()=>{
                console.log(1)
            },delay)
        })
    }
    interval(100,(id,resolve)=>{
        if(condition){
            clearIterval(id)
            resolve()
        }
    }).then()
   ```
9. ```js
    function queue(num){
        let promise = Promise.resolve();
        num.map(v=>{
            promise = promise.then(_ = >{
                return new Promise(resolve=>{
                    setTimeout(()=>{
                        console.log(v)
                        resolve()
                    },1000)
                })
            })
        })
    }
   ```
10. ```js
      function queue(num){
          num.reduce((promise,n)=>{
              return promise.then(_=>{
                  return new Promise((resolve)=>{
                      setTimeout(()=>{
                          cosole.log(n)
                          resolve()
                      },1000)
                  })
              })
          },Promise.resolve())
      }
    ```
11. 进度条
    ```js
      async function load(users){
          for(let i = 0;i < user.length;i++){
              let users = await query(users[i])
              let progress = ((i+1) / users.length) * 100;
              loading.style.width = progress + '%';
              loading.innerHTML = Math.round(progress) + '%'
          }
      }
    ```
12. 设计一个函数，用于测试请求一个 URL 的平均耗时。要求可以设置总的请求次数以及并发请求个数。假设环境是小程序，使用的接口是 wx.request ，不考虑请求失败的情况。
 
  @synopsis  测试网络请求平均耗时
 
  @param URL 请求的地址
  @param count 请求的总次数，取值范围 >= 1
  @param concurrentCount 并发请求限制个数（即最多只能同时发起多少个请求）。取值范围 >=1
 
  @returns 一个 Promise 对象，resolve 平均耗时

```js
    let count1 = count
    function wxRequest (url){
        return new Promise((resovle, reject)=>{
            let beginTime = new Date()
            let runTime
            wx.request({
                url:url
                success(){
                    runTime = new Date()-beginTime
                    resolve(runTime)
                }
            })
        })
    }
    
    let _count = 0
    let Time
    function bao(){
        _count++
        console.log("并发：",_count)
        if( count > 0 && _count < concurrentCount){
            wxRequest(url).then((runTime)=>{
                count--
                _count--
                Time += runTime
            }).then(bao)
        }
        if(count == 0){
            return Promise.resolve(Time/count1)
        }
    }

    for(let i = 0; i < concurrentCount; i++){
        bao()
    }
```

13. // JS实现一个带并发限制的异步调度器Scheduler，
    // 保证同时运行的任务最多有两个。
    // 完善代码中Scheduler类，
    // 使得以下程序能正确输出
```js
    class Scheduler {
        constructor() {
            this.count = 2
            this.queue = []
            this.run = []
        }

        add(task) {
                    // ...
        }
    }


    const timeout = (time) => new Promise(resolve => {
        setTimeout(resolve, time)
    })

    const scheduler = new Scheduler()
    const addTask = (time, order) => {
        scheduler.add(() => timeout(time)).then(() => console.log(order))
    }

    addTask(1000, '1')
    addTask(500, '2')
    addTask(300, '3')
    addTask(400, '4')
    // output: 2 3 1 4

    // 一开始，1、2两个任务进入队列
    // 500ms时，2完成，输出2，任务3进队
    // 800ms时，3完成，输出3，任务4进队
    // 1000ms时，1完成，输出1
    // 1200ms时，4完成，输出4

    class Scheduler {
    constructor() {
        this.awatiArr = [];
        this.count = 0;
    }
    async add(promiseCreator) {
        if (this.count >= 2) {
        await new Promise((resolve) => {
            this.awatiArr.push(resolve);
        });
        }
        this.count++;
        const res = await promiseCreator();
        this.count--;
        if (this.awatiArr.length) {
        // 前面promise的resolve
        this.awatiArr.shift()();
        }
        return res;
    }
    }
    const scheduler = new Scheduler();
    const timeout = (time) => {
    return new Promise(r => setTimeout(r, time))
    }
    const addTask = (time, order) => {
    scheduler.add(() => timeout(time))
        .then(() => console.log(order))
    }
    // test
    // addTask(1000, 1)
    // addTask(500, 2)
    // addTask(300, 3)
    // addTask(400, 4)
 ```
 [解释地址](https://fanerge.github.io/2020/%E6%9D%A5%E5%87%A0%E9%81%93Promise%E7%9A%84%E9%A2%98%EF%BC%8C%E7%9C%8B%E7%9C%8B%E4%BD%A0%E4%BC%9A%E5%87%A0%E9%81%93.html)

## Eventloop
1. js放在dom渲染后面
2. 

## DOM
1. dom总共有12种节点类型，这些类型都继承一种基本类型
2. NodeList是类数组对象，是DOM结构的查询，会根据DOM结构变化实时变化，是实时的活动对象，而不是第一次访问时所获得的内容的快照
3. cloneNode（）方法不会复制添加到DOM节点的js属性，比如事件处理程序
4. 当页面中包含来自某个不同子域的窗格（<frame>）或者内嵌窗格（<iframe>）时，设置document.domain时有用的，因为跨源通信隐患，不同子域无法通过js通信，如果把document.domain设置成相同值，这些页面就可以访问对方js了，这个属性一旦放松就不能收紧了
5. querySelector（）返回的是NodeList的静态实例，只是静态的快照而不是实时的查询
6. selectors API采用的css选择符的模式匹配dom元素
7. defer可以延迟脚本执行
8. getElementById属于document方法,节点对象不可用
9. attachEvent（）事件处理程序是在全局作用域中运行的，this指向window，这里与DOM0方式不一样
10. attachEvent（）事件处理程序会以添加它们的顺序反向触发
11. dom中发生事件时，所有相关信息都会被收集并存储在一个名为event对象中，这个对象包含了一些基本操作信息，比如导致事件的元素，发生的事件类型
12. 在事件处理程序内部，this对象始终等于currentTarget值，target只包含事件的实际目标
13. event对象旨在事件处理程序执行期间存在，执行完毕后就会销毁
14. 如果事件处理程序使用dom0方式指定的，event对象只是window对象的一个属性，需要通过window.event调用，如果事件处理程序使用attachEvent（）指定的，则event对象会作为唯一的参数传给处理函数，event对象仍然时window对象的属性
15. ie事件对象中用srcElement替代this
-   ```js
        let EventUtil = {
            addHandler: function(element, type, handler){

            },
            getEvent: function(){
                return event? event:window.event
            },
            getTarget: function(){
                return event.target || event.srcElement
            },
            preventDefault: function(){
                if(event.preventDefault){
                    event.preventDefault()
                }else{
                    event.returnValue = false
                }
            },
            removeHandler: function(...){},
            stopPropagation: function(event){
                if(event.stopPropagation){
                    event.stopPropagation()
                }else{
                    event.cancelBubble = true
                }
            }
        }
    ```
## 跨域请求
- 跨域xhr对象也施加了一些额外限制
 1.不能使用setRequestHeader（）设置自定义头部
 2.不能发送和接收cookie
 3.getAllResponseHeaders（）方法始终返回空字符串

- cors通过一种叫预检请求的服务器验证机制，允许使用自定义头部、除get、post以外的方法，以及不同请求体内容类型
- 图片探测是利用img标签实现跨域通信的最早的一种技术，是与服务器之间简单、跨域、单向的通信。数据通过查询字符串发送，但可以通过监听onload和onerror事件知道什么时候接收到响应。用于跟踪用户在页面上的点击操作或动态显示广告。缺点是只能发送get请求和无法获取服务器响应的内容
- jsonp 包含在一个函数调用里，通过动态创建<script>元素并为src属性指定跨域URL实现的，和img类似，能够不受限制从其他域加载资源，相比图片探测，使用jsonp可以直接访问响应，实现浏览器与服务器的双向通信，缺点是从不同域拉去可执行代码，要保证可信，第二个是不好确定jsonp请求是否失败，为此开发者经常使用计时器来决定是否放弃等待响应。这种方式并不准确，毕竟不同用户的网络连接速度和带宽是不一样的
- 

## vue
- 计算属性是基于它们的响应式依赖进行缓存的。只在相关响应式依赖发生改变时它们才会重新求值。这就意味着只要data还没有发生改变，多次访问计算属性会立即返回之前的计算结果，而不必再次执行函数。
- 虽然计算属性在大多数情况下更合适，但有时也需要一个自定义的侦听器。这就是为什么 Vue 通过 watch 选项提供了一个更通用的方法，来响应数据的变化。当需要在数据变化时执行异步或开销较大的操作时，这个方式是最有用的。
- v-if 指令用于条件性地渲染一块内容。这块内容只会在指令的表达式返回 truthy 值的时候被渲染。
- Vue 会尽可能高效地渲染元素，通常会复用已有元素而不是从头开始渲染。这么做除了使 Vue 变得非常快之外，还有其它一些好处。
- Vue 为你提供了一种方式来表达“这两个元素是完全独立的，不要复用它们”。只需添加一个具有唯一值的 key attribute 即可
- 另一个用于根据条件展示元素的选项是 v-show 指令。用法大致一样，不同的是带有 v-show 的元素始终会被渲染并保留在 DOM 中。v-show 只是简单地切换元素的 CSS property display
- v-show 不支持 <template> 元素，也不支持 v-else
- v-if 是“真正”的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。
- v-if 也是惰性的：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。
- 相比之下，v-show 就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于 CSS 进行切换。
- 一般来说，v-if 有更高的切换开销，而 v-show 有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用 v-show 较好；如果在运行时条件很少改变，则使用 v-if 较好。
- 组件的 data 必须是一个函数。当 data 的值是一个对象时，它会在这个组件的所有实例之间共享。我们可能希望重用这个组件，允许用户维护多个列表 (比如分为购物、心愿单、日常事务等)。这时就会产生问题。因为每个组件的实例都引用了相同的数据对象，更改其中一个列表的标题就会改变其它每一个列表的标题。增删改一个待办事项的时候也是如此。在一个 Vue 的根实例上直接使用对象是可以的，因为只存在一个这样的实例。

## vuex
- mutation不支持异步，action支持异步操作，但是在action中还是要通过触发mutation的方式间接变更数据，actions方法里，用commit触发mutation里的方法来变更数据，dispatch触发actions里面的方法。

## 页面生命周期
1. 页面构建阶段：目标是建立web应用的UI，其中包括两个步骤，这两个步骤会交替执行多次
    1. 解析HTML代码并构建DOM树
    2. 执行js代码
- 浏览器暴露给js引擎的主要对象是window对象，它代表了包含着一个页面的窗口。window对象是获取其他所有全局对象、全局变量（包括用户定义的对象）和浏览器API的访问途径。全局window对象最重要的属性是document，代表了当前页面的DOM。
2. 事件处理：在页面构建阶段执行的js代码除了修改DOM，还会注册事件监听器，浏览器是单线程执行模型。 