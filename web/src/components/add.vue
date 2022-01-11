<template>
  <div class="i18nWrapper">
    <div class="wrapper">
      <div class="title">新增国际化</div>
      <el-form label-width="100px">
        <el-form-item label="路径">
          <el-input v-model="p"></el-input>
        </el-form-item>
        <el-form-item label="i18nKey">
          <el-input v-model="k"></el-input>
        </el-form-item>
        <el-form-item
        v-for="(item, i) in Object.keys(state)"
        :key="i"
        :label="item"
        >
          <el-input v-model="state[item]"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="confirm">确定</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
const state = ref<Record<string, any>>({})

const store = useStore()
const locale = computed(() => store.state.locale)
const vscode = computed(() => store.state.vscode)
const p = ref('')
const k = ref('')
watchEffect(() => {
  const { key, path, locale } = store.state
  p.value = path
  k.value = key
  state.value = JSON.parse(JSON.stringify(locale))
})
const confirm = () => {
  // @ts-ignore
  vscode.value.postMessage({
    type: 'add',
    value: {
      key: k.value,
      locale: { ...state.value },
      path: p.value
    }
  })
}
const reset = () => {
  state.value = JSON.parse(JSON.stringify(locale.value))
}

</script>

<style scoped>
.i18nWrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.title {
  font-size: 25px;
  text-align: center;
  font-weight: bold;
}
.wrapper {
  min-width: 500px;
  margin: 20px 0;
}
</style>