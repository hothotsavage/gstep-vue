<template>
  <div class="gstep-editor-wrapper">
    <div class="chart-wrapper">
      <Toolbar v-model:isRefreshChart="data.isRefreshChart" v-model:fields="vm.data.template.fields" @cancel="onCancel" @save="onSave" />
      <Chart class="chart" ref="chartRef" v-model:isShowDrawer="data.isShowDrawer" v-model:isRefreshChart="data.isRefreshChart"
        v-model:selectStep="data.selectStep" />
    </div>
    <Drawer v-model:isShowDrawer="data.isShowDrawer">
      <EditStart v-if="data.selectStep.category == 'start'" v-model:selectStep="data.selectStep" v-model:isShow="data.isShowDrawer"
        v-model:isRefreshChart="data.isRefreshChart" />
      <EditAudit v-if="data.selectStep.category == 'audit'" v-model:selectStep="data.selectStep" v-model:isShow="data.isShowDrawer"
        v-model:isRefreshChart="data.isRefreshChart" />
      <EditNotify v-if="data.selectStep.category == 'notify'" v-model:selectStep="data.selectStep" v-model:isShow="data.isShowDrawer"
        v-model:isRefreshChart="data.isRefreshChart" />
      <EditCondition v-if="data.selectStep.category == 'condition'" v-model:selectStep="data.selectStep" v-model:isShow="data.isShowDrawer"
        v-model:isRefreshChart="data.isRefreshChart" />
    </Drawer>
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, reactive,ref, defineProps, watch, defineEmits } from 'vue'
import EditStart from './widget/edit_start.vue'
import EditAudit from './widget/edit_audit.vue'
import EditNotify from './widget/edit_notify.vue'
import EditCondition from './widget/edit_condition.vue'
import Chart from './widget/chart.vue'
import Toolbar from './widget/toolbar.vue'
import Drawer from './widget/drawer.vue'
import ApiUtil from '@/api/api'
import * as vm from '@/components/editor/vm'
import { useVModel } from '@vueuse/core'
import { nextTick } from 'vue'

const chartRef = ref(null)
const data = reactive({
  isShowDrawer:false,
  isRefreshChart:false,
  selectStep:{}
})

const props = defineProps({
  baseUrl: String,
  template: Object
})
const emit = defineEmits(['cancel', 'save', 'update:template'])
const template = useVModel(props, 'template', emit)

onBeforeMount(() => {
  ApiUtil.baseUrl = props.baseUrl
  console.log('流程图编辑器baseUrl:')
  console.log(ApiUtil.baseUrl)
})

onMounted(() => {
  nextTick(() => {
    refreshDataAndChart()
  })
})

watch(props, (newValue, oldValue) => {
    refreshDataAndChart()
}, {
  immediate: false
})

const refreshDataAndChart = async () => {
  console.log('3333333333333333333')
  console.log(chartRef.value)
  console.log(vm.data.template)
  if (!chartRef.value
    || !vm.data.template
    || !vm.data.template.id){
    return
  }
  
  console.log('4444444444444444444444')
  vm.data.template = props.template
  await chartRef.value.getTemplate()
  chartRef.value.refreshChart()
}

const onCancel = () => {
  emit('cancel')
}

const onSave = () => {
  // vm.save2db()
  console.log('+++保存+++++++++++++++++++++++++++++++')
  console.log(vm.data.template)
  // template.value = vm.data.template
  // emit('save')
}

const onCloseDrawer = () => {
  data.isShowDrawer = false
}


</script>

<style lang="scss" scoped>
.gstep-editor-wrapper {
  .chart-wrapper {
    width: 100%;
    height: 100%;

    .chart {
      height: calc(100% - 50px);
    }
  }
}
</style>
