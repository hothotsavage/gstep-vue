<template>
    <van-field v-model="props.departmentName"  
        label-width="60"
        name="picker" :label="props.label" :placeholder="placeholder"
         @click="onClick"
        :required="props.required" 
        :rules="rules" 
        label-class="label"
        right-icon="arrow"/>
    <van-popup v-model:show="isShowPicker" position="bottom">
        <van-picker :columns="columns" @confirm="onConfirm" @cancel="isShowPicker = false" />
    </van-popup>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, defineEmits, watch } from "vue"
import tool from "@/tool/tool";
import { useVModel } from '@vueuse/core'
import store from '@/store'

const props = defineProps({
    departmentId: String,
    departmentName: String,
    isEditable: Boolean,
    label:String,
    required:{
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['update:departmentId','update:departmentName'])
const departmentId = useVModel(props, 'departmentId', emit)
const departmentName = useVModel(props, 'departmentName', emit)

const isDisable = ref(false)
const title = ref('')
const isShowPicker = ref(false)
const columns = ref([])
const rules = computed(() => {
    return [{
        required: props.required,
        message: `请填写${props.label}`
    }]
})
onMounted(() => {
    query()
})

const onClick = ()=>{
    isShowPicker.value = true
}

const onConfirm = ({selectedOptions}) => {
    departmentId.value = selectedOptions[0].value
    departmentName.value = selectedOptions[0].text
    isShowPicker.value = false
}

const query = async () => {
    let params = {
    }
    const { data } = await tool.ApiUtil.auth_get_corp_second_departments(params)
    columns.value = data.map(item => {
        return {
            text: item.name,
            value: item.id
        }
    })
}

const value2text = ()=>{
    let id = props.departmentId
    let list = columns.value
    let ary = list.filter(item=>item.value == id)
    if(ary.length>0)
        title.value = ary[0].text
}

watch(() => props.departmentId,
    (newVal, oldVal) => {
        value2text()
    },
    {
        immediate: true
    }
)
const placeholder = computed(() => {
    if(isDisable.value&&!props.code){
        return ''
    }else{
        return `点击选择${props.label}`
    }
})
watch(() => props.isEditable,
    (n, o) => {
        isDisable.value = !n
    }, {
    immediate: true
})
</script>

<style lang="scss" scoped>
.widget {
    text-align: center;

    .btn {
        position: fixed;
        bottom: 1rem;
        left: 0;
        right: 0;
        margin: auto auto;
        color: white;
        font-size: 14px;
        background: rgba(58, 136, 255, 1);
        padding: 8px 35px;
        width: 100px;
        text-align: center;
        display: inline-block;
        border-radius: 2px;
    }
}
:deep(.label) {
    color: #000 !important;
}

:deep(.van-field__control:disabled){
    color: #000!important;
    cursor: not-allowed;
    opacity: 1;
    -webkit-text-fill-color: #000;
}
</style>