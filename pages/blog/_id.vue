<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div id="index">
    <!-- header -->
    <v-card color="primary" height="450">
      <blog-nav :category="categorys"></blog-nav>
      <v-container>
        <v-layout justify-center>
          <v-flex xs12 md10 lg8>
            <div class="text-center word">
              <h1 class="hitokoto-title">
                {{ article.title }}
              </h1>
              <p
                class="article-info font-weight-bold text-capitalize white--text"
              >
                {{ article.readNum }}次浏览 {{ article.likeNum }}个点赞
              </p>
              <div class="author">
                <v-avatar class="author-avatar" :size="48"
                  ><img :src="article.authorAvatar" alt="avatar"
                /></v-avatar>
                <div class="font-weight-medium white--text author-name">
                  <p class="author-text">{{ article.authorName }}</p>
                  <p class="author-text">
                    {{ article.createDate | formatDate }}
                    发表于
                    {{ article.categoryName }}
                  </p>
                </div>
              </div>
            </div>

            <v-tooltip v-if="like" top>
              <template v-slot:activator="{ on }">
                <v-btn class="icon-like" fab>
                  <v-icon medium color="pink" v-on="on" @click="dislikeArticle"
                    >mdi-heart</v-icon
                  >
                </v-btn>
              </template>
              点击取消喜欢
            </v-tooltip>
            <v-tooltip v-else top>
              <template v-slot:activator="{ on }">
                <v-btn class="icon-like" fab>
                  <v-icon medium color="pink" v-on="on" @click="likeArticle"
                    >mdi-heart-outline</v-icon
                  >
                </v-btn>
              </template>
              喜欢这篇文章？那就点个赞吧！
            </v-tooltip>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
    <v-container>
      <v-container>
        <v-layout justify-center>
          <v-flex xs12 md10 lg8>
            <v-breadcrumbs :items="breadcrumbs" class="breadcrumbs-item title">
              <template v-slot:divider>
                <v-icon>chevron_right</v-icon>
              </template>
            </v-breadcrumbs>
            <template>
              <div class="markdown-body" v-html="article.contentHtml"></div>
            </template>
            <v-layout justify-center wrap>
              <v-flex xs12 md12 lg12>
                <p class="font-weight-medium" style="margin-top: 10rem">
                  转载文章请注明:
                  <a :href="'/blog/' + article.id" target="_blank">{{
                    'zealsay - ' + article.title
                  }}</a>
                </p>
              </v-flex>
              <v-flex xs12 sm6 class="align-self-center">
                <div class="article-label">
                  <v-label>标签：</v-label>
                  <v-chip
                    v-for="label in article.label
                      ? article.label.split(',')
                      : []"
                    :key="label"
                    class="chip-label"
                    :color="color[parseInt((label.length + 6) % 6)]"
                    text-color="text-white"
                    small
                  >
                    <a
                      :href="'/blog/label/' + label"
                      style="color: white"
                      target="_Blank"
                    >
                      {{ label }}</a
                    >
                  </v-chip>
                </div>
              </v-flex>
              <v-flex xs12 sm6 class="text-right align-self-center">
                <v-btn class="mx-2" fab dark small color="success">
                  <v-icon dark>mdi-wechat</v-icon>
                </v-btn>
                <v-btn class="mx-2" fab dark small color="blue">
                  <v-icon dark>mdi-qqchat</v-icon>
                </v-btn>
                <v-btn class="mx-2" fab dark small color="pink">
                  <v-icon dark>mdi-sina-weibo</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>

            <v-divider></v-divider>
            <blog-comment
              :page="commentPage"
              :article="article"
              :count="count"
            ></blog-comment>
          </v-flex>
        </v-layout>
      </v-container>

      <core-back-to-top :visibility-height="300" :back-position="0" />
    </v-container>
    <!-- 页脚 -->
    <v-layout>
      <v-flex>
        <div class="footer">
          <blog-footer v-if="$route.name !== 'Maps'" />
        </div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import Util from '@/util'
