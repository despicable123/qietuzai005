### 帮我们在旧的浏览器环境中将ES6+代码转换成向后兼容版本的JS代码

## @babel/cli
@babel/core Babel的核心模块.
@babel/cli 它是一个终端运行工具, 内置的插件,运行你从终端使用babel的工具.
`$ ./node_modules/.bin/babel src --out-dir lib`它使用我们设置的解析方式来解析src目录下的所有JS文件, 并将转换后的每个文件都输出到lib目录下.解析方式见presets和plugins
## plugins
它的本质就是一个JS程序, 指示着Babel如何对代码进行转换.
可以编写自己的插件来应用你想要的任何代码转换.
要将箭头函数转成ES5, 可以依赖官方插件`@babel/plugin-transform-arrow-functions`
## presets
如果想要转换ES6+的其它代码为ES5, 我们可以使用"preset"来代替预先设定的一组插件, 而不是逐一添加我们想要的所有插件.
这里可以理解为一个preset就是一组插件的集合.
`@babel/preset-env`这个preset包括支持现代JavaScript(ES6+)的所有插件.
安装使用了envpreset之后, 就可以看到其它ES6+语法的转换了.
## 配置Babel
```js
const presets = [
	[
    "@babel/env",
    {
      targets: {
        edge: "17",
        chrome: "64",
        firefox: "60",
        safari: "11.1"
      }
    }
  ]	
]

module.exports = { presets };
```
加上这个配置的作用是:
使用了envpreset这个preset
envpreset只会为目标浏览器中没有的功能加载转换插件
例如我这里配置的其中一项是edge: "17", 那就表示它转换之后的代码支持到edge17. edge17本身支持所有ES6+语法，所以不会转换
## polyfill
Polyfill是对执行环境或者其它功能的一个补充.
就像现在你想在edge10浏览器中使用ES7中的方法includes(), 但是我们知道这个版本的浏览器环境是不支持你使用这个方法的, 所以如果你强行使用并不能达到预期的效果.
而polyfill的作用正是如此, 知道你的环境不允许, 那就帮你引用一个这个环境, 也就是说此时编译后的代码就会变成这样:
```js
// 原来的代码
var hasTwo = [1, 2, 3].includes(2);

// 加了polyfill之后的代码
require("core-js/modules/es7.array.includes");
require("core-js/modules/es6.string.includes");
var hasTwo = [1, 2, 3].includes(2);
```
@babel/polyfill用来模拟完成ES6+环境:
可以使用像Promise或者WeakMap这样的新内置函数
可以使用像Array.from或者Object.assign这样的静态方法
可以使用像Array.prototype.includes这样的实例方法
还有generator函数
为了实现这一点, Polyfill增加了全局范围以及像String这样的原生原型.
而@babel/polyfill模块包括了core-js和自定义regenerator runtime
对于库/工具来说, 如果你不需要像Array.prototype.includes这样的实例方法, 可以使用transform runtime插件, 而不是使用污染全局的@babel/polyfill.
`cnpm i --save @babel/polyfill`
(注意 --save 选项而不是 --save-dev，因为这是一个需要在源代码之前运行的 polyfill。)
但是由于我们使用的是envpreset, 这里个配置中有一个叫做 "useBuiltIns"的选项
如果将这个选择设置为"usage", 就只包括你需要的polyfill
```js
const presets = [
	[
		"@babel/env",
		{
			targets: {
				edge: "17",
				chrome: "64",
				firefox: "67",
				safari: '11.1'
			},
+			useBuiltIns: "usage"
		}
	]
]

module.exports = { presets }
```
安装配置了@babel/polyfill, Babel将检查你的所有代码, 然后查找目标环境中缺少的功能, 并引入仅包含所需的polyfill
(如果我们没有将 env preset 的 "useBuiltIns" 选项的设置为 "usage" ，就必须在其他代码之前 require 一次完整的 polyfill。)
@babel/polyfill帮我们引入了Edge17 环境中没有的promise.finally()`require("core-js/modules/es7.promise.finally");`
## 被deprecated的@babel/polyfill
名为@babel/polyfill的polypill, 其实它在Babel7.4.0以上已经不被推荐使用了.
而是推荐使用core-js@3+@babel/preset-env然后设置@babel/preset-env的corejs选项为3.
安装core-js@3:
`cnpm i --save core-js@3`
添加corejs选项:
```js
const presets = [
[
  "@babel/env",
      {
        targets: {
        edge: "17",
        chrome: "64",
        firefox: "67",
        safari: '11.1'
      },
      useBuiltIns: "usage",
+     corejs: 3
    }
  ]
]
module.exports = { presets }
```