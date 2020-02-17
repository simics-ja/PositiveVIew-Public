<template>
  <div id="top" class="container">
    <b-container>
      <b-row>
        <b-col class="split-view-ranking" sm="8">
          <b-container>
            <b-row class="selector">
              <b-nav align="center" fill pills class="books-type-nav">
                <b-nav-item :active="booksType === 'art'" :class="booksType === 'art' ? 'selected-book-type' : ''" @click="setBooksType('art')">
                  <b-img v-if="booksType==='art'" src="~/assets/images/index-finger-arrow.svg" :class="booksType === 'art' ? 'selected-book-type-icon' : ''" />
                  <span :class="booksType === 'art' ? 'selected-book-type-text' : ''">芸術の秋</span>
                </b-nav-item>
                <b-nav-item :active="booksType === 'sports'" :class="booksType === 'sports' ? 'selected-book-type' : ''" @click="setBooksType('sports')">
                  <b-img v-if="booksType==='sports'" src="~/assets/images/index-finger-arrow.svg" :class="booksType === 'sports' ? 'selected-book-type-icon' : ''" />
                  <span :class="booksType === 'sports' ? 'selected-book-type-text' : ''">スポーツの秋</span>
                </b-nav-item>
                <b-nav-item :active="booksType === 'travel'" :class="booksType === 'travel' ? 'selected-book-type' : ''" @click="setBooksType('travel')">
                  <b-img v-if="booksType==='travel'" src="~/assets/images/index-finger-arrow.svg" :class="booksType === 'travel' ? 'selected-book-type-icon' : ''" />
                  <span :class="booksType === 'travel' ? 'selected-book-type-text' : ''">旅行・行楽の秋</span>
                </b-nav-item>
              </b-nav>
              <div class="colorful-separator" />
            </b-row>
            <b-row
              v-for="(item, index) in viewItems[booksType]"
              :key="index"
              class="ranked-item-wrapper"
              :class="[index === selectedItem && isSelected ? 'selected-item' : '']"
              @click="clickedItemHandler(index)"
            >
              <b-col class="rank-number-wrapper">
                <div class="rank-number font-weight-bold text-primary">
                  {{ index + 1 }}
                </div>
              </b-col>
              <b-col class="item-wrapper">
                <b-container>
                  <b-row :class="[index === selectedItem && isSelected ? 'selected-item' : '']">
                    <b-col class="item-image-wrapper">
                      <img :src="item.pictureSrc" class="item-image">
                    </b-col>
                    <b-col class="item-info-wrapper">
                      <h2>
                        {{ item.title }}
                      </h2>
                      <p>
                        {{ item.author }}
                      </p>
                      <span class="rating-param">評価：</span>
                      <div class="star-ratings-wrapper">
                        <div :style="{ width: item.rating * 100 / 5 + '%'}" class="star-ratings-top">
                          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>
                        <div class="star-ratings-bottom">
                          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>
                      </div>
                      <div class="rating-param">
                        <span>{{ item.rating + '(' + item.reviewCount + '件)' }}</span>
                      </div>
                      <div v-show="uiType==='positive'" class="comment-wrapper">
                        <p class="comment">
                          <span style="font-weight: bold;color:#996600">Good </span>{{ item.comment[commentIndex[booksType][index]].review }}
                        </p>
                      </div>
                    </b-col>
                  </b-row>
                </b-container>
              </b-col>
            </b-row>
          </b-container>
        </b-col>
        <b-col class="split-view-detail-background" sm="4">
          <DetailWindow :book-type="booksType" :is-selected="isSelected" :selected-item="selectedItem" :book-list="viewItems[booksType]" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import DetailWindow from '~/components/DetailWindow.vue'
import firebase from '~/plugins/firebase.js'
const retryx = require('retryx')

const wait = function (duration) {
  return new Promise((resolve) => { setTimeout(resolve, duration) })
}
const db = firebase.firestore()

const BOOK_TYPE = ['art', 'sports', 'travel']
const UI_TYPE = ['positive', 'normal']

document.oncontextmenu = function () {
  return false
}

