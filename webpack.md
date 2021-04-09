# webpack是什么
webpack 是一个现代 JavaScript 应用程序的静态模块打包器，当 webpack 处理应用程序时，会递归构建一个依赖关系图，其中包含应用程序需要的每个模块，然后将这些模块打包成一个或多个 bundle。
核心概念：entry、output、loader、plugins
- entry: 入口
- output: 输出
- loader: 模块转换器，用于把模块原内容按照需求转换成新内容
- 插件(plugins): 扩展插件，在webpack构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要做的事情
babel-loader用于对源代码进行转换
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
use 字段可以是一个数组，例如处理CSS文件是，`use: ['style-loader', 'css-loader']`
use 数组的每一项既可以是字符串也可以是一个对象，当我们需要在webpack 的配置文件中对 loader 进行配置，就需要将其编写为一个对象，并且在此对象的 options 字段中进行配置，如上

### 浏览器中查看页面
查看页面，难免就需要 html 文件，有小伙伴可能知道，有时我们会指定打包文件中带有 hash，那么每次生成的 js 文件名会有所不同，总不能让我们每次都人工去修改 html，这样不是显得我们很蠢嘛~
我们可以使用 html-webpack-plugin 插件来帮助我们完成这些事情。
```js
//首先引入插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    //...
    plugins: [
        //数组 放着所有的webpack插件
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html', //打包后的文件名
            minify: {
                removeAttributeQuotes: false, //是否删除属性的双引号
                collapseWhitespace: false, //是否折叠空白
            },
            // hash: true //是否加上hash，默认是 false
        })
    ]
}
```

### devtool
devtool 中的一些设置，可以帮助我们将编译后的代码映射回原始源代码。不同的值会明显影响到构建和重新构建的速度。
对我而言，能够定位到源码的行即可，因此，综合构建速度，在开发模式下，我设置的 devtool 的值是 `cheap-module-eval-source-map`

生产环境可以使用 none 或者是 `source-map`，使用 `source-map` 最终会单独打包出一个 .map 文件，我们可以根据报错信息和此 map 文件，进行错误解析，定位到源代码。
`source-map` 和 `hidden-source-map` 都会打包生成单独的 .map 文件，区别在于，`source-map` 会在打包出的js文件中增加一个引用注释，以便开发工具知道在哪里可以找到它。`hidden-source-map` 则不会在打包的js中增加引用注释。
但是我们一般不会直接将 .map 文件部署到CDN，因为会直接映射到源码，更希望将.map 文件传到错误解析系统，然后根据上报的错误信息，直接解析到出错的源码位置。

### 处理样式文件
webpack 不能直接处理 css，需要借助 loader。如果是 .css，我们需要的 loader 通常有： `style-loader`、`css-loader`，考虑到兼容性问题，还需要 `postcss-loader`，而如果是 less 或者是 sass 的话，还需要 `less-loader` 和 `sass-loader`，这里配置一下 less 和 css 文件(sass 的话，使用 sass-loader即可):
```js
//webpack.config.js
module.exports = {
    //...
    module: {
        rules: [
            {
                test: /\.(le|c)ss$/,
                use: ['style-loader', 'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        plugins: function () {
                            return [
                                require('autoprefixer')({
                                    "overrideBrowserslist": [
                                        ">0.25%",
                                        "not dead"
                                    ]
                                })
                            ]
                        }
                    }
                }, 'less-loader'],
                exclude: /node_modules/
            }
        ]
    }
}

```
**style-loader 动态创建 style 标签，将 css 插入到 head 中.**
**css-loader 负责处理 @import 等语句。**
**postcss-loader 和 autoprefixer，自动生成浏览器兼容性前缀(-webkit-)** —— 2020了，应该没人去自己徒手去写浏览器前缀了吧
less-loader 负责处理编译 .less 文件,将其转为 css