import NavBar from '@/components/blog/NavBar'
import Comment from '@/components/blog/Comment'
import { readArticle, likeArticle, disLikeArticle } from '@/api/article'
import { getArticleData } from '@/api/data'

export default {
  auth: false,
  components: {
    'blog-nav': NavBar,
    'blog-comment': Comment
  },
  filters: {
    formatDate(time) {
      if (time != null && time !== '') {
        return Util.formateDate(time)
      } else {
        return ''
      }
    }
  },
  data: () => ({
    loading: true,
    color: ['primary', 'secondary', 'success', 'info', 'warning', 'danger']
  }),
  head() {
    return {
      title: this.article.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.article.contentHtml
            .replace(/<[^>]+>/g, '')
            .slice(0, 100)
        }
      ]
    }
  },
  computed: {
    breadcrumbs() {
      return [
        {
          text: '主页',
          disabled: false,
          href: '/'
        },
        {
          text: this.article.categoryName,
          disabled: false,
          href: '/blog/category/' + this.article.categoryId
        },
        {
          text: this.article.title,
          disabled: true,
          href: '/blog/' + this.article.id
        }
      ]
    }
  },
  async asyncData({ app, params, error }) {
    // 标记阅读数
    await app.$axios.$request(readArticle(params.id))
    const res = await app.$axios.$request(getArticleData(params.id))
    if (res.code === '200') {
      const article = res.data.article
      const categorys = res.data.categorys
      const like = res.data.like
      const commentPage = res.data.commentPage
      const count = res.data.count
      return {
        article,
        categorys,
        like,
        commentPage,
        count
      }
    } else {
      return error({ statusCode: res.code, message: res.message })
    }
  },
  methods: {
    search() {
      // eslint-disable-next-line no-console
      console.log('click search')
    },
    likeArticle() {
      if (this.$store.state.auth.loggedIn) {
        this.$axios
          .$request(likeArticle(this.article.id))
          .then((res) => {
            if (res.code === '200' && res.data) {
              this.like = true
            } else {
              this.$swal({
                text: '该文章不让你喜欢它！',
                type: 'error',
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
              })
            }
          })
          .catch((e) => {
            this.$swal({
              text: e.message,
              type: 'error',
              toast: true,
              position: 'top',
              showConfirmButton: false,
              timer: 3000
            })
          })
      } else {
        this.$swal({
          text: '请先登录！',
          type: 'warning',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000
        })
      }
    },
    dislikeArticle() {
      if (this.$store.state.auth.loggedIn) {
        this.$axios
          .$request(disLikeArticle(this.article.id))
          .then((res) => {
            if (res.code === '200' && res.data) {
              this.like = false
            } else {
              this.$swal({
                text: '该文章不准你不喜欢它！',
                type: 'error',
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
              })
            }
          })
          .catch((e) => {
            this.$swal({
              text: e.message,
              type: 'error',
              toast: true,
              position: 'top',
              showConfirmButton: false,
              timer: 3000
            })
          })
      } else {
        this.$swal({
          text: '请先登录！',
          type: 'warning',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../assets/scss/styles/markdown/markdown';
/*@import '../../assets/scss/styles/markdown/github-markdown';*/
/*@import '../../assets/scss/styles/markdown/atelier-plateau-dark';*/
.index {
  background: #fafafa;
}
.icon-like {
  float: right;
  margin-top: 2rem;
  margin-right: 5rem;
}
.hitokoto-title {
  color: white;
  font-weight: 400 !important;
  margin-top: 5rem;
  margin-bottom: 0.6rem;
  line-height: 1 !important;
  font-size: 2rem !important;
}
.word {
  position: relative;
}
.article-info {
  margin: 2rem 0;
}
.author {
  display: inline-flex;
}
.author-avatar {
  align-self: center;
}
.author-name {
  text-align: left;
  margin: 0 1rem;
}
.author-text {
  margin: 0.5rem 0;
}
.breadcrumbs-item {
  padding: 2rem 0;
}
.article-label {
  margin: 2rem 0;
}
.chip-label {
  margin: 0.3rem;
}
</style>
