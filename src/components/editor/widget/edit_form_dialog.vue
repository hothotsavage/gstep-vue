<template>
    <el-dialog v-model="isShow" title="编辑" :close-on-click-modal="false" width="1000px">
        <el-form >
            <el-form-item label="表单" label-width="140px">
                <el-button type="primary" @click="onInsert">
                    <span style="vertical-align: middle"> 新增 </span>
                </el-button>
                <el-table class="record-table" :data="fields" border highlight-current-row>
                    <el-table-column prop="title" label="字段标题" width="180" />
                    <el-table-column prop="name" label="字段名" width="300" />

                    <el-table-column fixed="right" label="操作" align="center" width="180px">
                        <template #default="scope">
                            <el-button size="mini" type="sucess" @click="onEdit(scope.$index)">编辑</el-button>
                            <el-button size="mini" type="danger" @click="onDelete(scope.$index)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form-item>

            <el-form-item label-width="140px">
                <el-button type="primary" @click="onSubmit">确定</el-button>
                <el-button @click="onClose">取消</el-button>
            </el-form-item>
        </el-form>

        <EditFieldDialog v-if="data.isShowFieldEditDialog" v-model:isShow="data.isShowFieldEditDialog"
            :record="data.currentField" />
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, defineProps, onMounted, defineEmits, watch } from 'vue'
import { useVModel } from '@vueuse/core'
import EditFieldDialog from './edit_field_dialog.vue'

const props = defineProps({
    fields: Array,
    isShow: Boolean,
})

const emit = defineEmits(['update:record', 'update:isShow'])
const fields = useVModel(props, 'fields', emit)
const isShow = useVModel(props, 'isShow', emit)
const data = reactive({
    currentField: {},
    isShowFieldEditDialog: false
})

onMounted(() => {

})

const onClose = () => {
    isShow.value = false
}

const onSubmit = () => {
    isShow.value = false
}

const onInsert = () => {
    data.currentField = {
        title: '',
        name: ''
    }
    fields.value.push(data.currentField)
    data.isShowFieldEditDialog = true
}

const onEdit = (index) => {
    data.currentField = fields.value[index]
    data.isShowFieldEditDialog = true
}

const onDelete = async (index) => {
    fields.value.splice(index, 1)
}

watch(() => data.currentField,
    (n, o) => {
        console.log('+++ watch +++')
        console.log(data.currentField)
    })
</script>

<style lang="scss" scoped>
.edit-dialog-widget {
    width: 100%;
    height: 100%;
}
</style>