这里，我们之间在 webpack.config.js 写了 autoprefixer 需要兼容的浏览器，仅是为了方便展示。推荐大家在根目录下创建 .browserslistrc，将对应的规则写在此文件中，除了 autoprefixer 使用外，@babel/preset-env、stylelint、eslint-plugin-conmpat 等都可以共用。
那么我们要怎么处理图片或是本地的一些其它资源文件呢。不用想，肯定又需要 loader 出马了。
- 图片/字体文件处理
我们可以使用` url-loader `或者 `file-loader` 来处理本地的资源文件。url-loader 和 file-loader 的功能类似，但是 `url-loader` 可以指定在文件大小小于指定的限制时，返回 `DataURL`，因此，个人会优先选择使用 `url-loader`。
用`less-loader`或`sass-loader`的话，还要配一个`url-resolve-loader`，不然如果在less或sass文件中@import另一个less或sass的文件中有使用相对路径时，会出现最终打包出的资源路径出错的情况，这是因为打包过程中都是以入口文件确定资源路径的，用`url-resolve-loader`可以解决这个问题
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
                        loader: 'url-loader',
                        options: {
                            limit: 10240, //10K
                            esModule: false 
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    }
}
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
        loader: 'url-loader',
        options: {
            limit: 10240, //10K
            esModule: false,
            name: '[name]_[hash:6].[ext]'
        }
    }
]
```
重新编译，在浏览器中审查元素，可以看到图片名变成了: thor_a5f7c0.jpeg。
当本地资源较多时，我们有时会希望它们能打包在一个文件夹下，这也很简单，我们只需要在 `url-loader` 的 `options` 中指定 outpath，如: `outputPath: 'assets'`，构建出的目录如下:
<img src = 'https://user-gold-cdn.xitu.io/2020/3/2/17098ee50d59a0cf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'></img>
如果你在 public/index.html 文件中，使用本地的图片,构建之后，通过相对路径压根找不着这张图片

####  处理 html 中的本地图片
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
    entry: './src/index.js' //webpack的默认配置
}

```
entry 的值可以是一个字符串，一个数组或是一个对象。

字符串的情况无需多说，就是以对应的文件为入口。

为数组时，表示有“多个主入口”，想要多个依赖文件一起注入时，会这样配置。例如:
```js
entry: [
    './src/polyfills.js',
    './src/index.js'
]
```
polyfills.js 文件中可能只是简单的引入了一些 polyfill，例如 babel-polyfill，whatwg-fetch 等，需要在最前面被引入（我在 webpack2 时这样配置过）。
## 出口配置
配置 output 选项可以控制 webpack 如何输出编译文件。
```js
const path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'), //必须是绝对路径
        filename: 'bundle.js',
        publicPath: '/' //通常是CDN地址
    }
}
```
### 每次打包前清空dist目录
我们需要插件: `clean-webpack-plugin`
以前，clean-webpack-plugin 是默认导出的，现在不是，所以引用的时候，需要注意一下。另外，现在构造函数接受的参数是一个对象，可缺省。
```js
//webpack.config.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    //...
    plugins: [
        //不需要传参数喔，它可以找到 outputPath
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns:['**/*', '!dll', '!dll/**'] //不删除dll目录下的文件
        }) 
    ]
}
```
(clean-webpack-plugin 在webpack5中被移除。设置官方新提供的在"output"中的"clean"属性的值，保留文件夹。 )

### 按需加载
很多时候我们不需要一次性加载所有的JS文件，而应该在不同阶段去加载所需要的代码。webpack内置了强大的分割代码的功能可以实现按需加载。

比如，我们在点击了某个按钮之后，才需要使用使用对应的JS文件中的代码，需要使用 import() 语法：
```js
document.getElementById('btn').onclick = function() {
    import('./handle').then(fn => fn.default());
}
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
const webpack = require('webpack');
module.exports = {
    //....
    devServer: {
        hot: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin() //热更新插件
    ]
}
```
我们配置了 HotModuleReplacementPlugin 之后，会发现，此时我们修改代码，仍然是整个页面都会刷新。不希望整个页面都刷新，还需要修改入口文件：
在入口文件中新增:
```js
if(module && module.hot) {
    module.hot.accept()
}
```

