<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-container fill-height fluid grid-list-xl>
    <v-layout wrap justify-center>
      <v-flex xs12 md10>
        <material-card
          color="primary"
          title="标签云管理"
          text="输入您要检索的标签云"
        >
          <v-card-title class="v-card__title">
            <v-text-field
              v-model="search_text"
              label="检索标签云..."
              clear-icon="close"
              clearable
              type="text"
              color="purple"
              @keyup.enter="search"
            >
              <template v-slot:prepend>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn flat icon color="primary" @click="add">
                      <v-icon v-on="on">add</v-icon>
                    </v-btn>
                  </template>
                  没有找到？点击添加一个标签试试！
                </v-tooltip>
              </template>
              <template v-slot:append-outer>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn flat icon color="primary" @click="search">
                      <v-icon v-on="on">search</v-icon>
                    </v-btn>
                  </template>
                  点击检索一下试试!
                </v-tooltip>
              </template>
            </v-text-field>
          </v-card-title>
          <v-card-text>
            <v-chip
              v-for="label in labels"
              :key="label.id"
              close
              class="chip-label"
              :color="label.outColor"
              text-color="white"
              @input="remove(label.id)"
            >
              <v-avatar v-if="label.icon.startsWith('http')">
                <img :src="label.icon" alt="trevor" />
              </v-avatar>
              <v-avatar
                v-else-if="label.icon === ''"
                :class="label.avatarColor"
              >
                {{ label.name.charAt(0).toUpperCase() }}
              </v-avatar>
              <v-avatar v-else>
                <v-icon>{{ label.icon }}</v-icon>
              </v-avatar>
              {{ label.name }}
            </v-chip>
          </v-card-text>
        </material-card>

        <div>
          <add-form
            :alert="addFormVisible"
            @handleCancelAdd="handleCancelAdd"
          ></add-form>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { getArticleLabelPage, deleteArticleLabel } from '@/api/article'
import addForm from './components/addForm'

export default {
  name: 'ArticleLabel',
  layout: 'admin',
  components: { addForm },
  data: () => ({
    search_text: '',
    total: '',
    labels: [],
    addFormVisible: false
  }),
  async asyncData({ app, query, error }) {
    const resArticleLabel = await app.$axios.$request(getArticleLabelPage())
    if (resArticleLabel.code === '200') {
      const labels = resArticleLabel.data.records
      const total = resArticleLabel.data.total
      return { labels, total }
    } else {
      return error({
        statusCode: resArticleLabel.code,
        message: resArticleLabel.message
      })
    }
  },
  methods: {
    search() {
      const serachData = {}
      serachData.name = this.search_text
      this.$axios
        .$request(getArticleLabelPage(serachData))
        .then((res) => {
          if (res.code === '200') {
            this.labels = res.data.records
            this.total = res.data.total
          } else {
            this.$swal({
              text: '拉取标签失败',
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
        .finally(() => {})
    },
    add() {
      this.addFormVisible = true
    },
    handleCancelAdd() {
      this.addFormVisible = false
    },
    remove(id) {
      this.$axios
        .$request(deleteArticleLabel(id))
        .then((res) => {
          if (res.code === '200') {
            this.search()
          } else {
            this.$swal({
              text: '删除标签失败',
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
        .finally(() => {})
    }
  }
}
</script>

<style scoped>
.chip-label {
  margin: 0.2rem;
}
</style>
