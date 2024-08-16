const { resolve } = require('path');
const webpack = require('webpack');
const FileListPlugin = require('./src/plugins/file-list-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env) {
  console.log({ env, arguments });
  console.log(process.env.NODE_ENV);
  // 插件
  const plugins = [
    // 自定义插件
    new FileListPlugin('fileList.md'),
    // 根据模板生成页面
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    // 定义环境变量，会将所有代码中对应的指定变量替换为字符串的值
    new webpack.DefinePlugin({
      // 这里并不能真正的设置环境变量，只是打包的过程替换源码值而已
      // 而 package.json 中 scripts 定义的命令 webpack --mode=development 会覆盖配置文件中的 mode配置
      // 打包时，会将其他代码中的 process.env.NODE_ENV 替换为指定的值，但又会被这里定义的全局变量覆盖
      // 优先级：DefinePlutin内置插件 > scripts 命令指定的 --mode > 配置文件中配置的 mode
      'process.env.NODE_ENV': "'production'"
    })
  ];
  // 非开发环境
  if (!env.dev) {
    const { CleanWebpackPlugin } = require('clean-webpack-plugin');
    // 打包前清空目录
    plugins.unshift(new CleanWebpackPlugin());
  }
  return {
    // 入口路径
    entry: './main.js',
    // 出口路径及文件名称
    output: {
      publicPath: '/',
      path: resolve(__dirname, './dist/app'),
      filename: 'index-[hash:5].js'
    },
    // 源码地图
    devtool: 'source-map',
    // 模块规则
    module: {
      // loader 配置规则
      rules: [
        {
          // 模块匹配规则
          test: /index\.css$/,
          use: ['./src/loaders/style-loader.js']
        },
        {
          test: /(\.jpg|\.png\.gif)$/,
          use: {
            // 指定 loader
            loader: './src/loaders/img-loader.js',
            // 传递额外参数
            options: {
              // 超过多少KB使用图片，否者base64格式
              limit: 200
            }
          }
        },
        {
          test: /module\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  mode: 'local',
                  localIdentName: '[local]_[hash:base64:5]'
                }
              }
            }
          ]
        }
      ]
    },
    // 配置插件
    plugins,
    resolve: {
      // webpack@5 不再内置node模块，需要单独下载并引用对应模块的包
      fallback: {
        path: require.resolve('path-browserify')
      },
      // 导入模块路径指定可以省略的后缀名
      extensions: ['.js', '.css'],
      // 模块路径别名
      alias: {
        '@': resolve(__dirname, 'src'),
        '@css': resolve(__dirname, 'src/assets/css')
      }
    },
    devServer: {
      port: 8080, // 监听端口
      open: true, // 开启后默认打开页面,
      // 代理服务器
      // proxy: {
      //   // 代理规则
      //   '/api': {
      //     target: 'http://open.duyiedu.com',
      //     changeOrigin: true, // 更改请求头中的 host 和 origin,
      //   }
      // }
      proxy: [
        {
          context: ['/api'],
          target: 'http://open.duyiedu.com'
        }
      ]
    }
    // optimization: {
    //   // 分包
    //   splitChunks: {
    //     // chunks: 'all',
    //     chunks(chunk) {
    //       return chunk.name !== 'main';
    //     }
    //   }
    // }
  };
};