### 多页应用打包
有时，我们的应用不一定是一个单页应用，而是一个多页应用，那么如何使用 webpack 进行打包呢。为了生成目录看起来清晰，不生成单独的 map 文件。
```js
//webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: {
        index: './src/index.js',
        login: './src/login.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash:6].js'
    },
    //...
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html' //打包后的文件名
        }),
        new HtmlWebpackPlugin({
            template: './public/login.html',
            filename: 'login.html' //打包后的文件名
        }),
    ]
}
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
看起来，似乎是OK了，不过呢，查看 index.html 和 login.html 会发现，都同时引入了 index.f7d21a.js 和 login.f7d21a.js，通常这不是我们想要的，我们希望，index.html 中只引入 index.f7d21a.js，login.html 只引入 login.f7d21a.js。

HtmlWebpackPlugin 提供了一个 chunks 的参数，可以接受一个数组，配置此参数仅会将数组中指定的js引入到html文件中，此外，如果你需要引入多个JS文件，仅有少数不想引入，还可以指定 excludeChunks 参数，它接受一个数组。
```js
//webpack.config.js
module.exports = {
    //...
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html', //打包后的文件名
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: './public/login.html',
            filename: 'login.html', //打包后的文件名
            chunks: ['login']
        }),
    ]
}
```
执行 npm run build，可以看到 index.html 中仅引入了 index 的 JS 文件，而 login.html 中也仅引入了 login 的 JS 文件，符合我们的预期。
### resolve配置
resolve 配置 webpack 如何寻找模块所对应的文件。webpack 内置 JavaScript 模块化语法解析功能，默认会采用模块化标准里约定好的规则去寻找，但你可以根据自己的需要修改默认的规则。
- resolve.modules 配置 webpack 去哪些目录下寻找第三方模块，默认情况下，只会去 node_modules 下寻找，如果你我们项目中某个文件夹下的模块经常被导入，不希望写很长的路径，那么就可以通过配置 resolve.modules 来简化。
```js
//webpack.config.js
module.exports = {
    //....
    resolve: {
        modules: ['./src/components', 'node_modules'] //从左到右依次查找
    }
}
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
            'react-native': '@my/react-native-web' //这个包名是我随便写的哈
        }
    }
}
```
例如，我们有一个依赖` @my/react-native-web` 可以实现 react-native 转 web。我们代码一般下面这样:
```js
import { View, ListView, StyleSheet, Animated } from 'react-native';
```
配置了别名之后，在转 web 时，会从` @my/react-native-web` 寻找对应的依赖。

### 区分不同环境
目前为止我们 webpack 的配置，都定义在了 webpack.config.js 中，对于需要区分是开发环境还是生产环境的情况，我们根据 process.env.NODE_ENV 去进行了区分配置，但是配置文件中如果有多处需要区分环境的配置，这种显然不是一个好办法。
更好的做法是创建多个配置文件，如: webpack.base.js、webpack.dev.js、webpack.prod.js。

webpack.base.js 定义公共的配置
webpack.dev.js：定义开发环境的配置
webpack.prod.js：定义生产环境的配置

webpack-merge 专为 webpack 设计，提供了一个 merge 函数，用于连接数组，合并对象。
```js
const merge = require('webpack-merge');
merge({
    devtool: 'cheap-module-eval-source-map',
    module: {
        rules: [
            {a: 1}
        ]
    },
    plugins: [1,2,3]
}, {
    devtool: 'none',
    mode: "production",
    module: {
        rules: [
            {a: 2},
            {b: 1}
        ]
    },
    plugins: [4,5,6],
});
//合并后的结果为
{
    devtool: 'none',
    mode: "production",
    module: {
        rules: [
            {a: 1},
            {a: 2},
            {b: 1}
        ]
    },
    plugins: [1,2,3,4,5,6]
}
```
webpack.config.base.js 中是通用的 webpack 配置，以 webpack.config.dev.js 为例，如下：
```js
//webpack.config.dev.js
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config.base');

module.exports = merge(baseWebpackConfig, {
    mode: 'development'
    //...其它的一些配置
});
```

然后修改我们的 package.json，指定对应的 config 文件：
```js
//package.json
{
    "scripts": {
        "dev": "cross-env NODE_ENV=development webpack-dev-server --config=webpack.config.dev.js",
        "build": "cross-env NODE_ENV=production webpack --config=webpack.config.prod.js"
    },
}

