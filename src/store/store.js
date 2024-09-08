import Vuex from 'vuex'
import { getProducts, getBulkProducts } from '../services/products'

export const store = new Vuex.Store({
  state: {
    products: {},
    keyword: '',
    isBulk: true,
    weights: {
      packaging: 0,
      product: 0,
      total: 0
    },
    admin: {
      status: false,
      number: 1,
      weight: 0,
      type: null
    }
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
    setPackagingWeight(state, value) {
      state.weights.packaging = value
    },
    setProductWeight(state, value) {
      state.weights.product = value
    },
    setTotalWeight(state, value) {
      state.weights.total = value
    },
    setAdminWeight(state, value) {
      state.admin.weight = value
    },
    setAdminNumber(state, value) {
      state.admin.number = value
    },
    setAdminType(state, value) {
      state.admin.type = value
    },
    setIsAdmin(state, value) {
      state.admin.status = value
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
        const products = []
        commit('setProducts', { keyword, products})
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
    setPackagingWeight({ commit }, weight) {
      commit('setPackagingWeight', weight)
    },
    setTotalWeight({ commit }, weight) {
      commit('setTotalWeight', weight)
    },
    resetSearch({ commit }) {
      commit('setKeyword', '')
    },
    setAdminWeight({ commit }, weight) {
      commit('setAdminWeight', weight)
    },
    setAdminNumber({ commit }, value) {
      commit('setAdminNumber', value)
    },
    setAdminType({ commit }, value) {
      commit('setAdminType', value)
    },
    setIsAdmin({ commit }, value) {
      commit('setIsAdmin', value)
    },
  },
})
export default store
