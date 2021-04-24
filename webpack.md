# webpack 是什么

webpack 是一个现代 JavaScript 应用程序的静态模块打包器，当 webpack 处理应用程序时，会递归构建一个依赖关系图，其中包含应用程序需要的每个模块，然后将这些模块打包成一个或多个 bundle。
核心概念：entry、output、loader、plugins

- entry: 入口
- output: 输出，设置 publicPath 用于传 cdn 的前缀`http://cdn.xxx.com`
- loader: 模块转换器，用于把模块原内容按照需求转换成新内容
- 插件(plugins): 扩展插件，在 webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要做的事情
  babel-loader 用于对源代码进行转换

```js
//webpack.config.js
module.exports = {
    // mode: 'development',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: [
                            [
                                "@babel/plugin-transform-runtime",
                                {
                                    "corejs": 3
                                }
                            ]
                        ]
                    }
                },
                exclude: /node_modules/
            }
        ]
    }
    devServer: {
        port: '3000', //默认是8080
        quiet: false, //默认不启用
        inline: true, //默认开启 inline 模式，如果设置为false,开启 iframe 模式
        stats: "errors-only", //终端仅打印 error
        overlay: false, //默认不启用
        clientLogLevel: "silent", //日志等级
        compress: true //是否启用 gzip 压缩
    }
    devtool: 'cheap-module-eval-source-map' //开发环境下使用
}

```

loader 需要配置在 module.rules 中，rules 是一个数组。
loader 的格式为:

```js
{
    test: /\.jsx?$/,//匹配规则
    use: 'babel-loader'
}
```

test 字段是匹配规则，针对符合规则的文件进行处理。
use 字段有几种写法
可以是一个字符串，例如上面的` use: 'babel-loader'`
use 字段可以是一个数组，例如处理 CSS 文件是，`use: ['style-loader', 'css-loader']`
use 数组的每一项既可以是字符串也可以是一个对象，当我们需要在 webpack 的配置文件中对 loader 进行配置，就需要将其编写为一个对象，并且在此对象的 options 字段中进行配置，如上

babel-loader 只会将 ES6/7/8 语法转换为 ES5 语法，但是对新 api 并不会转换 例如(promise、Generator、Set、Maps、Proxy 等)
此时我们需要借助 babel-polyfill 来帮助我们转换

```js
// webpack.config.js
const path = require("path");
module.exports = {
  entry: ["@babel/polyfill", path.resolve(__dirname, "../src/index.js")], // 入口文件
};
```

### 浏览器中查看页面

会指定打包文件中带有 hash，那么每次生成的 js 文件名会有所不同，不能每次都人工去修改 html
我们可以使用 html-webpack-plugin 插件来帮助我们完成这些事情。

```js
//首先引入插件
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  //...
  plugins: [
    //数组 放着所有的webpack插件
    new HtmlWebpackPlugin({
      template: "./public/index.html", //以某个html为模板（里面有#app的那种）
      filename: "index.html", //打包后的文件名
      minify: {
        removeAttributeQuotes: false, //是否删除属性的双引号
        collapseWhitespace: false, //是否折叠空白
      },
      // hash: true //是否加上hash，默认是 false
    }),
  ],
};
```

### devtool

devtool 中的一些设置，可以帮助我们将编译后的代码映射回原始源代码。不同的值会明显影响到构建和重新构建的速度。
对我而言，能够定位到源码的行即可，因此，综合构建速度，在开发模式下，我设置的 devtool 的值是 `cheap-module-eval-source-map`

生产环境可以使用 none 或者是 `source-map`，使用 `source-map` 最终会单独打包出一个 .map 文件，我们可以根据报错信息和此 map 文件，进行错误解析，定位到源代码。
`source-map` 和 `hidden-source-map` 都会打包生成单独的 .map 文件，区别在于，`source-map` 会在打包出的 js 文件中增加一个引用注释，以便开发工具知道在哪里可以找到它。`hidden-source-map` 则不会在打包的 js 中增加引用注释。
但是我们一般不会直接将 .map 文件部署到 CDN，因为会直接映射到源码，更希望将.map 文件传到错误解析系统，然后根据上报的错误信息，直接解析到出错的源码位置。

### 处理样式文件

webpack 不能直接处理 css，需要借助 loader。如果是 .css，我们需要的 loader 通常有： `style-loader`、`css-loader`，考虑到兼容性问题，还需要 `postcss-loader`，而如果是 less 或者是 sass 的话，还需要 `less-loader` 和 `sass-loader`，这里配置一下 less 和 css 文件(sass 的话，使用 sass-loader 即可):
`css-loader`作用是分析项目中 css 之间引入关系最终生成一段 `css` 代码，`style-loader`将这个代码插入 `html` 头标签的 `style` 标签里

```js
//webpack.config.js
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: function () {
                return [
                  require("autoprefixer")({
                    overrideBrowserslist: [">0.25%", "not dead"],
                  }),
                ];
              },
            },
          },
          "less-loader",
        ],
        exclude: /node_modules/,
      },
    ],
  },
};
```

**style-loader 动态创建 style 标签，将 css 插入到 head 中.**
**css-loader 负责处理 @import 等语句。**
**postcss-loader 和 autoprefixer，自动生成浏览器兼容性前缀(-webkit-)** —— 2020 了，应该没人去自己徒手去写浏览器前缀了吧
less-loader 负责处理编译 .less 文件,将其转为 css

