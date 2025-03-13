<template>
    <div class="edit-start-widget">
        <div class="field-box">
            <div class="title">标题</div>
            <el-input v-model="selectStep.title" />
        </div>
        <div class="field-box">
            <div class="title">可提交申请的候选人/部门</div>
            <div class="tags">
                <CandidateTag class="candidate" v-for="(item, i) in selectStep.candidates" :key="i" :candidate="item"
                    v-model:isShowPicker="data.isShowPicker"
                    @delete="onDeleteCandidate" />
                <div class="edit" @click="onShowPicker">修改</div>
            </div>
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
import { onMounted, reactive, defineEmits, defineProps, watch } from 'vue'
import * as vm from '@/components/editor/vm'
import CandidatePicker from './candidate_picker.vue'
import CandidateTag from './candidate_tag.vue'
import { ElButton, ElInput } from 'element-plus'
import { useVModel } from '@vueuse/core'

const props = defineProps({
    selectStep: Object,
    isRefreshChart: Boolean,
    isShow: Boolean
})
const data = reactive({
    isShowPicker:false
})

const emit = defineEmits(['update:selectStep', 'update:isRefreshChart','update:isShow'])
const selectStep = useVModel(props, 'selectStep', emit)
const isRefreshChart = useVModel(props, 'isRefreshChart', emit)
const isShow = useVModel(props, 'isShow', emit)
onMounted(() => {

})

const onCancel = () => {
    close()
}

const onConfirm = () => {
    let findStep = vm.findStep(props.selectStep.id, vm.data.template.rootStep)
    findStep.title = selectStep.value.title
    findStep.candidates = selectStep.value.candidates
    isRefreshChart.value = true

    console.log('+++ onConfirm ++++++')
    console.log(vm.data.template)
    close()
}

const close = () => {
    isShow.value = false
}

const onShowPicker = () => {
    data.isShowPicker = true
}

const onDeleteCandidate = (candidate) => {
    let idx = selectStep.value.candidates.map(e=>e.value).indexOf(candidate.value)
    selectStep.value.candidates.splice(idx, 1)
}
</script>

<style scoped>
.edit-start-widget {
    display: flex;
    flex-direction: column;

    .form {
        flex: 1;
        height: 0;
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
    .btn-row {
        margin-top: 15px;
    }
}
</style>
  
  