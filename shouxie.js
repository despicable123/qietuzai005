function myNew() {
  // 创建一个新对象obj，声明要返回的结果result,取参数的第一项为构造函数fn
  let obj = new Object(),
    result,
    fn = [].shift.call(arguments);
  // 将obj.__proto__连接到构造函数fn的原型
  obj.__proto__ = fn.prototype;
  // result接收构造函数执行后的返回结果，this指向obj
  result = arguments.length > 0 ? fn.apply(obj, arguments) : fn.apply(obj);
  // 如果构造函数返回一个对象，则将该对象返回，否则返回步骤1创建的对象
  return typeof result === "object" ? result : obj;
}

//最好是下面这种方式，上面直接操作_proto_性能损耗较大
function _new(fn, ...rest) {
  //基于fn的prototype构建对象的原型
  const thisObj = Object.create(fn.prototype);
  //将thisObj作为fn的this，继承其属性，并获取返回结果为result
  const result = fn.apply(thisObj, rest);
  //根据result对象的类型决定返回结果
  return typeof result === "object" ? result : thisObj;
}

function copy(object) {
  let res = {};
  for (const key in object) {
    res[key] = object[key];
  }
  return res;
}

function deepcopy(obj) {
  let res = obj instanceof Array ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    //无论数组还是对象都可以被解构
    res[k] = typeof v === "object" ? deepcopy(v) : v;
  }
  return res;
}

A = Animal.bind(Cat, name);
a = new A(age);
Function.prototype.mybind = function (context, ...args1) {
  // if(typeof this !== "function") throw new Error('not function')
  let self = this; //接收外部是谁调用bind
  let Fmiddle = function () {};
  let Fn = function (...args2) {
    return self.apply(
      this instanceof Fmiddle ? this : context,
      [...args1].contact([...args2])
    ); //判断是new绑定还是直接绑定，new绑定就绑定new调用的this，直接绑定的话 this指向上下文
  };
  //如果调用bind的方法是原型上的方法，需要将返回函数的原型链指向调用bind的方法 使得A的实例可以使用Animal的属性
  Fmiddle.prototype = self.prototype; //不使用Fn.prototype = this.prototype 原因是Fn.prototype改变时 this.prototype也会改变 所以用一个空函数作为桥梁 执行完空函数就销毁了
  Fn.prototype = new Fmiddle();
  return Fn;
};

function mycall(obj, ...args) {
  let obj = obj || window;
  obj.p = this; //调用函数添加进属性 并且调用call的函数里面的this指向obj

  let res = obj.p(...args); //执行调用函数
  delete obj.p; //执行完毕后删除该属性
  return res;
}

function myapply(obj, arr) {
  let obj = obj || window;
  obj.p = this; //调用函数添加进属性 并且调用call的函数里面的this指向obj
  let res;
  if (!arr) {
    res = obj.p();
  } else {
    res = obj.p(...arr);
  } //执行调用函数
  delete obj.p; //执行完毕后删除该属性
  return res;
}

//柯里化封装fn
function progressCurring(fn, args) {
  var len = fn.length;
  var args = args || [];
  return function () {
    var sub_args = Array.prototype.slice.call(arguments);
    let _args = Array.prototype.concat.apply(args, sub_args);

    if (_args.length < len) {
      return progressCurring.call(this, fn, _args);
    }
    return fn.apply(this, _args);
  };
}

// 第二版
function sub_curry(fn) {
  var args = [].slice.call(arguments, 1);
  return function () {
    return fn.apply(this, args.concat([].slice.call(arguments)));
  };
}

function curry(fn, length) {
  length = length || fn.length;

  var slice = Array.prototype.slice;

  return function () {
    if (arguments.length < length) {
      var combined = [fn].concat(slice.call(arguments));
      return curry(sub_curry.apply(this, combined), length - arguments.length);
    } else {
      return fn.apply(this, arguments);
    }
  };
}

//add 柯里化
function add() {
  var _args = Array.prototype.slice.call(arguments);

  var adder = function () {
    _args.push(...arguments);
    return adder;
  };

  adder.toString = function () {
    return _args.reduce((l, r) => l + r, 0);
  };
  return adder;
}

