1. 一个以上的js用defer推迟，dom解析完后，按原顺序执行，都会在DOMContentLoaded事件之前执行，不过实际当中不一定会这样
2. async可能在DOMContentLoaded之前也可能在之后，在load之前
3. s = Symbol.for('foo') 有就重用没有就创建，Symbol('foo')不行，表示唯一
4. Symbol.keyFor(s) = 'foo'
5. 执行上下文
6. document.domain + iframe跨域（放松到二级域名相同，之后不能收紧）document.url和referrer不可修改
7. HTMLCollection 和 NodeList 
8. 计算样式只读