```
你可以使用 merge 合并，也可以使用 merge.smart 合并，merge.smart 在合并loader时，会将同一匹配规则的进行合并，webpack-merge 的说明文档中给出了详细的示例。
### webpack 跨域
假设前端在3000端口，服务端在4000端口，我们通过 webpack 配置的方式去实现跨域。
首先，我们在本地创建一个 server.js：
```js
let express = require('express');

let app = express();

app.get('/api/user', (req, res) => {
    res.json({name: '刘小夕'});
});

app.listen(4000);
```
执行代码(run code)，现在我们可以在浏览器中访问到此接口: `http://localhost:4000/api/user`。
在 index.js 中请求 /api/user，修改 index.js 如下:
```js
//需要将 localhost:3000 转发到 localhost:4000（服务端） 端口
fetch("/api/user")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
```
我们希望通过配置代理的方式，去访问 4000 的接口。
```js
//webpack.config.js
module.exports = {
    //...
    devServer: {
        proxy: {
            "/api": "http://localhost:4000"
        }
    }
}
```
重新执行 npm run dev，可以看到控制台打印出来了 {name: "刘小夕"}，实现了跨域。
大多情况，后端提供的接口并不包含  /api，即：/user，/info、/list 等，配置代理时，我们不可能罗列出每一个api。
修改我们的服务端代码，并重新执行。
```js
//server.js
let express = require('express');

let app = express();

app.get('/user', (req, res) => {
    res.json({name: '刘小夕'});
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
            '/api': {
                target: 'http://localhost:4000',
                //重写
                pathRewrite: {
                    '/api': ''
                }
            }
        }
    }
}
```
重新执行 npm run dev，在浏览器中访问： `http://localhost:3000/`，控制台中也打印出了{name: "刘小夕"}，跨域成功.

### 量化优化
`speed-measure-webpack-plugin` 插件可以测量各个插件和loader所花费的时间，使用之后，构建时，会得到类似下面这样的信息：
<img src = 'https://user-gold-cdn.xitu.io/2020/3/14/170d9bf274c164c1?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

speed-measure-webpack-plugin 的使用很简单，可以直接用其来包裹 Webpack 的配置:
```js
//webpack.config.js
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const config = {
    //...webpack配置
}

module.exports = smp.wrap(config);
```
- exclude/include
我们可以通过 exclude、include 配置来确保转译尽可能少的文件。顾名思义，exclude 指定要排除的文件，include 指定要包含的文件。
exclude 的优先级高于 include，在 include 和 exclude 中使用绝对路径数组，尽量避免 exclude，更倾向于使用 include。
```js
//webpack.config.js
const path = require('path');
module.exports = {
    //...
    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                use: ['babel-loader'],
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    },
}
```
<img src = 'https://user-gold-cdn.xitu.io/2020/3/14/170d9bf279131194?imageView2/0/w/1280/h/960/format/webp/ignore-error/1'>

- cache-loader
在一些性能开销较大的 loader 之前添加 cache-loader，将结果缓存中磁盘中。默认保存在 node_modueles/.cache/cache-loader 目录下。
cache-loader 的配置很简单，放在其他 loader 之前即可。修改Webpack 的配置如下:
```js
module.exports = {
    //...
    
    module: {
        //我的项目中,babel-loader耗时比较长，所以我给它配置了`cache-loader`
        rules: [
            {
                test: /\.jsx?$/,
                use: ['cache-loader','babel-loader']
            }
        ]
    }
}
```

- happypack
由于有大量文件需要解析和处理，构建是文件读写和计算密集型的操作，特别是当文件数量变多后，Webpack 构建慢的问题会显得严重。文件读写和计算操作是无法避免的，那能不能让 Webpack 同一时刻处理多个任务，发挥多核 CPU 电脑的威力，以提升构建速度呢？
HappyPack 就能让 Webpack 做到这点，它把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程。
```js
const Happypack = require('happypack');
module.exports = {
    //...
    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                use: 'Happypack/loader?id=js',
                include: [path.resolve(__dirname, 'src')]
            },
            {
                test: /\.css$/,
                use: 'Happypack/loader?id=css',
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules', 'bootstrap', 'dist')
                ]
            }
        ]
    },
    plugins: [
        new Happypack({
            id: 'js', //和rule中的id=js对应
            //将之前 rule 中的 loader 在此配置
            use: ['babel-loader'] //必须是数组
        }),
        new Happypack({
            id: 'css',//和rule中的id=css对应
            use: ['style-loader', 'css-loader','postcss-loader'],
        })
    ]
}
```
happypack 默认开启 CPU核数 - 1 个进程，当然，我们也可以传递 threads 给 Happypack。

