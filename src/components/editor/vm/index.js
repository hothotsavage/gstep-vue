import G6 from '@antv/g6'
import ApiUtil from '@/api/api'
import { fittingString } from '@/util/str_util'
import { reactive } from "vue";

export const END_STEP_ID = 9999
export const nodeW = 130
export const nodeH = 50
export const spaceH = 30
export const addR = 10
export const endH = 30
export const branchW = 80
export const branchH = 30
export const addStepH = 30
export const addConditionH = 30
export const BG_PRIMARY_COLOR = "#2196f3ff"
export const BG_END_COLOR = "#aaa"
export const BG_HOVER_COLOR = "#2196f3aa"
export const FONT_PRIMARY_COLOR = "#333333"
export const FONT_HOVER_COLOR = "#999999"

export const data = reactive({
    template: {
        id: 1,
        templateId: 1,
        title: ""
    },
    chartData: {
        nodes: [],
        edges: []
    }
})

export const END_STEP = {
    "id": END_STEP_ID,
    "title": "结束",
    "category": "end",
    "candidates": [],
    "form": {},
    "branchSteps": [],
    "nextStep": {}
}

// 查询入库流程图数据
export const getData = async () => {
    console.log('5555555555555555555555555')
    console.log(data.template)
    const params = {
        id: data.template.id
    }
    let res = await ApiUtil.template_detail(params)
    data.template = res.data

    console.log('666666666666666666666')
    console.log(data.template)
}

// 添加分支步骤
export const newBranchStep = (parentStep) => {
    //查询步骤链路的最后一步
    let finalStep = findFinalStep(parentStep)
    let branchNextStep = END_STEP
    let oldNextStep = parentStep.nextStep
    //分支步骤链中插入新分支时
    //新分支的下一步为空
    if (finalStep.id != END_STEP_ID) {
        branchNextStep = {}
    }
    //主干分支步骤链路中插入新分支时
    //将原主干链路(除结束步骤外)挂接到新分支的默认条件步骤下
    //新分支的下一步为结束步骤
    else {
        oldNextStep = copyNextStepWithoutEndStep(parentStep)
    }

    // 新建分支步骤
    let branchStepId = newStepId()
    let branchStep = {
        "id": branchStepId,
        "title": "" + branchStepId,
        "category": "branch",
        "candidates": [],
        "form": {},
        "branchSteps": [],
        "nextStep": branchNextStep
    }
    parentStep.nextStep = branchStep

    //新分支的条件1步骤
    let firstConditionStep = {
        "id": branchStepId + 1,
        "title": "条件1",
        "category": "condition",
        "candidates": [],
        "form": {},
        "branchSteps": [],
        "nextStep": {}
    }
    branchStep.branchSteps = []
    branchStep.branchSteps.push(firstConditionStep)

    //新分支的默认条件步骤
    let defaultConditionStep = {
        "id": branchStepId + 2,
        "title": '默认条件',
        "category": "condition",
        "candidates": [],
        "form": {},
        "branchSteps": [],
        "nextStep": oldNextStep
    }
    branchStep.branchSteps.push(defaultConditionStep)
}

// 添加分支步骤
export const newAuditStep = (parentStep) => {
    let auditStep = {
        "id": newStepId(),
        "title": "审核",
        "category": "audit",
        "candidates": [],
        "auditMethod": 'or',
        "form": {},
        "branchSteps": [],
        "nextStep": parentStep.nextStep
    }
    parentStep.nextStep = auditStep
}

// 添加分支步骤
export const newNotifyStep = (parentStep) => {
    let notifyStep = {
        "id": newStepId(),
        "title": "抄送",
        "category": "notify",
        "candidates": [],
        "form": {},
        "branchSteps": [],
        "nextStep": parentStep.nextStep
    }
    parentStep.nextStep = notifyStep
}

