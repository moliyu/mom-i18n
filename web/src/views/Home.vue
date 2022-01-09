<template>
  <div class="container">
    <h3>{{key}}</h3>
    <el-form style="max-width: 500px" label-width="100px">
      <el-form-item
      v-for="(item, i) in Object.keys(locale)"
      :key="i"
      :label="item"
      >
        <el-input :modelValue="locale[item]" @input="change"></el-input>
      </el-form-item>
    </el-form>
    <div>{{path}}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()
const locale = computed(() => store.state.locale)
const key = computed(() => store.state.key)
const path = computed(() => store.state.path)
const change = (val) => {
  console.log('%c 🥜 val: ', 'font-size:20px;background-color: #FCA650;color:#fff;', val);
}
</script>

<style scoped>
.container {
  padding: 10px;
}
</style>