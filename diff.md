1. 真正发请求的函数再 xhr.js 里
2. node 客户端发其 http 请求在 http.js 里
3. 返回 promise
4. 老虚拟 dom 和新虚拟 dom 进行 diff，算出应该如何最小量更新，最后反映到真正 dom 上
5. h 函数用来产生虚拟节点
6. vnode 结构

```js
{
  children:
  data:{}//属性和类
  elm:{}
  key:
  sel:  //select
  text:
}
```

7. `let myVnode = h('a',{props:{href:'www'}},'123456')`
   patch 让虚拟节点上树
8. h 函数可以嵌套使用，必须用[]，不能 h(h(),h())
9. vnode 函数

```js
export default function (sel, data, children, text, elm) {
  return {
    sel,
    data,
    children,
    text,
    elm,
  };
}
```

10.

```js
//h('div',{},'文字')
//h('div',{},[])
//h('div',{},h())
export default function (sel, data, c) {
  if (typeof c == "string" || typeof c == "number") {
    return vnode(sel, data, undefined, c, undefined);
  } else if (Array.isArray(c)) {
    for (let i = 0; i < c.length; i++) {
      let children = [];
      //检查c[i]必须是一个对象
      if (typeof c[i] === "object" && c[i].hasOwnProperty("sel")) {
        children.push(c[i]);
      } else {
        throw Error();
      }
      return vnode(sel, data, children, undefined, undefined);
    }
  } else if (typeof c === "object" && c.hasOwnProperty("sel")) {
  } else {
    throw Error();
  }
}
```

11. key 的重要性,key 是节点的唯一标识,告诉 diff 算法，在更改前后它们是同一个 dom 节点。只有是同一个虚拟节点，才进行精细化比较，否则就暴力删除旧的、插入新的。选择器相同且 key 相同就是同一个虚拟节点，只进行同层比较，不会跨层比较。

- 创建节点

```js
export default function (vnode, pivot) {
  let domNode = document.createElement(vnode.sel);
  if (
    vnode.text != "" &&
    (vnode.children == undefined || vnode.children.length == 0)
  ) {
    domNode.innerText = vnode.text;
    pivot.parentNode.insertBefore(domNode, pivot);
  } else if (Array.isArray(vnode.children) && vnode.children.length > 0) {
    //内部时子节点，就要递归创建节点
  }
}
```

```js
//真正创建节点，不进行插入
export default function (vnode) {
  let domNode = document.createElement(vnode.sel);
  if (
    vnode.text != "" &&
    (vnode.children == undefined || vnode.children.length == 0)
  ) {
    domNode.innerText = vnode.text;
    vnode.elm = domNode;
  } else if (Array.isArray(vnode.children) && vnode.children.length > 0) {
    //内部时子节点，就要递归创建节点
  }
}
```

- patch 函数被调用
- ov 是虚拟节点还是 dom 节点（首次上树的时候就是 dom 节点，如果是 dom 节点的话会调用 h 函数包装成虚拟节点）
- ov 和 nv 是不是同一个节点，不是就暴力删除旧的，插入新的，是的就进行精细化比较
- 创建节点时，插入到未处理之前，creatElement(nv,ov.elm) 所有子节点都是需要递归创建的,判断有子节点还是有文本（不共存）

- ov 和 nv 是不是内存中同一个对象，是的话就什么都不用做，不是的话进入下一步
- nv 有没有 text 属性，有的话判断 ov nv 的 text 是否相同，不同的话就把 ov.elm 的 innerText 变为 nv 的 text
- ov 有没有 children，没有的话清空 ov 的 text，并把 nv 的 children 添加到 dom 中
- 最复杂情况，都有 children
- 首先不是判断 1234 命中，而是略过已经加过 undefined 标记的东西