这里，我们之间在 webpack.config.js 写了 autoprefixer 需要兼容的浏览器，仅是为了方便展示。推荐大家在根目录下创建 .browserslistrc，将对应的规则写在此文件中，除了 autoprefixer 使用外，@babel/preset-env、stylelint、eslint-plugin-conmpat 等都可以共用。
那么我们要怎么处理图片或是本地的一些其它资源文件呢。不用想，肯定又需要 loader 出马了。

- 图片/字体文件处理
  我们可以使用`url-loader`或者 `file-loader` 来处理本地的资源文件。url-loader 和 file-loader 的功能类似，但是 `url-loader` 可以指定在文件大小小于指定的限制时，返回 `DataURL`(base64)，因此，个人会优先选择使用 `url-loader`。
  用`less-loader`或`sass-loader`的话，还要配一个`url-resolve-loader`，不然如果在 less 或 sass 文件中@import 另一个 less 或 sass 的文件中有使用相对路径时，会出现最终打包出的资源路径出错的情况，这是因为打包过程中都是以入口文件确定资源路径的，用`url-resolve-loader`可以解决这个问题,css 模块化：css-loader 的 options 属性的 modules 设为 true,然后用对象属性调用来具体使用，不会污染全局

```js
//webpack.config.js
module.exports = {
  //...
  modules: {
    rules: [
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10240, //10K
              esModule: false,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
};
```

此处设置 limit 的值大小为 10240，即资源大小小于 10K 时，将资源转换为 base64，超过 10K，将图片拷贝到 dist 目录。esModule 设置为 false，否则，<img src={require('XXX.jpg')} /> 会出现 <img src=[Module Object] />
将资源转换为 base64 可以减少网络请求次数，但是 base64 数据较大，如果太多的资源是 base64，会导致加载变慢，因此设置 limit 值时，需要二者兼顾。
默认情况下，生成的文件的文件名就是文件内容的 MD5 哈希值并会保留所引用资源的原始扩展名，例如我上面的图片(thor.jpeg)对应的文件名如下：
<img src='https://user-gold-cdn.xitu.io/2020/3/2/17098ee50ad69750?imageslim'></img>
当然，你也可以通过 options 参数进行修改。

```js
//....
use: [
  {
    loader: "url-loader",
    options: {
      limit: 10240, //10K
      esModule: false,
      name: "[name]_[hash:6].[ext]",
    },
  },
];
```

重新编译，在浏览器中审查元素，可以看到图片名变成了: thor_a5f7c0.jpeg。
当本地资源较多时，我们有时会希望它们能打包在一个文件夹下，这也很简单，我们只需要在 `url-loader` 的 `options` 中指定 outpath，如: `outputPath: 'assets'`，构建出的目录如下:
<img src = 'https://user-gold-cdn.xitu.io/2020/3/2/17098ee50d59a0cf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'></img>
如果你在 public/index.html 文件中，使用本地的图片,构建之后，通过相对路径压根找不着这张图片

#### 拆分 css