export default {
  components: {
    DetailWindow
  },
  data () {
    return {
      uiType: 'positive',
      booksType: 'art',
      selectedItem: 0,
      isSelected: false,
      sessionId: '',
      viewItems: {},
      commentIndex: {
        'art': new Array(15).fill(0, 0, 15),
        'sports': new Array(15).fill(0, 0, 15),
        'travel': new Array(15).fill(0, 0, 15)
      }
    }
  },
  async asyncData (context) {
    const store = context.store
    const bookList = store.getters['json/getBookList']
    const isbns = []

    for (const genre in bookList) {
      for (const i in bookList[genre]) {
        isbns.push(bookList[genre][i].isbn)
      }
    }

    const tryGetStatus = async (isbns) => {
      const baseUrl = '/check'
      const appkey = '?appkey=c47557e829d0b2651aceedd27b7f0053'
      const systemid = '&systemid=Hyogo_Kobe'
      const callbackFlag = '&callback=no'
      let session = ''
      let tryCnt = 0
      const status = {}
      const isbnQuery = isbns.filter((ele) => {
        return !Object.keys(status).includes(ele)
      })

      await retryx(async () => {
        tryCnt++
        const getUrl = (tryCnt === 1)
          ? encodeURI(baseUrl + appkey + '&isbn=' + isbnQuery.join(',') + systemid + callbackFlag)
          : encodeURI(baseUrl + appkey + session + callbackFlag)
        await store
          .$axios
          .$get(getUrl, { crossdomain: true })
          .then((res) => {
            session = '&session=' + res.session
            console.log('response:', res)
            console.log(`Get ${Object.keys(status).length}, left ${isbns.length - Object.keys(status).length} books`)
            for (const i in Object.keys(res.books)) {
              const isbn = Object.keys(res.books)[i]
              const systemStatus = res.books[isbn].Hyogo_Kobe.status
              if (!status[isbn] && (systemStatus === 'Cache' || systemStatus === 'OK')) {
                status[isbn] = res.books[isbn].Hyogo_Kobe.libkey['中央図書館']
                console.log(`${isbn} is done.`)
              } else if (!status[isbn] && systemStatus === 'Error') {
                console.log(`${isbn} is Error.`)
              }
            }

            if (res.continue === 1) {
              console.log('continue')
              return Promise.reject(res)
            } else if (res.continue === 0) {
              console.log(`Complete session: ${session}`)
              session = ''
              if (Object.keys(status).length === isbns.length) {
                console.log('Complete all books')
                return Promise.resolve(res)
              } else if (Object.keys(status).length < isbns.length) {
                console.log('Less books than expected')
                tryCnt = 0
                return Promise.reject(res)
              } else {
                console.error('Unexpexted response')
                return Promise.reject(res)
              }
            }
            console.log('No continue property in Response')
            throw new Error('No continue property in Response')
          })
      },
      {
        maxTries: 30,
        beforeWait: (tries) => {
          console.log(`${tries} trials`)
        },
        waiter: () => wait(5000),
        doFinally: () => {
          for (const i in isbns) {
            const isbn = isbns[i]
            if (!status[isbn]) {
              status[isbn] = '取得失敗'
            }
          }
        }
      }).catch((err) => {
        console.log(err)
      })
      return status
    }

    const bookStatus = await tryGetStatus(isbns)
    for (const genre in bookList) {
      for (const i in bookList[genre]) {
        bookList[genre][i].status = bookStatus[bookList[genre][i].isbn]
      }
    }
    return {
      bookList
    }
  },
  mounted () {
    this.sessionId = Date.now()
    this.setInitialState()
    this.setViewItems()
  },
  onIdle () {
    if (this.isSelected === true) {
      this.setInitialState()
      this.setViewItems()
    }
  },
  onActive () {
    this.sessionId = Date.now()
  },
  methods: {
    clickedItemHandler (index) {
      this.selectedItem = index
      this.isSelected = true
      const item = this.viewItems[this.booksType][index]
      const isbns = this.viewItems[this.booksType].map((ele) => { return ele.isbn })

      // Record Operation Log
      db.collection(process.env.NODE_ENV === 'development' ? 'dev_log' : 'log').add({
        selected: index,
        sessionId: this.sessionId,
        booksType: this.booksType,
        bookList: isbns,
        uiType: this.uiType,
        isbn: item.isbn,
        rating: item.rating,
        reviewCount: item.reviewCount,
        createdAt: new Date()
      })
        .then((res) => {
          console.log('Add Document with ID: ', res.id)
          return res.id
        })
        .catch((err) => {
          console.log('Error: Add Document', err)
          throw err
        })
    },
    setInitialState () {
      this.booksType = BOOK_TYPE[Math.floor(Math.random() * Math.floor(BOOK_TYPE.length))]
      this.uiType = UI_TYPE[Math.floor(Math.random() * Math.floor(UI_TYPE.length))]
      this.selectedItem = 0
      this.isSelected = false
      this.$bvModal.hide('bv-modal-summary-view')
      this.$bvModal.hide('bv-modal-review')
      this.$scrollTo('#top', 500, {})
    },
    setBooksType (type) {
      this.booksType = type
      this.selectedItem = 0
      this.isSelected = false
      this.$bvModal.hide('bv-modal-summary-view')
      this.$bvModal.hide('bv-modal-review')
    },
    randomSelect (array, num) {
      const newArray = []
      const arrayCopy = array
      while (newArray.length < num && arrayCopy.length > 0) {
        const rand = Math.floor(Math.random() * arrayCopy.length)
        newArray.push(arrayCopy[rand])
        arrayCopy.splice(rand, 1)
      }
      newArray.sort((a, b) => { return (parseFloat(b.rating) - parseFloat(a.rating)) || (b.reviewCount - a.reviewCount) })
      return newArray
    },
    setViewItems () {
      this.viewItems = {
        'art': this.randomSelect(this.bookList.art.slice(0, this.bookList.art.length), 15),
        'sports': this.randomSelect(this.bookList.sports.slice(0, this.bookList.sports.length), 15),
        'travel': this.randomSelect(this.bookList.travel.slice(0, this.bookList.travel.length), 15)
      }
      for (const genre in this.viewItems) {
        this.commentIndex[genre] = []
        for (const i in this.viewItems[genre]) {
          this.commentIndex[genre][i] = Math.floor(Math.random() * Math.floor(this.viewItems[genre][i].comment.length))
        }
      }
      console.log(this.commentIndex)
    }
  },
  scrollToTop: true
}
</script>

