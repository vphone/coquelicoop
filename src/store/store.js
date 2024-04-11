import Vuex from 'vuex'
import { getProducts, getBulkProducts } from '../services/products'

export const store = new Vuex.Store({
  state: {
    products: {},
    keyword: '',
    isBulk: true
  },
  mutations: {
    setProducts(state, {keyword, products}) {
      state.products[keyword] = products
    },
    setKeyword(state, keyword)
    {
      state.keyword = keyword
    },
    setBulk(state, value)
    {
      state.isBulk = value
    }
  },
  actions: {
    async setProducts({commit, state}, keyword) {
      try {        
        commit('setKeyword', keyword)
        commit('setBulk', false)
        if(!state.products[keyword]) {
        const products =  await getProducts(`${keyword}`)
        commit('setProducts', {keyword, products})
        }
      } catch (err) {
        console.log('ERROR', err)
      }
    },
    async setBulkProducts({commit, state}) {
      try {        
        commit('setKeyword', '')
        commit('setBulk', true)
        if(!state.products['vrac']) {
        const products =  await getBulkProducts()
        commit('setProducts', {keyword: 'vrac', products})
        }
      } catch (err) {
        console.log('ERROR', err)
      }
    },
  },
})
export default store
