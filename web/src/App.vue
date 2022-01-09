<template>
  <router-view/>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex';

const store = useStore()
window.addEventListener('message', event => {
  const data = event.data
  switch (data.type) {
    case 'detail':
      console.log('mmm', data)
      store.dispatch('set_locale_info', data.value)
      break
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
