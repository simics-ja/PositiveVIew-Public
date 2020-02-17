import jsonData from '~/assets/json/BookList.json'

// 状態管理
export const state = () => ({
  data: jsonData
})

// getters
export const getters = {
  getBookList (state) {
    return state.data
  }
}