webpack 4.0 以前，我们通过 extract-text-webpack-plugin 插件，把 css 样式从 js 文件中提取到单独的 css 文件中。webpack4.0 以后，官方推荐使用 mini-css-extract-plugin 插件来打包 css 文件
如果样式文件很多，全部添加到 html 中，难免显得混乱。这时候我们想用把 css 拆分出来用外链的形式引入 css 文件怎么做呢？这时候我们就需要借助插件来帮助我们
mini-css-extract-plugin 会将所有的 css 样式合并为一个 css 文件。

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
  //...省略其他配置
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[hash].css",
      chunkFilename: "[id].css",
    }),
  ],
};
```

file-loader 就是将文件在进行一些处理后（主要是处理文件名和路径、解析文件 url），并将文件移动到输出的目录中
url-loader 一般与 file-loader 搭配使用，功能与 file-loader 类似，如果文件小于限制的大小。则会返回 base64 编码，否则使用 file-loader 将文件移动到输出的目录中

#### 处理 html 中的本地图片

html-withimg-loader

```js
test: /.html$/,
use: 'html-withimg-loader'
```

## 入口配置

入口的字段为: entry

```js
//webpack.config.js
module.exports = {
  entry: "./src/index.js", //webpack的默认配置
};
```

entry 的值可以是一个字符串，一个数组或是一个对象。

字符串的情况无需多说，就是以对应的文件为入口。

为数组时，表示有“多个主入口”，想要多个依赖文件一起注入时，会这样配置。例如:

```js
entry: ["./src/polyfills.js", "./src/index.js"];
```

polyfills.js 文件中可能只是简单的引入了一些 polyfill，例如 babel-polyfill，whatwg-fetch 等，需要在最前面被引入（我在 webpack2 时这样配置过）。

## 出口配置

配置 output 选项可以控制 webpack 如何输出编译文件。

```js
const path = require("path");
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"), //必须是绝对路径
    filename: "bundle.js",
    publicPath: "/", //通常是CDN地址
  },
};
```

### 每次打包前清空 dist 目录

我们需要插件: `clean-webpack-plugin`
以前，clean-webpack-plugin 是默认导出的，现在不是，所以引用的时候，需要注意一下。另外，现在构造函数接受的参数是一个对象，可缺省。

```js
//webpack.config.js
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
  //...
  plugins: [
    //不需要传参数喔，它可以找到 outputPath
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!dll", "!dll/**"], //不删除dll目录下的文件
    }),
  ],
};
```

(clean-webpack-plugin 在 webpack5 中被移除。设置官方新提供的在"output"中的"clean"属性的值，保留文件夹。 )

### 按需加载

很多时候我们不需要一次性加载所有的 JS 文件，而应该在不同阶段去加载所需要的代码。webpack 内置了强大的分割代码的功能可以实现按需加载。

比如，我们在点击了某个按钮之后，才需要使用使用对应的 JS 文件中的代码，需要使用 import() 语法：

```js
document.getElementById("btn").onclick = function () {
  import("./handle").then((fn) => fn.default());
};
```

import() 语法，需要 `@babel/plugin-syntax-dynamic-import` 的插件支持，但是因为当前 @babel/preset-env 预设中已经包含了` @babel/plugin-syntax-dynamic-import`，因此我们不需要再单独安装和配置。

<img src = 'https://user-gold-cdn.xitu.io/2020/3/9/170bae7ef6dc0875?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>
webpack 遇到 import(****) 这样的语法的时候，会这样处理：
以**** 为入口新生成一个 Chunk
当代码执行到 import 所在的语句时，才会加载该 Chunk 所对应的文件（如这里的1.bundle.8bf4dc.js）

### 热更新

首先配置 devServer 的 hot 为 true
并且在 plugins 中增加 new webpack.HotModuleReplacementPlugin()

```js
//webpack.config.js
const webpack = require("webpack");
module.exports = {
  //....
  devServer: {
    hot: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), //热更新插件
  ],
};
```

我们配置了 HotModuleReplacementPlugin 之后，会发现，此时我们修改代码，仍然是整个页面都会刷新。不希望整个页面都刷新，还需要修改入口文件：
在入口文件中新增:

```js
if (module && module.hot) {
  module.hot.accept();
}
```

### 多页应用打包

有时，我们的应用不一定是一个单页应用，而是一个多页应用，那么如何使用 webpack 进行打包呢。为了生成目录看起来清晰，不生成单独的 map 文件。

```js
//webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: {
    index: "./src/index.js",
    login: "./src/login.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[hash:6].js",
  },
  //...
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html", //打包后的文件名
    }),
    new HtmlWebpackPlugin({
      template: "./public/login.html",
      filename: "login.html", //打包后的文件名
    }),
  ],
};
```

如果需要配置多个` HtmlWebpackPlugin`，那么 filename 字段不可缺省，否则默认生成的都是 index.html，如果你希望 html 的文件名中也带有 hash，那么直接修改 fliename 字段即可，例如: filename: 'login.[hash:6].html'。

生成目录如下:

```js
.
├── dist
│   ├── 2.463ccf.js
│   ├── assets
│   │   └── thor_e09b5c.jpeg
│   ├── css
│   │   ├── index.css
│   │   └── login.css
│   ├── index.463ccf.js
│   ├── index.html
│   ├── js
│   │   └── base.js
│   ├── login.463ccf.js
│   └── login.html

```

看起来，似乎是 OK 了，不过呢，查看 index.html 和 login.html 会发现，都同时引入了 index.f7d21a.js 和 login.f7d21a.js，通常这不是我们想要的，我们希望，index.html 中只引入 index.f7d21a.js，login.html 只引入 login.f7d21a.js。

HtmlWebpackPlugin 提供了一个 chunks 的参数，可以接受一个数组，配置此参数仅会将数组中指定的 js 引入到 html 文件中，此外，如果你需要引入多个 JS 文件，仅有少数不想引入，还可以指定 excludeChunks 参数，它接受一个数组。

```js
//webpack.config.js
module.exports = {
  //...
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html", //打包后的文件名
      chunks: ["index"],
    }),
    new HtmlWebpackPlugin({
      template: "./public/login.html",
      filename: "login.html", //打包后的文件名
      chunks: ["login"],
    }),
  ],
};
```

执行 npm run build，可以看到 index.html 中仅引入了 index 的 JS 文件，而 login.html 中也仅引入了 login 的 JS 文件，符合我们的预期。

### resolve 配置

resolve 配置 webpack 如何寻找模块所对应的文件。webpack 内置 JavaScript 模块化语法解析功能，默认会采用模块化标准里约定好的规则去寻找，但你可以根据自己的需要修改默认的规则。

- resolve.modules 配置 webpack 去哪些目录下寻找第三方模块，默认情况下，只会去 node_modules 下寻找，如果你我们项目中某个文件夹下的模块经常被导入，不希望写很长的路径，那么就可以通过配置 resolve.modules 来简化。

```js
//webpack.config.js
module.exports = {
  //....
  resolve: {
    modules: ["./src/components", "node_modules"], //从左到右依次查找
  },
};
```

这样配置之后，我们 import Dialog from 'dialog'，会去寻找 ./src/components/dialog，不再需要使用相对路径导入。如果在 ./src/components 下找不到的话，就会到 node_modules 下寻找。

- alias
  resolve.alias 配置项通过别名把原导入路径映射成一个新的导入路径，例如：

```js
//webpack.config.js
module.exports = {
  //....
  resolve: {
    alias: {
      "react-native": "@my/react-native-web", //这个包名是我随便写的哈
    },
  },
};
```

例如，我们有一个依赖` @my/react-native-web` 可以实现 react-native 转 web。我们代码一般下面这样:

```js
import { View, ListView, StyleSheet, Animated } from "react-native";
```

配置了别名之后，在转 web 时，会从` @my/react-native-web` 寻找对应的依赖。

### 区分不同环境

目前为止我们 webpack 的配置，都定义在了 webpack.config.js 中，对于需要区分是开发环境还是生产环境的情况，我们根据 process.env.NODE_ENV 去进行了区分配置，但是配置文件中如果有多处需要区分环境的配置，这种显然不是一个好办法。
更好的做法是创建多个配置文件，如: webpack.base.js、webpack.dev.js、webpack.prod.js。

webpack.base.js 定义公共的配置
webpack.dev.js：定义开发环境的配置 开发环境主要实现的是热更新,不要压缩代码，完整的 sourceMap
webpack.prod.js：定义生产环境的配置 生产环境主要实现的是压缩代码、提取 css 文件、合理的 sourceMap、分割代码 安装 webpack-merge copy-webpack-plugin optimize-css-assets-webpack-plugin uglifyjs-webpack-plugin

webpack-merge 专为 webpack 设计，提供了一个 merge 函数，用于连接数组，合并对象。
copy-webpack-plugin 拷贝静态资源
optimize-css-assets-webpack-plugin 压缩 css
uglifyjs-webpack-plugin 压缩 js

webpack mode 设置 production 的时候会自动压缩 js 代码。原则上不需要引入 uglifyjs-webpack-plugin 进行重复工作。但是 optimize-css-assets-webpack-plugin 压缩 css 的同时会破坏原有的 js 压缩，所以这里我们引入 uglifyjs 进行压缩

## webpack.config.js

```js
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const vueLoaderPlugin = require("vue-loader/lib/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.argv.indexOf("--mode=production") === -1;
module.exports = {
  entry: {
    main: path.resolve(__dirname, "../src/main.js"),
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "js/[name].[hash:8].js",
    chunkFilename: "js/[name].[hash:8].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: "vue-loader",
            options: {
              compilerOptions: {
                preserveWhitespace: false,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: devMode ? "vue-style-loader" : MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../dist/css/",
              hmr: devMode,
            },
          },
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")],
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: devMode ? "vue-style-loader" : MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../dist/css/",
              hmr: devMode,
            },
          },
          "css-loader",
          "less-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")],
            },
          },
        ],
      },
      {
        test: /\.(jep?g|png|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10240,
            fallback: {
              loader: "file-loader",
              options: {
                name: "img/[name].[hash:8].[ext]",
              },
            },
          },
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10240,
            fallback: {
              loader: "file-loader",
              options: {
                name: "media/[name].[hash:8].[ext]",
              },
            },
          },
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: {
          loader: "url-loader",
          options: {
            limit: 10240,
            fallback: {
              loader: "file-loader",
              options: {
                name: "media/[name].[hash:8].[ext]",
              },
            },
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.runtime.esm.js",
      " @": path.resolve(__dirname, "../src"),
    },
    extensions: ["*", ".js", ".json", ".vue"],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    new vueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css",
    }),
  ],
};
```

### webpack.dev.js

```js
const Webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");
const WebpackMerge = require("webpack-merge");
module.exports = WebpackMerge(webpackConfig, {
  mode: "development",
  devtool: "cheap-module-eval-source-map",
  devServer: {
    port: 3000,
    hot: true,
    contentBase: "../dist",
  },
  plugins: [new Webpack.HotModuleReplacementPlugin()],
});
```

### webpack.prod.js

```js
const path = require("path");
const webpackConfig = require("./webpack.config.js");
const WebpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
module.exports = WebpackMerge(webpackConfig, {
  mode: "production",
  devtool: "cheap-module-source-map",
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "../public"),
        to: path.resolve(__dirname, "../dist"),
      },
    ]),
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        //压缩js
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCssAssetsPlugin({}),
    ],
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial", // 只打包初始时依赖的第三方
        },
      },
    },
  },
});
```

### 优化打包速度

构建速度指的是我们每次修改代码后热更新的速度以及发布前打包文件的速度。

##### 合理的配置 mode 参数与 devtool 参数

mode 可设置 development production 两个参数
如果没有设置，webpack4 会将 mode 的默认值设置为 production
production 模式下会进行 tree shaking(去除无用代码)和 uglifyjs(代码压缩混淆)

##### 缩小文件的搜索范围(配置 include exclude alias noParse extensions)

- alias: 当我们代码中出现 import 'vue'时， webpack 会采用向上递归搜索的方式去 node_modules 目录下找。为了减少搜索范围我们可以直接告诉 webpack 去哪个路径下查找。也就是别名(alias)的配置。
- include exclude 同样配置 include exclude 也可以减少 webpack loader 的搜索转换时间。
- noParse 当我们代码中使用到 import jq from 'jquery'时，webpack 会去解析 jq 这个库是否有依赖其他的包。但是我们对类似 jquery 这类依赖库，一般会认为不会引用其他的包(特殊除外,自行判断)。增加- noParse 属性,告诉 webpack 不必解析，以此增加打包速度。
- extensions webpack 会根据 extensions 定义的后缀查找文件(频率较高的文件类型优先写在前面)

##### 使用 HappyPack 开启多进程 Loader 转换

在 webpack 构建过程中，实际上耗费时间大多数用在 loader 解析转换以及代码的压缩中。日常开发中我们需要使用 Loader 对 js，css，图片，字体等文件做转换操作，并且转换的文件数据量也是非常大。由于 js 单线程的特性使得这些转换操作不能并发处理文件，而是需要一个个文件进行处理。HappyPack 的基本原理是将这部分任务分解到多个子进程中去并行处理，子进程处理完成后把结果发送到主进程中，从而减少总的构建时间

##### 使用 webpack-parallel-uglify-plugin 增强代码压缩

##### 抽离第三方模块

对于开发项目中不经常会变更的静态依赖文件。类似于我们的 elementUi、vue 全家桶等等。因为很少会变更，所以我们不希望这些依赖要被集成到每一次的构建逻辑中去。 这样做的好处是每次更改我本地代码的文件的时候，webpack 只需要打包我项目本身的文件代码，而不会再去编译第三方库。以后只要我们不升级第三方包的时候，那么 webpack 就不会对这些库去打包，这样可以快速的提高打包的速度。
这里我们使用 webpack 内置的 DllPlugin DllReferencePlugin 进行抽离
在与 webpack 配置文件同级目录下新建 webpack.dll.config.js 代码如下

```js
// webpack.dll.config.js
const path = require("path");
const webpack = require("webpack");
module.exports = {
  // 你想要打包的模块的数组
  entry: {
    vendor: ["vue", "element-ui"],
  },
  output: {
    path: path.resolve(__dirname, "static/js"), // 打包后文件输出的位置
    filename: "[name].dll.js",
    library: "[name]_library",
    // 这里需要和webpack.DllPlugin中的`name: '[name]_library',`保持一致。
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, "[name]-manifest.json"),
      name: "[name]_library",
      context: __dirname,
    }),
  ],
};
```

在 package.json 中配置如下命令
`"dll": "webpack --config build/webpack.dll.config.js"`
接下来在我们的 webpack.config.js 中增加以下代码

```js
module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require("./vendor-manifest.json"),
    }),
    new CopyWebpackPlugin([
      // 拷贝生成的文件到dist目录 这样每次不必手动去cv
      { from: "static", to: "static" },
    ]),
  ],
};
```

执行

```js
npm run dll
```

会发现生成了我们需要的集合第三地方 代码的 vendor.dll.js 我们需要在 html 文件中手动引入这个 js 文件

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>老yuan</title>
    <script src="static/js/vendor.dll.js"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

这样如果我们没有更新第三方依赖包，就不必 npm run dll。直接执行 npm run dev npm run build 的时候会发现我们的打包速度明显有所提升。因为我们已经通过 dllPlugin 将第三方依赖包抽离出来了。

##### 配置缓存

我们每次执行构建都会把所有的文件都重复编译一遍，这样的重复工作是否可以被缓存下来呢，答案是可以的，目前大部分 loader 都提供了 cache 配置项。比如在 babel-loader 中，可以通过设置 cacheDirectory 来开启缓存，babel-loader?cacheDirectory=true 就会将每次的编译结果写进硬盘文件（默认是在项目根目录下的 node_modules/.cache/babel-loader 目录内，当然你也可以自定义）

但如果 loader 不支持缓存呢？我们也有方法,我们可以通过 cache-loader ，它所做的事情很简单，就是 babel-loader 开启 cache 后做的事情，将 loader 的编译结果写入硬盘缓存。再次构建会先比较一下，如果文件较之前的没有发生变化则会直接使用缓存。使用方法如官方 demo 所示，在一些性能开销较大的 loader 之前添加此 loader 即可

### 优化打包文件体积

打包的速度我们是进行了优化，但是打包后的文件体积却是十分大，造成了页面加载缓慢，浪费流量等，接下来让我们从文件体积上继续优化

##### 引入 webpack-bundle-analyzer 分析打包后的文件

webpack-bundle-analyzer 将打包后的内容束展示为方便交互的直观树状图，让我们知道我们所构建包中真正引入的内容

接下来在 package.json 里配置启动命令
`"analyz": "NODE_ENV=production npm_config_report=true npm run build" `

windows 请安装 npm i -D cross-env
`"analyz": "cross-env NODE_ENV=production npm_config_report=true npm run build" `

接下来 npm run analyz 浏览器会自动打开文件依赖图的网页

##### externals

按照官方文档的解释，如果我们想引用一个库，但是又不想让 webpack 打包，并且又不影响我们在程序中以 CMD、AMD 或者 window/global 全局等方式进行使用，那就可以通过配置 Externals。这个功能主要是用在创建一个库的时候用的，但是也可以在我们项目开发中充分使用
Externals 的方式，我们将这些不需要打包的静态资源从构建逻辑中剔除出去，而使用 CDN
的方式，去引用它们。

有时我们希望我们通过 script 引入的库，如用 CDN 的方式引入的 jquery，我们在使用时，依旧用 require 的方式来使用，但是却不希望 webpack 将它又编译进文件中。这里官网案例已经足够清晰明了，大家有兴趣可以点击了解

```html
<script
  src="https://code.jquery.com/jquery-3.1.0.js"
  integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk="
  crossorigin="anonymous"
></script>
```

```js
module.exports = {
  //...
  externals: {
    jquery: "jQuery",
  },
};
```

```js
import $ from "jquery";
$(".my-element").animate(/* ... */);
```

### webpack 跨域

假设前端在 3000 端口，服务端在 4000 端口，我们通过 webpack 配置的方式去实现跨域。
首先，我们在本地创建一个 server.js：

```js
let express = require("express");