//定时器
function handle() {
  let i = 0;
  (function run() {
    hd.innerHTML = i;
    hd.style.width = i + "%";
    if (++i <= 100) {
      setTimeout(run, 20);
    }
  })();
}
handle();

//手写Promise
class myPromise {
  static PENDING = "pending";
  static FUFILLED = "fulfilled";
  static REJECTED = "rejected";
  constructor(executor) {
    this.status = myPromise.PENDING;
    this.value = null;
    this.callback = [];
    //捕获异常
    try {
      //bind硬绑定this
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }
  resolve(value) {
    //防止状态改变
    if (this.status == myPromise.PENDING) {
      this.status = myPromise.FUFILLED;
      this.value = value;
      setTimeout(() => {
        this.callback.map((callback) => {
          callback.onFulfilled(value);
        });
      }, 0);
    }
  }
  reject(reason) {
    if (this.status == myPromise.PENDING) {
      this.status = myPromise.REJECTED;
      this.value = reason;
      setTimeout(() => {
        this.callback.map((callback) => {
          callback.onRejected(reason);
        });
      }, 0);
    }
  }
  then(onFulfilled, onRejected) {
    if (typeof onFulfilled != "function") {
      onFulfilled = () => this.value;
    }
    if (typeof onRejected != "function") {
      onFulfilled = () => {
        throw this.value;
      };
    }

    let promise = new myPromise(() => {
      if (this.status == myPromise.PENDING) {
        this.callback.push({
          onFulfilled: (value) => {
            this.parse(promise, onFulfilled(value), resolve, reject);
          },
          onRejected: (value) => {
            this.parse(promise, onRejected(value), resolve, reject);
          },
        });
      }

      if (this.status == myPromise.FUFILLED) {
        //实现异步
        setTimeout(() => {
          this.parse(promise, onFulfilled(this.value), resolve, reject);
        }, 0);
      } else if (this.status == myPromise.REJECTED) {
        setTimeout(() => {
          this.parse(promise, onRejected(this.value), resolve, reject);
        }, 0);
      }
    });

    return promise;
  }

  parse(promise, result, resolve, reject) {
    if (promise == result) {
      throw new TypeError("Chaining cycle detected");
    }
    try {
      if (result instanceof myPromise) {
        result.then(resolve, reject);
      } else {
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  }

  static resolve(value) {
    return new myPromise((resolve, reject) => {
      if (value instanceof myPromise) {
        value.then(resolve, reject);
      } else resolve(value);
    });
  }

  static reject(value) {
    return new myPromise((resolve, reject) => {
      if (value instanceof myPromise) {
        value.then(resolve, reject);
      } else resolve(value);
    });
  }

  static all(promises) {
    const resolves = [];
    let i = 0;
    return new Promise((res, rej) => {
      promises.forEach((promise, index) => {
        promise.then(
          (value) => {
            resolves[index] = value;
            i++;
            if (promises.length === i) {
              res(resolves);
            }
          },
          (reason) => {
            rej(reason);
          }
        );
      });
    });
  }

  static race(promises) {
    return new myPromise((resolve, reject) => {
      promises.map((promise) => {
        promise.then(
          (value) => {
            resolve(value);
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  }
}

//使用Promise实现每隔1秒输出1,2,3
const arr = [1, 2, 3];
arr.reduce((p, x) => {
  return p.then(() => {
    return new Promise((r) => {
      setTimeout(() => r(console.log(x)), 1000);
    });
  });
}, Promise.resolve());

arr.reduce(
  (p, x) =>
    p.then(
      () => new Promise((res, rej) => setTimeout(res(console.log(x)), 1000))
    ),
  Promise.resolve()
);

//使用Promise实现红绿灯交替重复亮
function red() {
  console.log("red");
}

function green() {
  console.log("green");
}

function yellow() {
  console.log("yellow");
}

function light(delay, cb) {
  return new Promise((r) => {
    setTimeout(() => {
      cb();
      r();
    }, delay);
  });
}
const step = function () {
  Promise.resolve()
    .then(() => {
      return light(3000, red);
    })
    .then(() => {
      return light(2000, green);
    })
    .then(() => {
      return light(1000, yellow);
    })
    .then(() => {
      return step();
    });
};
step();

// 实现mergePromise函数
const time = (timer) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timer);
  });
};
const ajax1 = () =>
  time(2000).then(() => {
    console.log(1);
    return 1;
  });
const ajax2 = () =>
  time(1000).then(() => {
    console.log(2);
    return 2;
  });
const ajax3 = () =>
  time(1000).then(() => {
    console.log(3);
    return 3;
  });

function mergePromise(array) {
  // 在这里写代码
  let data = [];
  let promise = Promise.resolve();
  array.forEach((ajax) => {
    promise = promise
      .then(() => {
        return ajax();
      })
      .then((res) => {
        data.push(res);
        return data;
      });
  });
  return promise;
}

mergePromise([ajax1, ajax2, ajax3]).then((data) => {
  console.log("done");
  console.log(data); // data 为 [1, 2, 3]
});

// 要求分别输出
// 1
// 2
// 3
// done
// [1, 2, 3]

//控制并发
// 计数器
var count = 0;
// 全局锁
var lock = [];
var l = urls.length;
// 阻塞函数
function block() {
  let _resolve;
  return new Promise((resolve, reject) => {
    _resolve = resolve;
    // resolve不执行,将其推入lock数组;
    lock.push(_resolve);
  });
}
// 叫号机
function next() {
  lock.length && lock.shift()();
}
async function bao() {
  if (count >= 3) {
    //超过限制利用await和promise进行阻塞;
    await block();
  }
  if (urls.length > 0) {
    console.log(count);
    count++;
    await loadImg(urls.shift());
    count--;
    next();
  }
}
for (let i = 0; i < l; i++) {
  bao();
}

async function run() {
  if (count > limit) {
    await block();
  }
  if (promises.length) {
    count++;
    await promises.shift()();
    count--;
    next();
  }
}

function next() {
  lock.length && lock.shift()();
}

// vue响应式原理
class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  notify() {
    this.subs.forEach((sub) => {
      sub.update();
    });
  }
}

class Watcher {
  constructor() {
    Dep.target = this;
  }
  update() {
    //更新视图的方法
  }
}

function defineReactive() {
  const dep = new Dep();

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      dep.addSub(Dep.target);
    },
    set: function reactiveSetter(newVal) {
      if (newVal == val) return;
      val = newVal;
      dep.notify();
      console.log("update");
    },
  });
}

function observer(value) {
  if (!value || typeof value !== "object") {
    return;
  }

  Object.keys(value).forEach((key) => {
    defineReactive(value, key, value[key]);
  });
}
class Vue {
  constructor(options) {
    this._data = options.data();
    observer(this._data);
  }
}

let o = new Vue({
  data: {
    test: "I am test.",
  },
});
o._data.test = "hello,test.";

//数组扁平化
function flatten(arr) {
  arr.reduce((r, l) => {
    return r.concat(l instanceof Array ? flatten(l) : l);
  }, []);
}

//对象扁平化 深搜索
function flattenObj(obj, tempKey, resObj) {
  tempKey = tempKey || "";
  resObj = resObj || {};
  for (let key in obj) {
    let value = obj[key];
    tempKey = tempKey + key + ".";
    if (typeof value === "object") {
      flattenObj(value, tempKey, resObj);
    } else {
      resObj[key] = value;
    }
  }
  return resObj;
}

//promise封装ajax
//封装一个ajax请求
function ajax(options) {
  //创建XMLHttpRequest对象
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();

    //初始化参数的内容
    options = options || {};
    options.type = (options.type || "GET").toUpperCase();
    options.dataType = options.dataType || "json";
    const params = options.data;

    //发送请求
    if (options.type === "GET") {
      xhr.open("GET", options.url + "?" + params, true);
      xhr.send(null);
    } else if (options.type === "POST") {
      xhr.open("POST", options.url, true);
      xhr.send(params);

      //接收请求
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          let status = xhr.status;
          if (status >= 200 && status < 300) {
            options.success &&
              options.success(xhr.responseText, xhr.responseXML);
          } else {
            options.fail && options.fail(status);
          }
        }
      };
    }
  });
}

