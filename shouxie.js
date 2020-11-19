
function myNew(){
    // 创建一个新对象obj，声明要返回的结果result,取参数的第一项为构造函数fn
    let obj = new Object(),result,fn = [].shift.call(arguments);
    // 将obj.__proto__连接到构造函数fn的原型
    obj.__proto__ = fn.prototype;
    // result接收构造函数执行后的返回结果
    result = arguments.length>0?fn.apply(obj,arguments):fn.apply(obj);
    // 如果构造函数返回一个对象，则将该对象返回，否则返回步骤1创建的对象
    return typeof result === 'object'?result:obj;
  }

function copy(object){
  let res = {};
  for (const key in object){
    res[key] = object[key]
  }
  return res
}

function deepcopy(obj){
  let res = obj instanceof Array?[]:{};
  for(const [k,v] of Object.entries(obj)){ //无论数组还是对象都可以被解构
    res[k] = typeof v == 'object'?deepcopy(v):v;
  }
  return res;
}


A = Animal.bind(Cat,name)
a = new A(age)
function mybind(context,...args1){
  if(typeof this !== "function") throw new Error('not function')
  var self = this  //接收外部是谁调用bind
  var Fn = function(...args2){
    return self.apply(this instanceof context? this : context,[...args1].contact([...args2]))//判断是new绑定还是直接绑定，new绑定就绑定new调用的this，直接绑定的话 this指向上下文
  }
  var Fmiddle = function(){}
  Fmiddle = this.prototype
  Fn.prototype = new Fmiddle();
  return Fn;
}
  