// 添加条件步骤
export const addConditionStep = (parentStep) => {
    let title = '条件' + parentStep.branchSteps.length

    let conditionStep = {
        "id": newStepId(),
        "title": title,
        "category": "condition",
        "candidates": [],
        "form": {},
        "branchSteps": [],
        "nextStep": {}
    }
    parentStep.branchSteps.splice(parentStep.branchSteps.length - 1, 0, conditionStep)
    refreshChartData()
}

//删除步骤的子步骤中的指定步骤
export const deleteChildStepById = (stepId, startStep) => {
    if (null == startStep)
        return

    if (!startStep.id)
        return

    //删除
    if (startStep.nextStep.id == stepId) {
        startStep.nextStep = startStep.nextStep.nextStep
    }

    //若为条件节点,删除条件节点及其子节点
    let findIndex = -1
    for (var i = 0; i < startStep.branchSteps.length; i++) {
        if (startStep.branchSteps[i].id == stepId) {
            findIndex = i
            break
        }
    }
    if (findIndex >= 0)
        startStep.branchSteps.splice(findIndex, 1)

    //只剩一个默认条件节点时,删除默认条件节点及其父分支节点
    if (startStep.category == 'branch' && startStep.branchSteps.length <= 1) {
        let parentStep = findParentStep(startStep)
        startStep.branchSteps = []
        parentStep.nextStep = startStep.nextStep
    }

    //递归删除步骤链路
    if (startStep.nextStep.id)
        deleteChildStepById(stepId, startStep.nextStep)

    //递归删除分支步骤
    for (var i = 0; i < startStep.branchSteps.length; i++) {
        deleteChildStepById(stepId, startStep.branchSteps[i])
    }
}

//拷贝流程步骤链
//主干流程排除掉最后结束步骤
export const copyNextStepWithoutEndStep = (step) => {
    let oldNextStep = JSON.parse(JSON.stringify(step.nextStep))
    if (END_STEP_ID == oldNextStep.id
        || !step.id) {
        return {}
    }

    deleteChildStepById(END_STEP_ID, oldNextStep)
    return oldNextStep
}

//刷新图表节点,连线列表
export const refreshChartData = () => {
    console.log('+++ 流程步骤转流程图数据 ++++++++++')
    console.log('>>>> 根流程步骤 >>>>>>>>>>>>>>>>>>')
    console.log(data.template.rootStep)
    data.chartData = {
        nodes: [],
        edges: []
    }
    formatStep(data.template.rootStep)
    step2chartData(data.template.rootStep, null)
    console.log('<<< 流程图数据 <<<<<<<<<<<<<<<<<<<<')
    console.log(data.chartData)
}

// 创建新流程模板
export const newTemplate = () => {
    if (!data.template.rootStep || !data.template.rootStep.id) {
        data.template.rootStep = {
            "id": 1,
            "title": "申请",
            "category": "start",
            "form": {},
            "candidates": [],
            "branchSteps": [],
            "nextStep": END_STEP
        }
    }

    formatStep(data.template.rootStep)
    data.chartData = {
        nodes: [],
        edges: []
    }
}

//节点类型的高度
export const getNodeHeight = (node) => {
    if (node.type == 'start')
        return nodeH
    else if (node.type == 'end')
        return endH
    else if (node.type == 'add-child')
        return addR * 2
    else if (node.type == 'add-condition')
        return conditionH
    else
        return nodeH
}