function getType(target) {
  return Object.prototype.toString.call(target);
}
const mapTag = "[object Map]";
const setTag = "[object Set]";
const arrayTag = "[object Array]";
const objectTag = "[object Object]";
const boolTag = "[object Boolean]";
const dateTag = "[object Date]";
const errorTag = "[object Error]";
const numberTag = "[object Number]";
const regexpTag = "[object RegExp]";
const stringTag = "[object String]";
const symbolTag = "[object Symbol]";

function getInit(target) {
  const Ctor = target.constructor;
  return new Ctor();
}

//完全版的深克隆
function clone(target, map = new WeakMap()) {
  // 克隆原始类型
  if (!isObject(target)) {
    return target;
  }

  // 初始化
  const type = getType(target);
  let cloneTarget;
  if (deepTag.includes(type)) {
    cloneTarget = getInit(target, type);
  }

  // 防止循环引用
  if (map.get(target)) {
    return map.get(target);
  }
  map.set(target, cloneTarget);

  // 克隆set
  if (type === setTag) {
    target.forEach((value) => {
      cloneTarget.add(clone(value, map));
    });
    return cloneTarget;
  }

  // 克隆map
  if (type === mapTag) {
    target.forEach((value, key) => {
      cloneTarget.set(key, clone(value, map));
    });
    return cloneTarget;
  }

  // 克隆对象和数组
  const keys = type === arrayTag ? undefined : Object.keys(target);
  forEach(keys || target, (value, key) => {
    if (keys) {
      key = value;
    }
    cloneTarget[key] = clone(target[key], map);
  });

  return cloneTarget;
}

