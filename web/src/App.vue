<template>
  <div class="parent">
    <Edit v-if="type==='edit'" />
    <Add v-if="type==='add'" />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus'

import Edit from '@/components/edit.vue'
import Add from '@/components/add.vue'
import { ref } from 'vue';
const type = ref('edit')

const store = useStore()
window.addEventListener('message', event => {
  const data = event.data
  switch (data.type) {
    case 'detail':
      type.value = 'edit'
      store.dispatch('set_locale_info', data.value)
      break
    case 'add':
      type.value = 'add'
      store.dispatch('set_locale_info', data.value)
      break
    case 'handleOk':
      ElMessage.success(data.value)
      break
    case 'error':
      ElMessage.error(data.value)
      break
  }
})
// @ts-ignore
const instance = acquireVsCodeApi()
store.commit('SET_INSTANCE', instance)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}
.parent {
  width: 100vw;
  height: 100vh;
}
</style>