<style lang="scss">

p {
  margin: 0;
  padding: 0;
}

.container {
  background-color: #F7F7F7;
  max-width: 100%;
}

.split-view-ranking {
  .books-type-nav {
    width: 100%;
    margin: 1vh;
    padding: 1vh;
    .selected-book-type {
      .selected-book-type-icon {
        max-width: 2vw;
      }

      .selected-book-text {

      }
    }
  }
  .colorful-separator {
    height: 1vh;
    width: 100%;
    background-image: repeating-linear-gradient(90deg, #BF0000, #BF0000 17%, #907070 17%, #907070 34%, #098470 34%, #098470 50%, #F1A118 50%, #F1A118 66%, #C92050 66%, #C92050 83%, #1F4961 83%, #1F4961 100%);
    margin-bottom: 1vh;
  }
  .selected-item {
    background: #F2F2F2;
  }

  .ranked-item-wrapper {
    padding: 20px
  }

  .rank-number-wrapper {
    position: relative;
    max-width: 3vh;

    .rank-number {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateY(-50%) translateX(-50%);
      -webkit-transform: translateY(-50%) translateX(-50%);
      font-size: 3vh;
    }
  }

  .item-image-wrapper {
    max-width: 150px;
    height: 200px;
    text-align: center;
    .item-image {
      width: auto;
      height: auto;
      max-width: 100%;
      max-height:100%;
    }
  }

  .comment-wrapper {
    background: #fff1ca;
    margin-top: 15px;
    padding: 15px;
    border-radius: 10px;

    .comment {

    }
  }

  .star-ratings-wrapper {
    unicode-bidi: bidi-override;
    color: #c5c5c5;
    font-size: 25px;
    height: 25px;
    width: 125px;
    position: relative;
    padding: 0;
    text-shadow: 0px 1px 0 #a2a2a2;

    .star-ratings-top {
      color: #F1A118;
      padding: 0;
      position: absolute;
      z-index: 1;
      display: block;
      top: 0;
      left: 0;
      overflow: hidden;
    }
    .star-ratings-bottom {
      padding: 0;
      display: block;
      z-index: 0;
    }
  }
  .rating-param {
    margin: 10px;
    font-size: 23px;
    display: inline;
  }
}
.split-view-detail-background {
  background: #BF0000;
  max-height: 100vh;
  top: 0;
  position: -webkit-sticky;
  position: sticky;
}

</style>
