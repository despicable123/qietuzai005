
function myNew(){
    // 创建一个新对象obj，声明要返回的结果result,取参数的第一项为构造函数fn
    let obj = new Object(),result,fn = [].shift.call(arguments);
    // 将obj.__proto__连接到构造函数fn的原型
    obj.__proto__ = fn.prototype;
    // result接收构造函数执行后的返回结果，this指向obj
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
  let self = this  //接收外部是谁调用bind
  let Fmiddle = function(){}
  let Fn = function(...args2){
    return self.apply(this instanceof Fmiddle? this : context,[...args1].contact([...args2]))//判断是new绑定还是直接绑定，new绑定就绑定new调用的this，直接绑定的话 this指向上下文
  }
      //如果调用bind的方法是原型上的方法，需要将返回函数的原型链指向调用bind的方法 使得A的实例可以使用Animal的属性
  Fmiddle.prototype = this.prototype //不使用Fn.prototype = this.prototype 原因是Fn.prototype改变时 this.prototype也会改变 所以用一个空函数作为桥梁 执行完空函数就销毁了
  Fn.prototype = new Fmiddle();
  return Fn;
}
  
function mycall(obj,...args){
  let obj = obj || window
  obj.p = this    //调用函数添加进属性 并且调用call的函数里面的this指向obj
  
  let res = obj.p(...args);        //执行调用函数
  delete obj.p    //执行完毕后删除该属性
  return res
}

function myapply(obj,arr){
  let obj = obj || window
  obj.p = this    //调用函数添加进属性 并且调用call的函数里面的this指向obj
  let res
  if(!arr){
    res = obj.p()
  }
  else {res = obj.p(...arr);}        //执行调用函数
  delete obj.p    //执行完毕后删除该属性
  return res
}

//柯里化封装fn
function progressCurring(fn,args){
  var that = this
  var len = fn.length
  var args = args || [];
  return function(){
    var _args = Array.prototype.slice.call(arguments)
    Array.prototype.push.apply(args,_args);

    if(_args.length < len){
      return progressCurring.call(that,fn,_args);
    }

    return fn.apply(this,_args)
  }
}

//add 柯里化
function add(){
  var _args = Array.prototype.slice.call(arguments);

  var adder = function(){
    _args.push(...arguments)
    return adder;
  }

  adder.toString = function(){
    return _args.reduce((l,r)=> l+r,0)
  }
  return adder
}