// 流程步骤转节点数据
export const step2chartData = (step, prevNode) => {
    if (!step || !step.id)
        return prevNode

    // 添加新的节点
    let lastNode = null
    let stepNode = {}
    if (step.category == 'start') {
        stepNode = {
            id: step.id + '', // String，该节点存在则必须，节点的唯一标识
            step: step,
            type: 'start'
        }
    }
    else if (step.category == 'end') {
        stepNode = {
            id: step.id + '', // String，该节点存在则必须，节点的唯一标识
            type: 'end',
            step: step
        }
    } else if (step.category == 'condition') {
        stepNode = {
            id: step.id + '', // String，该节点存在则必须，节点的唯一标识
            type: 'condition',
            step: step
        }
    } else if (step.category == 'audit') {
        stepNode = {
            id: step.id + '', // String，该节点存在则必须，节点的唯一标识
            type: 'audit',
            step: step
        }
    } else if (step.category == 'notify') {
        stepNode = {
            id: step.id + '', // String，该节点存在则必须，节点的唯一标识
            type: 'notify',
            step: step
        }
    } else if (step.category == 'branch') {
        stepNode = {
            id: step.id + '', // String，该节点存在则必须，节点的唯一标识
            type: 'branch',
            step: step
        }
    }
    data.chartData.nodes.push(stepNode)
    lastNode = stepNode

    // 与上一个节点的连线
    if (prevNode) {
        let parentEdge = {
            source: prevNode.id, // String，必须，起始点 id
            target: stepNode.id, // String，必须，目标点 id
            label: '', // 边的文本
            style: {
                endArrow: {
                    path: 'M 0,0 L 8,4 L 8,-4 Z',
                    fill: "#C2C8D5"
                },
            }
        }
        data.chartData.edges.push(parentEdge)
    }

    //非终点/分支节点,增加节点与加号连线
    if (step.category != 'end' && step.category != 'branch') {
        //加号节点
        let addStepNode = {
            id: step.id + '_add_step', // String，该节点存在则必须，节点的唯一标识
            step: step,
            type: 'add-child'
        }
        data.chartData.nodes.push(addStepNode)
        lastNode = addStepNode
        //步骤与加号连线
        let addStepEdge = {
            source: stepNode.id, // String，必须，起始点 id
            target: addStepNode.id, // String，必须，目标点 id
            label: '', // 边的文本
        }
        data.chartData.edges.push(addStepEdge)
    }

    //生成分支节点树
    if (step.category == 'branch') {
        let branchAddNodes = []
        for (var i = 0; i < step.branchSteps.length; i++) {
            let branchLastNode = step2chartData(step.branchSteps[i], lastNode)
            branchAddNodes.push(branchLastNode)
        }

        //汇聚加号节点
        let addReduceNode = {
            id: step.id + '_add_reduce',
            x: 0, // Number，可选，节点位置的 x 值
            y: 0, // Number，可选，节点位置的 y 值
            step: step,
            type: 'add-child'
        }
        data.chartData.nodes.push(addReduceNode)
        lastNode = addReduceNode

        for (var j = 0; j < branchAddNodes.length; j++) {
            let addReduceEdge = {
                source: branchAddNodes[j].id, // String，必须，起始点 id
                target: addReduceNode.id, // String，必须，目标点 id
                label: '', // 边的文本
            }
            data.chartData.edges.push(addReduceEdge)
        }
    }

    if (step.nextStep && step.nextStep.id)
        lastNode = step2chartData(step.nextStep, lastNode)

    return lastNode
}

// 格式化流程步骤数据
export const formatStep = (step) => {
    if (!step)
        return

    // 候选人文案
    if (step.category == 'start'
        || step.category == 'audit'
        || step.category == 'notify') {
        let txt = ''
        if (step.candidates && step.candidates.length > 0)
            txt = step.candidates.map(e => e.title).join(',')
        if (!txt.trim()) {
            if (step.category == 'start')
                txt = '请选择申请人'
            else if (step.category == 'audit')
                txt = '请选择审核人'
            else if (step.category == 'notify')
                txt = '请选择抄送人'
        }
        // 文案最宽120px,字号12px
        step.detailText = fittingString(txt, 120, 12)
    }
    else if (step.category == 'condition') {
        if (step.title == '默认条件') {
            step.detailText = '未满足其他条件'
        } else {
            step.detailText = step.expression ? step.expression.trim() : ''
            if (!step.detailText)
                step.detailText = '请选择条件'
        }
        step.detailText = fittingString(step.detailText, 120, 12)
    }

    if (step.nextStep && step.nextStep.id)
        formatStep(step.nextStep)

    if (step.category == 'branch') {
        step.branchSteps.forEach(e => {
            formatStep(e)
        })
    }
}

