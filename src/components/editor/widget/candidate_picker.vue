<template>
    <el-dialog v-model="isShowPicker" title="可见范围" width="30%" :before-close="onCancel"
        class="candidate-dialog-wrapper">

        <div class="cat-row">
            <div class="cat" v-for="(item, i) in cats" :class="{ active: i == data.catSelectIndex }" :key="i"
                @click="onSelectCat(i)">
                {{ item.title }}
            </div>
        </div>
        <div class="tree-wrapper" v-if="data.catSelectIndex == 0">
            <el-tree :props="treeNode" :load="onLoadChildren" lazy show-checkbox check-strictly="true" node-key="id"
                :default-checked-keys="data.selectNodeIds" @check-change="onSelectNode">
                <template #default="{ node, data }">
                    <span class="custom-tree-node" @click="onSelectNode">
                        <img class="icon" src="@/assets/home.png" v-if="data.category == 'department'" />
                        <img class="icon" src="@/assets/person.png" v-if="data.category == 'person'" />
                        <span class="title">{{ data.name }}</span>
                    </span>
                </template>
            </el-tree>
        </div>

        <div class="fields-wrapper" v-if="data.catSelectIndex == 1">
            <el-select v-model="data.selectField" placeholder="表单字段" style="width: 240px">
                <el-option v-for="item in vm.data.template.fields" :key="item.name" :label="item.title"
                    :value="item.name" />
            </el-select>
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="onConfirm">
                    确定
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { onMounted, ref, defineEmits, defineProps, watch } from 'vue'
import { ElDialog, ElTree, ElButton } from 'element-plus'
import * as vm from '@/components/editor/vm'
import ApiUtil from '@/api/api'
import Dialog from './dialog.vue'
import TreeNode from './tree_node.vue'
import { useVModel } from '@vueuse/core'
import { reactive } from 'vue'

const props = defineProps({
    isShowPicker: Boolean,
    candidates: Array
})


const emit = defineEmits(['update:isShowPicker', 'update:candidates'])
const isShowPicker = useVModel(props, 'isShowPicker', emit)
const candidates = useVModel(props, 'candidates', emit)

const cats = [{
    title: '组织',
    code: 'department'
}, {
    title: '字段',
    code: 'field'
}]
const data = reactive({
    catSelectIndex: 0,
    selectNodeIds: [],
    selectField: ''
})
// 定义树节点数据字段
const treeNode = {
    //标题 
    label: 'name',
    //子节点
    children: 'children',
    // 是否叶子
    isLeaf: 'isLeaf',
}

onMounted(() => {

})

const onSelectCat = (index) => {
    data.catSelectIndex = index
}

const onSelectNode = (d,
    checked,
    indeterminate) => {
    console.log(d, checked, indeterminate)
    indeterminate = false

    if (d.isSelected)
        return

    let candidate = {
        category: d.category,
        title: d.name,
        value: d.id
    }
    candidates.value.push(candidate)
}

const isSelected = (node) => {
    let idx = candidates.value.findIndex(e => {
        return e.category == node.category && e.value == node.id
    })
    return idx >= 0
}

const formatDepartments = (departments) => {
    let nodes = departments.map(e => {
        let node = e
        node.category = 'department'
        node.isLeaf = !node.hasSubDepartments && node.userCount == 0
        node.isSelected = isSelected(e)
        return node
    })

    return nodes
}

const formatUsers = (users) => {
    let nodes = users.map(e => {
        let node = e
        node.category = 'user'
        node.isLeaf = true
        node.isSelected = isSelected(e)
        return node
    })

    return nodes
}

const onLoadChildren = async (node, resolve) => {
    if (node.category == 'user')
        return

    let params = {
        parentId: node.data.id
    }
    let res = await ApiUtil.department_get_child_department(params)
    let departmentNodes = formatDepartments(res.data)

    params = {
        departmentId: node.data.id
    }
    let result = await ApiUtil.department_get_users(params)
    let userNodes = formatUsers(result.data)

    let unionNodes = departmentNodes
    unionNodes = unionNodes.concat(userNodes)

    data.selectNodeIds = unionNodes.filter(e => e.isSelected).map(item => item.id)
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    console.log(data.selectNodeIds)

    resolve(unionNodes)
}

const onConfirm = () => {
    isShowPicker.value = false
}

watch(()=>data.selectField,
    (n, o) => {
        console.log('ppppppppppppppppppppppppppppppppp')
        console.log(n, o)
        if (!n || n == o)
            return

        let ary = vm.data.template.fields.filter(e => e.name == n)
        if (ary.length < 1)
            return

        let candidate = {
            category: 'field',
            title: ary[0].title,
            value: n
        }
        candidates.value.push(candidate)
    }, {
    immediate: true
})
</script>

<style lang="scss" scoped>
.candidate-dialog-wrapper {
    .cat-row {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .cat {
            cursor: pointer;
            color: #999;
            border-bottom: 1px solid #fff;
            padding: 0 10px 5px 10px;

            &.active {
                color: #0C4C7F;
                border-bottom: 1px solid #0C4C7F;
            }
        }
    }

    .tree-wrapper {
        margin-top: 10px;

        .custom-tree-node {
            display: flex;
            align-items: center;

            .icon {
                width: 15px;
                height: 15px;
            }

            .title {
                margin-left: 5px;
                font-size: 12px;
            }
        }
    }
}
</style>