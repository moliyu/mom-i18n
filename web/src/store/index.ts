import { createStore } from 'vuex'

export default createStore({
  state: {
    locale: {},
    key: '',
    path: ''
  },
  mutations: {
    SET_LOCALE(state, payload) {
      state.locale = payload
    },
    SET_KEY(state, key: string) {
      state.key = key
    },
    SET_PATH(state, path: string) {
      state.path = path
    }
  },
  actions: {
    set_locale_info({commit}, {key, locale, path}) {
      commit('SET_LOCALE', locale)
      commit('SET_KEY', key)
      commit('SET_PATH', path)
    }
  },
  modules: {
  }
})