let app = express();

app.get("/api/user", (req, res) => {
  res.json({ name: "刘小夕" });
});

app.listen(4000);
```

执行代码(run code)，现在我们可以在浏览器中访问到此接口: `http://localhost:4000/api/user`。
在 index.js 中请求 /api/user，修改 index.js 如下:

```js
//需要将 localhost:3000 转发到 localhost:4000（服务端） 端口
fetch("/api/user")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));
```

我们希望通过配置代理的方式，去访问 4000 的接口。

```js
//webpack.config.js
module.exports = {
  //...
  devServer: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
};
```

重新执行 npm run dev，可以看到控制台打印出来了 {name: "刘小夕"}，实现了跨域。
大多情况，后端提供的接口并不包含 /api，即：/user，/info、/list 等，配置代理时，我们不可能罗列出每一个 api。
修改我们的服务端代码，并重新执行。

```js
//server.js
let express = require("express");

let app = express();

app.get("/user", (req, res) => {
  res.json({ name: "刘小夕" });
});

app.listen(4000);
```

尽管后端的接口并不包含 /api，我们在请求后端接口时，仍然以 /api 开头，在配置代理时，去掉 /api，修改配置:

```js
//webpack.config.js
module.exports = {
  //...
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        //重写
        pathRewrite: {
          "/api": "",
        },
      },
    },
  },
};
```