//生成下一个步骤id
export const newStepId = () => {
    let maxId = getMaxStepId(data.template.rootStep)
    return maxId + 1
}

//查询最大流程id
export const getMaxStepId = (rootStep) => {
    if (!rootStep || !rootStep.id)
        return 0

    let nextMaxId = rootStep.id
    rootStep.branchSteps.forEach(element => {
        if (element.category != 'end') {
            let childMaxId = getMaxStepId(element)
            nextMaxId = Math.max(nextMaxId, childMaxId)
        }
    })

    if (rootStep.nextStep
        && rootStep.nextStep.category != 'end'
        && rootStep.nextStep.id) {
        nextMaxId = Math.max(nextMaxId, rootStep.nextStep.id)
        nextMaxId = Math.max(nextMaxId, getMaxStepId(rootStep.nextStep))
    }
    return nextMaxId
}

//查找步骤
export const findStep = (stepId, startStep) => {
    if (startStep == null || startStep.id < 1 || stepId < 1)
        return null

    if (startStep.id == stepId)
        return startStep

    if (startStep.nextStep.id == stepId)
        return startStep.nextStep

    for (var i = 0; i < startStep.branchSteps.length; i++) {
        if (startStep.branchSteps[i].id == stepId)
            return startStep.branchSteps[i]
    }

    for (var i = 0; i < startStep.branchSteps.length; i++) {
        let step = findStep(stepId, startStep.branchSteps[i])
        if (null != step)
            return step
    }

    if (startStep.nextStep.id) {
        let step = findStep(stepId, startStep.nextStep)
        if (null != step)
            return step
    }

    return null
}

//查找父步骤
export const findParentStep = (targetStep, startStep) => {
    if (startStep == null)
        startStep = data.template.rootStep

    if (startStep.nextStep.id == targetStep.id)
        return startStep

    for (var i = 0; i < startStep.branchSteps.length; i++) {
        if (startStep.branchSteps[i].id == targetStep.id)
            return startStep
    }

    for (var i = 0; i < startStep.branchSteps.length; i++) {
        let step = findParentStep(targetStep, startStep.branchSteps[i])
        if (null != step)
            return step
    }

    if (startStep.nextStep.id) {
        let step = findParentStep(targetStep, startStep.nextStep)
        if (null != step)
            return step
    }

    return null
}

//查找步骤链的最后一个步骤
export const findFinalStep = (startStep) => {
    if (startStep == null)
        startStep = data.template.rootStep

    if (!startStep.nextStep || !startStep.nextStep.id)
        return startStep

    let nextStep = findFinalStep(startStep.nextStep)

    return nextStep
}

//查找分支最后一个步骤列表
export const findBranchLeafSteps = (startStep) => {
    for (var i = 0; i < startStep.branchSteps.length; i++) {
        if (startStep.branchSteps[i].id == targetStep.id)
            return startStep
    }

    for (var i = 0; i < startStep.branchSteps.length; i++) {
        let step = findParentStep(targetStep, startStep.branchSteps[i])
        if (null != step)
            return step
    }

    return []
}

// 查询步骤的兄弟节点个数
export const getSiblingCount = (step) => {
    let parentStep = findParentStep(step, data.template.rootStep)
    if (null == parentStep)
        return 0

    return parentStep.branchSteps.length
}

//查询步骤在兄弟节点中的排名
export const getSiblingIndex = (step) => {
    let parentStep = findParentStep(step, data.template.rootStep)
    if (null == parentStep)
        return 0

    for (var i = 0; i < parentStep.branchSteps.length; i++) {
        if (parentStep.branchSteps[i].id == step.id)
            return i
    }

    return 0
}

export const save2db = async () => {
    let params = data.template
    let res = await ApiUtil.template_save(params)

    params = {
        id: res.data
    }
    let result = await ApiUtil.template_detail(params)
    data.template = result.data
}