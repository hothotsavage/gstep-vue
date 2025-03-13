<template>
  <el-dialog v-model="isShow" title="编辑" :close-on-click-modal="false" width="500px">
    <el-form :model="record">
      <el-form-item label="标题" label-width="140px">
        <el-input v-model="record.title"></el-input>
      </el-form-item>

      <el-form-item label="字段名" label-width="140px">
        <el-input v-model="record.name"></el-input>
      </el-form-item>

      <el-form-item label-width="140px">
        <el-button type="primary" @click="onSubmit">确定</el-button>
        <el-button @click="onClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineProps, onMounted, defineEmits } from 'vue'
import ApiUtil from '@/api/api'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  record: Object,
  isShow: Boolean,
  fields: Array
})

const emit = defineEmits(['update:record', 'update:isShow','update:fields'])
const isShow = useVModel(props, 'isShow', emit)
const record = useVModel(props, 'record', emit)
const fields = useVModel(props, 'fields', emit)

onMounted(() => {

})

const onClose = () => {
  isShow.value = false
}

const onSubmit = () => {
  isShow.value = false
}
</script>

<style lang="scss" scoped>
.edit-dialog-widget {
  width: 100%;
  height: 100%;
}
</style>
