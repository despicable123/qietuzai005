
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

  

  