import { createStore } from 'vuex'

export default createStore({
  state: {
    locale: {},
    key: '',
    path: '',
    vscode: null
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
    },
    SET_INSTANCE(state, instance) {
      state.vscode = instance
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
