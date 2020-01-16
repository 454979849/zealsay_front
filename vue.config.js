const path = require("path");
const chalk = require("chalk");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const PrerenderSPAPlugin = require("prerender-spa-plugin");

// 存放build结果的文件夹(主要是为了填prerender在配置了baseUrl后带来的坑,下面会说)
const DIST_ROOT = "dist";
// 项目部署在服务器里的绝对路径，默认'/'，参考https://cli.vuejs.org/zh/config/#baseurl
const BASE_URL = "/";
// 转为CND外链方式的npm包，键名是import的npm包名，键值是该库暴露的全局变量，参考https://webpack.js.org/configuration/externals/#src/components/Sidebar/Sidebar.jsx
const externals = {
  vue: "Vue",
  "vue-router": "VueRouter",
  vuex: "Vuex",
  axios: "axios",
  vuetify: "Vuetify",
  "mavon-editor": "mavonEditor",
  "vue-chartist": "chartist",
  jquery: "$"
};
// CDN外链，会插入到index.html中
const cdn = {
  // 开发环境
  dev: {
    css: [],
    js: []
  },
  // 生产环境
  build: {
    // cdn的css链接
    css: [
      "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900",
      "https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css",
      "https://cdn.bootcss.com/vuetify/2.1.1/vuetify.min.css",
      "https://unpkg.com/mavon-editor/dist/css/index.css",
      "https://cdn.bootcss.com/chartist/0.11.4/chartist.min.css"
    ],
    // cdn的js链接
    js: [
      "https://cdn.bootcss.com/vue/2.6.10/vue.min.js",
      "https://cdn.bootcss.com/vuex/3.1.1/vuex.min.js",
      "https://cdn.bootcss.com/axios/0.19.0-beta.1/axios.min.js",
      "https://cdn.bootcss.com/vuetify/2.1.1/vuetify.min.js",
      "https://unpkg.com/mavon-editor/dist/mavon-editor.js",
      "https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js",
      "https://cdn.bootcss.com/chartist/0.11.4/chartist.min.js"
    ]
  }
};
// 是否使用预渲染
const productionPrerender = true;
// 需要预渲染的路由
const prerenderRoutes = ["/", "/contacts"];
// 是否使用gzip
const productionGzip = true;
// 需要gzip压缩的文件后缀
const productionGzipExtensions = ["js", "css"];

module.exports = {
  publicPath: BASE_URL,
  outputDir: DIST_ROOT + BASE_URL, // prerendner会借助一个express服务器来预渲染，改变baseUrl后要保证这个模拟服务器能够找到所需的资源
  assetsDir: "static",
  productionSourceMap: false,

  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:8090",
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          "^/api": "api"
        }
      }
    }
  },
  transpileDependencies: ["vuetify"],
  runtimeCompiler: true,

  css: {
    extract: true
  },
  pluginOptions: {
    prerenderSpa: {
      registry: undefined,
      renderRoutes: ["/"],
      useRenderEvent: true,
      headless: true,
      onlyProduction: true
    }
  },
  configureWebpack: () => {
    const myConfig = {};
    if (process.env.NODE_ENV === "production") {
      // 1. 生产环境npm包转CDN
      myConfig.externals = externals;
      // 2. 使用预渲染，在仅加载html和css之后即可显示出基础的页面，提升用户体验，避免白屏
      myConfig.plugins = [];
      productionPrerender &&
        myConfig.plugins.push(
          new PrerenderSPAPlugin({
            staticDir: path.resolve(__dirname, DIST_ROOT), // 作为express.static()中间件的路径
            outputDir: path.resolve(__dirname, DIST_ROOT + BASE_URL),
            indexPath: path.resolve(
              __dirname,
              DIST_ROOT + BASE_URL + "index.html"
            ),
            routes: prerenderRoutes,
            minify: {
              collapseBooleanAttributes: true,
              collapseWhitespace: true,
              decodeEntities: true,
              keepClosingSlash: true,
              sortAttributes: true
            },
            postProcess(renderedRoute) {
              /**
               * 懒加载模块会自动注入，无需直接通过script标签引入
               * 而且预渲染的html注入的是modern版本的懒加载模块
               * 这会导致在低版本浏览器出现报错，需要剔除
               * 这并不是一个非常严谨的正则，不适用于使用了 webpackChunkName: "group-foo" 注释的懒加载
               */
              renderedRoute.html = renderedRoute.html.replace(
                /<script[^<]*chunk-[a-z0-9]{8}\.[a-z0-9]{8}.js[^<]*><\/script>/g,
                function(target) {
                  console.log(
                    chalk.bgRed("\n\n剔除的懒加载标签:"),
                    chalk.magenta(target)
                  );
                  return "";
                }
              );
              return renderedRoute;
            }
          })
        );
      // 3. 构建时开启gzip，降低服务器压缩对CPU资源的占用，服务器也要相应开启gzip
      productionGzip &&
        myConfig.plugins.push(
          new CompressionWebpackPlugin({
            test: new RegExp(
              "\\.(" + productionGzipExtensions.join("|") + ")$"
            ),
            threshold: 8192,
            minRatio: 0.8
          })
        );
    }
    if (process.env.NODE_ENV === "development") {
      /**
       * 关闭host check，方便使用ngrok之类的内网转发工具
       */
      myConfig.devServer = {
        disableHostCheck: true
      };
    }
    return myConfig;
  },
  chainWebpack: config => {
    // 这里是对环境的配置，不同环境对应不同的BASE_URL，以便axios的请求地址不同
    config.plugin("define").tap(args => {
      args[0]["process.env"].VUE_APP_API_URL = JSON.stringify(
        process.env.VUE_APP_API_URL
      );
      return args;
    });
    // 压缩代码
    config.optimization.minimize(true);
    // 分割代码
    config.optimization.splitChunks({
      chunks: "all"
    });
    /**
     * 删除懒加载模块的prefetch，降低带宽压力
     * https://cli.vuejs.org/zh/guide/html-and-static-assets.html#prefetch
     * 而且预渲染时生成的prefetch标签是modern版本的，低版本浏览器是不需要的
     */
    config.plugins.delete("prefetch");
    /**
     * 添加CDN参数到htmlWebpackPlugin配置中
     */
    config.plugin("html").tap(args => {
      if (process.env.NODE_ENV === "production") {
        args[0].cdn = cdn.build;
      }
      if (process.env.NODE_ENV === "development") {
        args[0].cdn = cdn.dev;
      }
      return args;
    });
    /**
     * 无需使用@import在每个scss文件中引入变量或者mixin，也可以避免大量@import导致build变慢
     * sass-resources-loader 文档链接：https://github.com/shakacode/sass-resources-loader
     */
    // const oneOfsMap = config.module.rule("scss").oneOfs.store;
    // const sassResources = ["color.scss", "mixin.scss", "common.scss"]; // scss资源文件，可以在里面定义变量，mixin,全局混入样式等
    // oneOfsMap.forEach(item => {
    //   item
    //     .use("sass-resources-loader")
    //     .loader("sass-resources-loader")
    //     .options({
    //       resources: sassResources.map(file =>
    //         path.resolve(__dirname, "src/style/" + file)
    //       )
    //     })
    //     .end();
    // });
  }
};