重新执行 npm run dev，在浏览器中访问： `http://localhost:3000/`，控制台中也打印出了{name: "刘小夕"}，跨域成功.

### 量化优化

`speed-measure-webpack-plugin` 插件可以测量各个插件和 loader 所花费的时间，使用之后，构建时，会得到类似下面这样的信息：
<img src = 'https://user-gold-cdn.xitu.io/2020/3/14/170d9bf274c164c1?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

speed-measure-webpack-plugin 的使用很简单，可以直接用其来包裹 Webpack 的配置:

```js
//webpack.config.js
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const config = {
  //...webpack配置
};

module.exports = smp.wrap(config);
```

- exclude/include
  我们可以通过 exclude、include 配置来确保转译尽可能少的文件。顾名思义，exclude 指定要排除的文件，include 指定要包含的文件。
  exclude 的优先级高于 include，在 include 和 exclude 中使用绝对路径数组，尽量避免 exclude，更倾向于使用 include。

```js
//webpack.config.js
const path = require("path");
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        use: ["babel-loader"],
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
};
```

<img src = 'https://user-gold-cdn.xitu.io/2020/3/14/170d9bf279131194?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

- cache-loader
  在一些性能开销较大的 loader 之前添加 cache-loader，将结果缓存中磁盘中。默认保存在 node_modueles/.cache/cache-loader 目录下。
  cache-loader 的配置很简单，放在其他 loader 之前即可。修改 Webpack 的配置如下:

```js
module.exports = {
  //...

  module: {
    //我的项目中,babel-loader耗时比较长，所以我给它配置了`cache-loader`
    rules: [
      {
        test: /\.jsx?$/,
        use: ["cache-loader", "babel-loader"],
      },
    ],
  },
};
```

- happypack
  由于有大量文件需要解析和处理，构建是文件读写和计算密集型的操作，特别是当文件数量变多后，Webpack 构建慢的问题会显得严重。文件读写和计算操作是无法避免的，那能不能让 Webpack 同一时刻处理多个任务，发挥多核 CPU 电脑的威力，以提升构建速度呢？
  HappyPack 就能让 Webpack 做到这点，它把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程。

```js
const Happypack = require("happypack");
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        use: "Happypack/loader?id=js",
        include: [path.resolve(__dirname, "src")],
      },
      {
        test: /\.css$/,
        use: "Happypack/loader?id=css",
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules", "bootstrap", "dist"),
        ],
      },
    ],
  },
  plugins: [
    new Happypack({
      id: "js", //和rule中的id=js对应
      //将之前 rule 中的 loader 在此配置
      use: ["babel-loader"], //必须是数组
    }),
    new Happypack({
      id: "css", //和rule中的id=css对应
      use: ["style-loader", "css-loader", "postcss-loader"],
    }),
  ],
};
```

happypack 默认开启 CPU 核数 - 1 个进程，当然，我们也可以传递 threads 给 Happypack。

- DllPlugin
  有些时候，如果所有的 JS 文件都打成一个 JS 文件，会导致最终生成的 JS 文件很大，这个时候，我们就要考虑拆分 bundles。
  DllPlugin 和 DLLReferencePlugin 可以实现拆分 bundles，并且可以大大提升构建速度，DllPlugin 和 DLLReferencePlugin 都是 webpack 的内置模块。
  我们使用 DllPlugin 将不会频繁更新的库进行编译，当这些依赖的版本没有变化时，就不需要重新编译。我们新建一个 webpack 的配置文件，来专门用于编译动态链接库，例如名为: webpack.config.dll.js，这里我们将 react 和 react-dom 单独打包成一个动态链接库。

