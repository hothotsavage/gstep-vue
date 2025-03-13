<template>
  <div class="page">
    <Editor class="editor" 
      baseUrl="http://localhost:9900" 
      v-model:template="data.template"
      @cancel="onCancel"
      @save="onSave" />
  </div>
</template>

<script setup>
import { version } from 'vue'
import { onMounted, ref,reactive } from 'vue'

const data = reactive({
  template:{}
})

onMounted(() => {
  data.template = {
    id: 63
  }
})

const onCancel=()=>{
  console.log('cancel')
}

const onSave=()=>{
  console.log('save')
  console.log('+++ saved template ++++++')
  console.log(data.template)
}

</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100vh;

  .editor {
    width: 100%;
    height: 100%;
  }
}
</style>

