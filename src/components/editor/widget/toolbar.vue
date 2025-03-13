<template>
    <div class="editor-toolbar">
        <span class="btn" @click="onForm">表单</span>
        <span class="btn" @click="onCancel">取消</span>
        <span class="btn confirm" @click="onConfirm">保存</span>

        <EditFormDialog v-model:isShow="data.isShowFormDialog" v-model:fields="fields" />
    </div>
</template>
  
<script setup>
import { onMounted, ref,reactive, defineEmits } from 'vue';
import ApiUtil from '@/api/api'
import * as vm from '@/components/editor/vm'
import util from '@/util'
import EditFormDialog from './edit_form_dialog.vue'
import {useVModel} from '@vueuse/core'

const props = defineProps({
    isRefreshChart: Boolean,
    fields: Array
})
const emit = defineEmits(['cancel','save','update:fields','update:isRefreshChart'])
const isRefreshChart = useVModel(props, 'isRefreshChart', emit)
const fields = useVModel(props, 'fields', emit)

const data = reactive({
    isShowFormDialog:false 
})

onMounted(() => {

})

const onForm = () => {
    data.isShowFormDialog = true
}

const onCancel = () => {
    emit('cancel')
}

const onConfirm = async () => {
    await vm.save2db()
    isRefreshChart.value = true
    emit('save')
    util.successToast('保存成功')
}



</script>
  
<style lang="scss" scoped>
.editor-toolbar {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    box-shadow: 0 1px 0 0 #DBDBDB;

    .btn{
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        padding: 5px 15px;
        margin: 0 7px 0 0;
        cursor: pointer;
        &.confirm{
            background: #409eff;
            color: white;
        }
    }
}
</style>
  
  