```js
//webpack.config.dll.js
const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: {
    react: ["react", "react-dom"],
  },
  mode: "production",
  output: {
    filename: "[name].dll.[hash:6].js",
    path: path.resolve(__dirname, "dist", "dll"),
    library: "[name]_dll", //暴露给外部使用
    //libraryTarget 指定如何暴露内容，缺省时就是 var
  },
  plugins: [
    new webpack.DllPlugin({
      //name和library一致
      name: "[name]_dll",
      path: path.resolve(__dirname, "dist", "dll", "manifest.json"), //manifest.json的生成路径
    }),
  ],
};
```

### 解析 vue

vue-loader vue-template-compiler vue-style-loader
vue-loader 用于解析.vue 文件
vue-template-compiler 用于编译模板

```js
const vueLoaderPlugin = require("vue-loader/lib/plugin");
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ["vue-loader"],
      },
    ],
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.runtime.esm.js",
      " @": path.resolve(__dirname, "../src"),
    },
    extensions: ["*", ".js", ".json", ".vue"],
  },
  plugins: [new vueLoaderPlugin()],
};
```

# 常用的 plugin 和 loader

1. html-webpack-plugin 引入不同名的文件（js 文件每次名字都不一样，html 引入时自动修改 src）
2. clean-webpack-plugin 打包前清空文件夹

css 引用 use 遵循从右向左解析原则
`use:['style-loader','css-loader','less-loader']` 3. style-loader 动态创建 style 标签，将 css 插入到 head 中 4. css-loader 负责处理 @import 等语句 5. less-loader 6. postcss-loader autoprefixer 处理兼容性 自动添加浏览器前缀 （'style-loader','css-loader','postcss-loader','less-loader'）注意顺序 7. url-loader file-loader 就是将文件在进行一些处理后（主要是处理文件名和路径、解析文件 url），并将文件移动到输出的目录中 8. babel-loader 为了使我们的 js 代码兼容更多的环境 只会将 ES6/7/8 语法转换为 ES5 语法，但是对新 api 并不会转换 例如(promise、Generator、Set、Maps、Proxy 等)此时我们需要借助 babel-polyfill 来帮助我们转换 9. vue-loader 处理 vue 文件

## tree-shaking

这里单独提一下 tree-shaking,是因为这里有个坑。tree-shaking 的主要作用是用来清除代码中无用的部分。目前在 webpack4 我们设置 mode 为 production 的时候已经自动开启了 tree-shaking。但是要想使其生效，生成的代码必须是 ES6 模块。不能使用其它类型的模块如 CommonJS 之流。如果使用 Babel 的话，这里有一个小问题，因为 Babel 的预案（preset）默认会将任何模块类型都转译成 CommonJS 类型，这样会导致 tree-shaking 失效。修正这个问题也很简单，在.babelrc 文件或在 webpack.config.js 文件中设置 modules： false 就好了

```js
// .babelrc
{
  "presets": [
    ["@babel/preset-env",
      {
        "modules": false
      }
    ]
  ]
}
```

或者

```js
// webpack.config.js

module: {
    rules: [
        {
            test: /\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', { modules: false }]
                }
            }，
            exclude: /(node_modules)/
        }
    ]
}

```

如果使用 ES6 的 import 语法，那么在生产环境下，会自动移除没有使用到的代码。
scope hosting 作用域提升
变量提升，可以减少一些变量声明。在生产环境下，默认开启。
使用 Webpack 进行 tree-shaking 的第一步是编写 Webpack 配置文件。你可以对你的 webpack 做很多自定义配置，但是如果你想要对代码进行 tree-shaking，就需要以下几项。

首先，你必须处于生产模式。Webpack 只有在压缩代码的时候会 tree-shaking，而这只会发生在生产模式中。

其次，必须将优化选项 “usedExports” 设置为 true。这意味着 Webpack 将识别出它认为没有被使用的代码，并在最初的打包步骤中给它做标记。

最后，你需要使用一个支持删除死代码的压缩器。这种压缩器将识别出 Webpack 是如何标记它认为没有被使用的代码，并将其剥离。TerserPlugin 支持这个功能，推荐使用。

```js
// Base Webpack Config for Tree Shaking
const config = {
 mode: 'production',
 optimization: {
  usedExports: true,
  minimizer: [
   new TerserPlugin({...})
  ]
 }
};
```

有什么副作用
仅仅因为 Webpack 看不到一段正在使用的代码，并不意味着它可以安全地进行 tree-shaking。有些模块导入，只要被引入，就会对应用程序产生重要的影响。一个很好的例子就是全局样式表，或者设置全局配置的 JavaScript 文件。

Webpack 认为这样的文件有“副作用”。具有副作用的文件不应该做 tree-shaking，因为这将破坏整个应用程序。Webpack 的设计者清楚地认识到不知道哪些文件有副作用的情况下打包代码的风险，因此默认地将所有代码视为有副作用。这可以保护你免于删除必要的文件，但这意味着 Webpack 的默认行为实际上是不进行 tree-shaking。

幸运的是，我们可以配置我们的项目，告诉 Webpack 它是没有副作用的，可以进行 tree-shaking。

如何告诉 Webpack 你的代码无副作用
package.json 有一个特殊的属性 sideEffects，就是为此而存在的。它有三个可能的值：

true 是默认值，如果不指定其他值的话。这意味着所有的文件都有副作用，也就是没有一个文件可以 tree-shaking。

false 告诉 Webpack 没有文件有副作用，所有文件都可以 tree-shaking。