- DllPlugin
有些时候，如果所有的JS文件都打成一个JS文件，会导致最终生成的JS文件很大，这个时候，我们就要考虑拆分 bundles。
DllPlugin 和 DLLReferencePlugin 可以实现拆分 bundles，并且可以大大提升构建速度，DllPlugin 和 DLLReferencePlugin 都是 webpack 的内置模块。
我们使用 DllPlugin 将不会频繁更新的库进行编译，当这些依赖的版本没有变化时，就不需要重新编译。我们新建一个 webpack 的配置文件，来专门用于编译动态链接库，例如名为: webpack.config.dll.js，这里我们将 react 和 react-dom 单独打包成一个动态链接库。

```js
//webpack.config.dll.js
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        react: ['react', 'react-dom']
    },
    mode: 'production',
    output: {
        filename: '[name].dll.[hash:6].js',
        path: path.resolve(__dirname, 'dist', 'dll'),
        library: '[name]_dll' //暴露给外部使用
        //libraryTarget 指定如何暴露内容，缺省时就是 var
    },
    plugins: [
        new webpack.DllPlugin({
            //name和library一致
            name: '[name]_dll', 
            path: path.resolve(__dirname, 'dist', 'dll', 'manifest.json') //manifest.json的生成路径
        })
    ]
}
```
## tree-shaking
如果使用ES6的import 语法，那么在生产环境下，会自动移除没有使用到的代码。
scope hosting 作用域提升
变量提升，可以减少一些变量声明。在生产环境下，默认开启。
使用 Webpack 进行 tree-shaking 的第一步是编写 Webpack 配置文件。你可以对你的 webpack 做很多自定义配置，但是如果你想要对代码进行 tree-shaking，就需要以下几项。

首先，你必须处于生产模式。Webpack 只有在压缩代码的时候会 tree-shaking，而这只会发生在生产模式中。

其次，必须将优化选项 “usedExports” 设置为true。这意味着 Webpack 将识别出它认为没有被使用的代码，并在最初的打包步骤中给它做标记。

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
仅仅因为 Webpack 看不到一段正在使用的代码，并不意味着它可以安全地进行 tree-shaking。有些模块导入，只要被引入，就会对应用程序产生重要的影响。一个很好的例子就是全局样式表，或者设置全局配置的JavaScript 文件。

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
首先，让我们在这个上下文中定义全局 CSS。全局 CSS 是直接导入到 JavaScript 文件中的样式表(可以是CSS、SCSS等)。它没有被转换成 CSS 模块或任何类似的东西。基本上，import 语句是这样的：
```js
// 导入全局 CSS
import './MyStylesheet.css';
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
    sideEffects: true
   }
  ]
 } 
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
   '[@babel/preset-env](http://twitter.com/babel/preset-env)',
   {
    modules: false
   }
  ]
 ]
};
```

把 modules 设置为 false，就是告诉 babel 不要编译模块代码。这会让 Babel 保留我们现有的 es2015 import/export 语句。

划重点：所有可需要 tree-shaking 的代码必须以这种方式编译。因此，如果你有要导入的库，则必须将这些库编译为 es2015 模块以便进行 tree-shaking 。如果它们被编译为 commonjs，那么它们就不能做 tree-shaking ，并且将会被打包进你的应用程序中。许多库支持部分导入，lodash 就是一个很好的例子，它本身是 commonjs 模块，但是它有一个 lodash-es 版本，用的是 es2015模块。

此外，如果你在应用程序中使用内部库，也必须使用 es2015 模块编译。为了减少应用程序包的大小，必须将所有这些内部库修改为以这种方式编译。