//仅克服循环引用
function clone(target, map = new Map()) {
  if (typeof target === "object") {
    let cloneTarget = Array.isArray(target) ? [] : {};
    if (map.get(target)) {
      return map.get(target);
    }
    map.set(target, cloneTarget);
    for (const key in target) {
      cloneTarget[key] = clone(target[key], map);
    }
    return cloneTarget;
  } else {
    return target;
  }
}

//深比较
function diff(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  } else {
    for (let key of keys1) {
      if (!obj2.hasOwnProperty(key)) {
        return false;
      }
      //类型相同
      if (typeof obj1[key] === typeof obj2[key]) {
        //同为引用类型
        if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
          if (obj1[key] === null && obj2[key] === null) {
          } else if (
            (obj1[key] === null && obj2[key] !== null) ||
            (obj1[key] !== null && obj2[key] === null)
          ) {
            return false;
          } else {
            const equal = diff(obj1[key], obj2[key]);
            if (!equal) {
              return false;
            }
          }
        }
        //同为基础数据类型
        if (
          typeof obj1[key] !== "object" &&
          typeof obj2[key] !== "object" &&
          obj1[key] !== obj2[key]
        ) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  return true;
}

//深搜索
function searchKeys(obj, value) {
  for (let key in obj) {
    if (obj[key] === value) {
      //找到了 value
      return key;
    } else {
      //不是要找的 value
      if (typeof obj[key] === "object") {
        //该值为对象
        let temp = searchKeys(obj[key], value);

        if (temp) {
          //temp 不是 undefined，找到了 value
          return `${temp}, ${key}`;
        }
      }
    }
  }
}

for (let key in obj) {
  if (obj[key] === value) {
    return key;
  } else {
    if (typeof obj[key] === "obj") {
      let res = searchkeys(obj[key], value);
      if (res) {
        return `${res}\/${key}`;
      }
    }
  }
}

function getEmpty(o) {
  if (Object.prototype.toString.call(o) === "[object Object]") {
    return {};
  }
  if (Object.prototype.toString.call(o) === "[object Array]") {
    return [];
  }
  return o;
}
//深拷贝 广度优先遍历
function deepCopyBFS(origin) {
  let queue = [];
  let map = new Map(); // 记录出现过的对象，用于处理环

  let target = getEmpty(origin);
  if (target !== origin) {
    queue.push([origin, target]);
    map.set(origin, target);
  }

  while (queue.length) {
    let [ori, tar] = queue.shift();
    for (let key in ori) {
      // 处理环状
      if (map.get(ori[key])) {
        tar[key] = map.get(ori[key]);
        continue;
      }

      tar[key] = getEmpty(ori[key]);
      if (tar[key] !== ori[key]) {
        queue.push([ori[key], tar[key]]);
        map.set(ori[key], tar[key]);
      }
    }
  }
  return target;
}
