<template>
  <div class="container"
       ref="container"></div>

</template>

<script>
  import Hilo from 'hilojs'
  import AssetsFectory from '~/components/game/asset'
  import StageFectory from '~/components/game/stage'
  import ExportScence from '~/components/game/exportScence'
  import SubmitButton from '~/components/game/submitButton'
  import Panel from '~/components/game/panel'
  import ResultModel from '~/components/game/resultModel'
  import ResetButton from '~/components/game/resetButton'
  export default {
    data () {
      return {
        gameMain: null,
        stage: null,
        assets: null,
        questions: {},
        isAllRight: false,
        questionsPanelCanvas: null,
        questionsResetCanvas: null,
        questionsSubmitCanvas: null,
        resultCanvas: null,
        setAlpha: 1,
        setAnswer: [],
        timer: null,
        isWaiting: false
      }
    },
    async mounted () {
      let questions
      // 获取问题
      try {
        questions = await this.$testload()
      } catch (error) {
        questions = localStorage.getItem('questionsConfig')
      }
      this.questions = JSON.parse(questions || null)
      if (!this.questions || this.questions.name !== 'matchGame') return this.$router.replace('/config')

      this.shuffle(this.questions.left.concat(this.questions.useless))

      // 预加载图片
      const Assets = AssetsFectory()
      this.assets = new Assets()
      await this.assets.load()

      // 初始化舞台
      this.gameMain = StageFectory()
      this.stage = this.gameMain.stage
      this.$refs['container'].appendChild(this.stage.canvas)
      const oCanvas = document.querySelector('canvas')

      const { bg, titleBg } = this.assets

      // 准备场景
      const exportScence = new ExportScence({
        x: 0,
        y: 0,
        questions: this.questions,
        images: { bg, titleBg },
        title: this.questions.title,
      })

      // 插入背景
      this.stage.addChild(exportScence)
      this.questionsSubmitCanvas = this.createSubmitButton()
      this.questionsPanelCanvas = this.createPanel('panel')
    },
    methods: {
      createPanel (type = 'panel') {
        const { leftBg, rightBg } = this.assets
        // 插入题目 两个板块之间的距离 300 每个背景板的长度 499 106
        const panel = new Panel({
          id: 'panel',
          x: 0,
          y: 0,
          leftBg,
          rightBg,
          questions: this.questions,
          alpha: this.setAlpha,
          type,
          stage: this.stage,
          setAnswer: this.setAnswer,
          subBtn: this.questionsSubmitCanvas
        })

        this.stage.addChild(panel)
        if (type === 'panel') {
          this.timer = setInterval(() => {
            this.questionsSubmitCanvas.visible = this.questionsPanelCanvas.setAnswer.every(item => item)
          }, 300)
        }

        return panel
      },
      createSubmitButton () {
        // 准备按钮 canvas 1920 1080 , subButton 329 96
        const subBtn = new SubmitButton({
          x: (1920 - 329) / 2,
          y: (1080 - 96) / 2 + 430,
          images: this.assets.submitButton,
          rect: [0, 0, 329, 96],
          visible: false,
          alpha: this.setAlpha,
        })

        subBtn.on(Hilo.event.POINTER_START, (e) => {
          if (this.isWaiting) return false
          this.isWaiting = true
          clearInterval(this.timer)

          setTimeout(() => {
            this.setAnswer = this.questionsPanelCanvas.setAnswer

            this.timer = setInterval(() => {
              this.questionsSubmitCanvas.visible = this.setAnswer.every(item => item)
            }, 300)

            this.isAllRight = !this.setAnswer.filter((item, index) => (item && item.questionId) !== this.questions.right[index].id).length

            if (this.isAllRight) {
              clearInterval(this.timer)
              this.createModel(subBtn)

              // 清除拖拽
              this.questionsPanelCanvas.leftContainer.children.forEach(item => item.stopDrag())
            }
            this.isWaiting = false
          }, 300)
        })
        this.stage.addChild(subBtn)

        return subBtn
      },
      createModel (subBtn) {
        const resultModel = new ResultModel({
          x: 0,
          y: 0,
          images: { rightModel: this.assets.rightModel },
          width: 1920,
          height: 1080,
          rect: [0, 0, 1920, 1080],
          visible: true,
          alpha: this.setAlpha
        })

        // 插入结果 model
        this.stage.addChild(resultModel)

        setTimeout(() => {
          this.questionsResetCanvas = this.createRestButtons()
          this.questionsSubmitCanvas.visible = false
          this.stage.removeChild(resultModel)
        }, 2000)
        return resultModel
      },
      createRestButtons () {
        // 重置按钮
        const repeatX = (1920 - 329) / 2

        const resetButtons = new ResetButton({
          x: repeatX,
          y: (1920 - 96) / 2 + 10,
          images: [this.assets.resetBtn],
          rect: [0, 0, 329, 96],
          visible: true,
          alpha: this.setAlpha
        })

        resetButtons.on(Hilo.event.POINTER_START, (e) => {

          if (this.isAllRight) return this.resetHandel()

        })
        this.stage.addChild(resetButtons)

        return resetButtons
      },
      resetHandel () {
        // 移除显示结果panel
        this.stage.removeChild(this.questionsPanelCanvas)

        this.questionsResetCanvas.visible = false

        // 重置基础信息
        this.setAnswer = []

        this.shuffle(this.questions.left.concat(this.questions.useless))

        // 重置后创建
        this.questionsPanelCanvas = this.createPanel('panel')
      },
      shuffle (arr) {
        for (var i = arr.length - 1; i >= 0; i--) {
          var randomIndex = Math.floor(Math.random() * (i + 1));
          var itemAtIndex = arr[randomIndex];
          arr[randomIndex] = arr[i];
          arr[i] = itemAtIndex;
        }
        this.questions.concat = arr
      },
    }
  }
</script>
