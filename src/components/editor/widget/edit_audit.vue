<template>
    <div class="edit-audit-widget">
        <div class="field-box">
            <div class="title">标题</div>
            <el-input v-model="selectStep.title" />
        </div>
        <div class="field-box">
            <div class="title">可提交审核的候选人/部门</div>
            <div class="tags">
                <CandidateTag class="candidate" v-for="(item, i) in selectStep.candidates" :key="i" :candidate="item"
                    @deleteCandidate="onDeleteCandidate" />
                <div class="edit" @click="onShowPicker">修改</div>
            </div>
        </div>

        <div class="field-box">
            <div class="title">多人审批方式</div>
            <el-select v-model="selectStep.auditMethod" placeholder="Select">
                <el-option v-for="item in auditMethods" :key="item.value" :label="item.label" :value="item.value"
                    :disabled="item.disabled" />
            </el-select>
        </div>

        <CandidatePicker v-if="data.isShowPicker" v-model:isShowPicker="data.isShowPicker"
            v-model:candidates="selectStep.candidates" />

        <div class="btn-row">
            <el-button @click="onCancel">取消</el-button>
            <el-button type="primary" @click="onConfirm">确定</el-button>
        </div>
    </div>
</template>
  
<script setup>
import { onMounted, ref,reactive, defineEmits, defineProps, watch } from 'vue'
import * as vm from '@/components/editor/vm'
import CandidatePicker from './candidate_picker.vue'
import CandidateTag from './candidate_tag.vue'
import {ElButton,ElSelect,ElOption,ElInput} from 'element-plus'
import {useVModel} from '@vueuse/core'

const props = defineProps({
    selectStep: Object,
    isRefreshChart: Boolean,
    isShow: Boolean
})

const data=reactive({
    isShowPicker:false
})

const emit = defineEmits(['update:isShow', 'update:isRefreshChart'])
const auditMethods = [{ label: '或签', value: 'or' }, { label: '会签', value: 'and' }]
const isShow = useVModel(props, 'isShow', emit)
const isRefreshChart = useVModel(props, 'isRefreshChart', emit)
const selectStep = useVModel(props, 'selectStep', emit)


onMounted(() => {

})

const onCancel = () => {
    close()
}

const onConfirm = () => {
    let findStep = vm.findStep(props.selectStep.id, vm.data.template.rootStep)
    findStep.title = selectStep.value.title
    findStep.candidates = selectStep.value.candidates
    findStep.auditMethod = selectStep.value.auditMethod
    isRefreshChart.value = true
    close()
}

const close = () => {
    isShow.value = false
}

const onShowPicker = () => {
    data.isShowPicker = true
}

const onDeleteCandidate = (candidate) => {
    let idx=selectStep.value.candidates.indexOf(e=>e.id==candidate.id)
    selectStep.value.candidates.splice(idx, 1)
}

</script>
  
<style scoped>
.edit-audit-widget {
    display: flex;
    flex-direction: column;

    .form {
        flex: 1;
        height: 0;
    }

    .btn-row {
        margin-top: 15px;
    }
}

.field-box {
    padding: 0 0 30px 0;

    .title {
        font-size: 14px;
        font-weight: bold;
        color: #606266;
        margin-bottom: 15px;
    }

    .tags {
        display: flex;
        align-items: center;
        flex-wrap: wrap;

        .candidate {
            margin: 0 5px 5px 0;
        }

        .edit {
            font-size: 14px;
            color: #409eff;
            cursor: pointer;
            margin: 0 0 5px 5px;
        }
    }
}
</style>