第三个值 […] 是文件路径数组。它告诉 webpack，除了数组中包含的文件外，你的任何文件都没有副作用。因此，除了指定的文件之外，其他文件都可以安全地进行 tree-shaking。

每个项目都必须将 sideEffects 属性设置为 false 或文件路径数组。在我公司的工作中，我们的基本应用程序和我提到的所有共享库都需要正确配置 sideEffects 标志。

```js
// 所有文件都有副作用，全都不可 tree-shaking
{
 "sideEffects": true
}
// 没有文件有副作用，全都可以 tree-shaking
{
 "sideEffects": false
}
// 只有这些文件有副作用，所有其他文件都可以 tree-shaking，但会保留这些文件
{
 "sideEffects": [
  "./src/file1.js",
  "./src/file2.js"
 ]
}
```

全局 CSS 与副作用
首先，让我们在这个上下文中定义全局 CSS。全局 CSS 是直接导入到 JavaScript 文件中的样式表(可以是 CSS、SCSS 等)。它没有被转换成 CSS 模块或任何类似的东西。基本上，import 语句是这样的：

```js
// 导入全局 CSS
import "./MyStylesheet.css";
```

因此，如果你做了上面提到的副作用更改，那么在运行 webpack 构建时，你将立即注意到一个棘手的问题。以上述方式导入的任何样式表现在都将从输出中删除。这是因为这样的导入被 webpack 视为死代码，并被删除。

幸运的是，有一个简单的解决方案可以解决这个问题。Webpack 使用它的模块规则系统来控制各种类型文件的加载。每种文件类型的每个规则都有自己的 sideEffects 标志。这会覆盖之前为匹配规则的文件设置的所有 sideEffects 标志。

所以，为了保留全局 CSS 文件，我们只需要设置这个特殊的 sideEffects 标志为 true，就像这样:

```js
// 全局 CSS 副作用规则相关的 Webpack 配置
const config = {
  module: {
    rules: [
      {
        test: /regex/,
        use: [loaders],
        sideEffects: true,
      },
    ],
  },
};
```

默认情况下，Babel 假定我们使用 es2015 模块编写代码，并转换 JavaScript 代码以使用 commonjs 模块。这样做是为了与服务器端 JavaScript 库的广泛兼容性，这些 JavaScript 库通常构建在 NodeJS 之上(NodeJS 只支持 commonjs 模块)。但是，Webpack 不支持使用 commonjs 模块来完成 tree-shaking。

现在，有一些插件(如 common-shake-plugin)声称可以让 Webpack 有能力对 commonjs 模块进行 tree-shaking，但根据我的经验，这些插件要么不起作用，要么在 es2015 模块上运行时，对 tree-shaking 的影响微乎其微。我不推荐这些插件。

因此，为了进行 tree-shaking，我们需要将代码编译到 es2015 模块。

es2015 模块 Babel 配置
据我所知，Babel 不支持将其他模块系统编译成 es2015 模块。但是，如果你是前端开发人员，那么你可能已经在使用 es2015 模块编写代码了，因为这是全面推荐的方法。

因此，为了让我们编译的代码使用 es2015 模块，我们需要做的就是告诉 babel 不要管它们。为了实现这一点，我们只需将以下内容添加到我们的 babel.config.js 中

```js
const config = {
  presets: [
    [
      "[@babel/preset-env](http://twitter.com/babel/preset-env)",
      {
        modules: false,
      },
    ],
  ],
};
```

把 modules 设置为 false，就是告诉 babel 不要编译模块代码。这会让 Babel 保留我们现有的 es2015 import/export 语句。

划重点：所有可需要 tree-shaking 的代码必须以这种方式编译。因此，如果你有要导入的库，则必须将这些库编译为 es2015 模块以便进行 tree-shaking 。如果它们被编译为 commonjs，那么它们就不能做 tree-shaking ，并且将会被打包进你的应用程序中。许多库支持部分导入，lodash 就是一个很好的例子，它本身是 commonjs 模块，但是它有一个 lodash-es 版本，用的是 es2015 模块。

此外，如果你在应用程序中使用内部库，也必须使用 es2015 模块编译。为了减少应用程序包的大小，必须将所有这些内部库修改为以这种方式编译。

# 手写 webpack

loader 从本质上来说其实就是一个 node 模块。相当于一台榨汁机(loader)将相关类型的文件代码(code)给它。根据我们设置的规则，经过它的一系列加工后还给我们加工好的果汁(code)。

loader 编写原则

- 单一原则: 每个 Loader 只做一件事；
- 链式调用: Webpack 会按顺序链式调用每个 Loader；
- 统一原则: 遵循 Webpack 制定的设计规则和结构，输入与输出均为字符串，各个 Loader 完全独立，即插即用；

在日常开发环境中，为了方便调试我们往往会加入许多 console 打印。但是我们不希望在生产环境中存在打印的值。那么这里我们自己实现一个 loader 去除代码中的 console

## sourceMap

eval 速度最快，把 js 转换成 eval 语法，错误定位不准确
inline 无 map 文件，base64 转入 main.js 里
cheap 记录行信息，不记录列信息，提高代码性能，只记录业务代码的映射关系，不记录 loader 或者三方模块的映射关系
module 会记录三方模块的映射关系
开发一般是 eval-cheap-module-source-map
生产环境 cheap-module-source-map
