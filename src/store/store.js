import Vuex from 'vuex'
import { getProducts, getBulkProducts } from '../services/products'

export const store = new Vuex.Store({
  state: {
    products: {},
    keyword: '',
    isBulk: true,
    weights: {
      jar: 250,
      product: 623,
    },
  },
  mutations: {
    setProducts(state, { keyword, products }) {
      state.products[keyword] = products
    },
    setKeyword(state, keyword) {
      state.keyword = keyword
    },
    setBulk(state, value) {
      state.isBulk = value
    },
    setJarWeight(state, value) {
      state.weights.jar = value
    },
    setProductWeight(state, value) {
      state.weights.product = value
    },
  },
  actions: {
    async setProducts({ commit, state }, keyword) {
      try {
        commit('setKeyword', keyword)
        commit('setBulk', false)
        if (!state.products[keyword]) {
          const products = await getProducts(`${keyword}`)
          commit('setProducts', { keyword, products })
        }
      } catch (err) {
        console.log('ERROR', err)
      }
    },
    async setBulkProducts({ commit, state }) {
      try {
        commit('setKeyword', '')
        commit('setBulk', true)
        if (!state.products['vrac']) {
          const products = await getBulkProducts()
          commit('setProducts', { keyword: 'vrac', products })
        }
      } catch (err) {
        console.log('ERROR', err)
      }
    },
    setProductWeight({ commit }, weight) {
      commit('setProductWeight', weight)
    },
    setJarWeight({ commit }, weight) {
      commit('setJarWeight', weight)
    },
  },
})
export default store
