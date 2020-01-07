import vuetifyOptions from './plugins/vuetify/options.js'

export default {
  mode: 'universal',
  server: {
    port: 4000 // default: 3000
  },
  /*
   ** Headers of the page
   */
  head: {
    title: 'zealsay说你想说-为分享快乐而生',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'zealsay说你想说，是一个关注于互联网、IT技术经验分享的个人独立博客。专注于IT行业最前沿的技术。致力成为互联网上最个性、最极客、具传播力的个人独立博客。'
      },
      {
        hid: 'keywords',
        name: 'keywords',
        content:
          '技术人生,技术笔记,情感交流,技术分享,java,spring boot,vue,nuxt,vuetify,后台,前端,服务器,动漫,程序员,全栈工程师,全栈,zealsay,zealsay博客,zealsay说你想说,王者荣耀,游戏,盘点,个人博客,建站系统,生活杂记,随笔,WEB平台,BOX-ROM,BoxMod。'
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  // loading: {
  //   color: 'pink',
  //   height: '4px'
  // },

  /*
   ** Global CSS
   */
  css: [
    'material-design-icons-iconfont/dist/material-design-icons.css',
    // 'vuetify/dist/vuetify.min.css',
    'chartist/dist/chartist.min.css',
    '@/assets/scss/styles/index.scss',
    '@/static/live2d/css/live2d.css'
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: '@/plugins/axios', ssr: false },
    { src: '@/plugins/chartist', ssr: true },
    { src: '@/plugins/sweetalert2', ssr: false },
    { src: '@/plugins/vue-perfect-scrollbar', ssr: false },
    { src: '@/plugins/vue-mavon-editor', srr: false },
    { src: '@/plugins/vue-cropper', ssr: false },
    // { src: '@/plugins/bubbly-bg', ssr: false },
    { src: '@/plugins/localStorage.js', ssr: false },
    { src: '@/plugins/material.js', ssr: false }
  ],

  /**
   * 禁用加载进度条
   */
  loading: false,
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth'
  ],
  /*
   ** auth middleware
   */
  router: {
    middleware: ['auth']
  },
  /*
   *配置auth.
   */
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: '/api/v1/authentication/login',
            method: 'post',
            propertyName: 'data.token'
          },
          logout: { url: '/api/v1/authentication/logout', method: 'get' },
          user: {
            url: '/api/v1/authentication/user',
            method: 'get',
            propertyName: 'data'
          }
        },
        tokenRequired: true,
        tokenType: 'Bearer '
      }
    },
    redirect: {
      login: '/login',
      logout: '/',
      callback: '/login',
      home: '/'
    },
    watchLoggedIn: true // 默认为true
  },
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    // baseURL: process.env.apiUrl, // 代理请求域名
    // https: true, // 开启https
    prefix: '/app/', // 给路径加个前缀
    proxy: true, // Can be also an object with default options
    credentials: true, // 表示跨域请求时候是否需要携带凭证
    retry: { retries: 3 }, // 超时重试3次
    progress: false, // 请求的时候是否加载loading页面
    debug: false // 开启调试，线上关闭
  },

  proxy: {
    '/app/': {
      // target: process.env.VUE_APP_API_URL, // 目标接口域名
      target: process.env.VUE_APP_API_URL || 'http://localhost:8090', // 目标接口域名
      changeOrigin: true, // 是否跨域
      pathRewrite: { '^/app/': '' } // 把/api 替换成 /
    }
  },
  /**
   * vuetify 2.0
   */
  buildModules: [
    // Simple usage
    ['@nuxtjs/vuetify', vuetifyOptions]
  ],
  /**
   * vuetify 设置.
   */
  // vuetify: {
  //   treeShake: {
  //     loaderOptions: {
  //       // vuetify-loader options (match function)
  //     }
  //   },
  //   optionsPath: '@/plugins/vuetify/options.js'
  // },
  /*
   ** Build configuration
   */
  build: {
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    // transpile: ['vuetify/lib'],
    // plugins: [new VuetifyLoaderPlugin()],
    // loaders: {
    //   stylus: {
    //     import: ['~vuetify/src/styles/styles.sass']
    //   }
    // },
    /*
     ** You can extend webpack config here
     */

    vendor: ['axios', 'vue-cropper']
  }
}
