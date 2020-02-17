<template>
  <div class="split-view-detail">
    <transition name="fade">
      <div v-show="isSelected" class="detail-window">
        <div class="detail-content">
          <h1 class="detail-info-title">
            {{ bookList[selectedItem].title }}
          </h1>
          <h3 class="detail-info-author">
            {{ bookList[selectedItem].author }}
          </h3>
          <b-container>
            <b-row>
              <b-col sm="5">
                <img :src="bookList[selectedItem].pictureSrc" class="detail-image">
              </b-col>
              <b-col sm="7">
                <div class="star-ratings-wrapper">
                  <div :style="{ width: bookList[selectedItem].rating * 100 / 5 + '%'}" class="star-ratings-top">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <div class="star-ratings-bottom">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
                <div class="rating-param">
                  {{ bookList[selectedItem].rating }}
                </div>
                <div class="book-summary">
                  {{ bookList[selectedItem].summary | truncate(100) }}
                  <b-link v-if="bookList[selectedItem].summary.length > 100" @click="$bvModal.show('bv-modal-summary-view')">
                    (続きを読む)
                  </b-link>
                  <b-modal id="bv-modal-summary-view" hide-footer>
                    <template slot="modal-title">
                      あらすじ
                    </template>
                    <div class="d-block text-center">
                      <p>
                        {{ bookList[selectedItem].summary }}
                      </p>
                    </div>
                    <b-button class="mt-3" block @click="$bvModal.hide('bv-modal-summary-view')">
                      閉じる
                    </b-button>
                  </b-modal>
                </div>
              </b-col>
            </b-row>
            <b-row>
              <div class="detail-info-table">
                <b-container>
                  <b-row
                    v-for="(item, index, key) in setData(bookList[selectedItem])"
                    :key="index"
                    :class="key%2 === 0 ? 'gray-background' : ''"
                  >
                    <b-col sm="4">
                      {{ index }}
                    </b-col>
                    <b-col sm="8">
                      {{ item }}
                    </b-col>
                  </b-row>
                  <p>※貸出状況は最新情報でない場合がございます．</p>
                </b-container>
              </div>
            </b-row>
            <b-row>
              <div class="review-more">
                <b-link class="text-light" @click="$bvModal.show('bv-modal-review')">
                  <b-button variant="primary">
                    レビューを読む
                  </b-button>
                </b-link>
              </div>
              <b-modal id="bv-modal-review" hide-footer size="lg">
                <template slot="modal-title">
                  レビュー from 楽天市場
                </template>
                <div
                  v-for="(item, index) in bookList[selectedItem].reviews"
                  :key="index"
                >
                  <div class="star-ratings-wrapper">
                    <div :style="{ width: item.rating * 100 / 5 + '%'}" class="star-ratings-top">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                    <div class="star-ratings-bottom">
                      <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                  </div>
                  <span v-if="item.rating!==''">
                    {{ parseFloat(item.rating).toFixed(2) }}
                  </span>
                  <span v-if="item.rating===''">
                    –
                  </span>
                  <p class="text-left user-review">
                    {{ item.review }}
                  </p>
                  <hr>
                </div>
                <b-button class="mt-3" block @click="$bvModal.hide('bv-modal-review')">
                  閉じる
                </b-button>
              </b-modal>
            </b-row>
          </b-container>
        </div>
      </div>
    </transition>
    <div v-show="!isSelected" class="detail-default">
      <h2 class="detail-default-message">
        気になる本をタッチ！
      </h2>
      <img src="~/assets/images/touch-action.svg" class="detail-default-image"><br>
    </div>
  </div>
</template>

<script>
export default {
  filters: {
    truncate (string, limit) {
      if (string) {
        return string.substring(0, limit) + (string.length > limit ? '...' : '')
      } else {
        return ''
      }
    }
  },
  props: {
    bookType: {
      type: String,
      default: 'art'
    },
    isSelected: Boolean,
    selectedItem: {
      type: Number,
      default: 0
    },
    bookList: {
      type: Array,
      default: () => {
        return [
          {
            'title': '',
            'author': '',
            'pictureSrc': '',
            'rating': 0.0,
            'reviewCount': 0,
            'reviews': [],
            'summary': '',
            'publisher': '',
            'size': '',
            'category': '',
            'locate': '',
            'isbn': '',
            'rakutenUrl': '',
            'rakutenItemId': '',
            'libUrl': '',
            'comment': '',
            'status': 'initial' }]
      }
    }
  },
  methods: {
    setData (data) {
      return {
        '出版': data.publisher,
        'サイズ': data.size,
        '分類番号': data.category,
        '書架分類': data.locate,
        'ISBN': data.isbn,
        '貸出状況': data.status
      }
    }
  }
}
</script>

<style lang='scss'>
.split-view-detail {
  font-size: 2vh;
  margin: 0;
  padding: 0;

  .detail-window {
    background-color: #F7F7F7;
    box-shadow: 0px 0px 2px 2px rgba(0,0,0,0.4);
    margin-top: 2vh;
    height: 96vh;

    padding: 5%;
    z-index: 1;
    .detail-content {
      .detail-image {
        max-width: 100%;
        max-height: 100%;
      }
      .detail-info-title {
        font-size: 4vh;
      }
      .detail-info-author {
        font-size: 3vh;
      }
      .detail-info-table {
        width: 100%;
        margin: 2vh 1vw;
      }
      .review-more {
        width:100%;
        text-align: center;
      }
      .user-review {
        white-space: pre-line
      }
    }
  }
  .detail-default {
    color: #F7F7F7;
    position: -webkit-sticky;
    position: sticky;
    top: 2vh;
    height: 96vh;
    justify-content: center;
    align-items: center;
    width: 100%;
    z-index: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .detail-default-message {
      margin: 3vh 0vh;
    }
    .detail-default-image {
      width: 50%;
    }
  }

  .gray-background {
    background: #EFEFEF
  }

  .rating-param {
    margin: 10px;
    display: inline;
  }
}

.star-ratings-wrapper {
  display: inline-block;
  unicode-bidi: bidi-override;
  color: #c5c5c5;
  height: 2vh;
  width: 10vh;
  position: relative;
  padding: 0;
  text-shadow: 0px 1px 0 #a2a2a2;
  .star-ratings-top {
    color: #F1A118;
    padding: 0;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    overflow: hidden;
  }
  .star-ratings-bottom {
    padding: 0;
    z-index: 0;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

</style>
