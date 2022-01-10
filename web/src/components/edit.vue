<template>
  <div class="i18nWrapper">
    <div class="wrapper">
      <div class="title">I18nkey: {{key}}</div>
      <el-form label-width="100px">
        <el-form-item label="路径">
          {{path}}
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
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
const state = ref<Record<string, any>>({})

const store = useStore()
const locale = computed(() => store.state.locale)
const key = computed(() => store.state.key)
const path = computed(() => store.state.path)
const vscode = computed(() => store.state.vscode)
watchEffect(() => {
  state.value = JSON.parse(JSON.stringify(locale.value))
})
const confirm = () => {
  // @ts-ignore
  vscode.value.postMessage({
    type: 'edit',
    value: {
      key: key.value,
      locale: { ...state.value },
      path: path.value
    }
  })
}
const reset = () => {
  state.value = JSON.parse(JSON.stringify(locale.value))
}

</script>

<style scoped>
.i18nWrapper {
  width: 100vw;
  height: 100vh;
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