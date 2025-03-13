<template>
    <div class="edit-notify-widget">
        <div class="field-box">
            <div class="title">标题</div>
            <el-input v-model="selectStep.title" />
        </div>
        <div class="field-box">
            <div class="title">可收到抄送的候选人/部门</div>
            <div class="tags">
                <CandidateTag class="candidate" v-for="(item, i) in selectStep.candidates" :key="i" :candidate="item"
                    @delete="onDeleteCandidate" />
                <div class="edit" @click="onShowPicker">修改</div>
            </div>
        </div>

        <CandidatePicker v-if="isShowPicker" v-model:isShowPicker="isShowPicker" v-model:candidates="selectStep.candidates" />

        <div class="btn-row">
            <el-button @click="onCancel">取消</el-button>
            <el-button type="primary" @click="onConfirm">确定</el-button>
        </div>
    </div>
</template>
  
<script setup>
import { onMounted, ref, defineEmits, defineProps, watch } from 'vue'
import * as vm from '@/components/editor/vm'
import CandidatePicker from './candidate_picker.vue'
import CandidateTag from './candidate_tag.vue'
import ApiUtil from '@/api/api'
import {ElButton,ElInput} from 'element-plus'
import { reactive } from 'vue'

const props = defineProps({
    selectStep: Object,
    isRefreshChart: Boolean,
    isShow:Boolean
})

const emit = defineEmits(['update:isShow', 'update:isRefreshChart', 'update:selectStep'])
const selectStep = useVModel(props,'selectStep', emit)
const isRefreshChart = useVModel(props,'isRefreshChart', emit)
const isShow = useVModel(props,'isShow', emit)
const data = reactive({
    isShowPicker:false
})

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
    close()
}

const close = () => {
    isShow.value = false
}

const onShowPicker = () => {
    data.isShowPicker = true
}

const onDeleteCandidate = (idx) => {
    selectStep.value.candidates = selectStep.value.candidates.slice(idx, 1)
}
</script>
  
<style scoped>
.edit-notify-widget {
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
  
  