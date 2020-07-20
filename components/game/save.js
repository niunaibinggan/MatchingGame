import AssetsFectory from '~/components/game/asset'
import StageFectory from '~/components/game/stage'
import ExportScence from '~/components/game/exportScence'
import Panel from '~/components/game/panel'
import SubmitButton from '~/components/game/submitButton'

export default async function init (questions) {
  // const  // 接入hilo动画引擎
  const Assets = AssetsFectory()

  const assets = new Assets()
  await assets.load()

  // 初始化舞台
  const gameMain = StageFectory()

  const { stage, ticker } = gameMain

  const { bg, titleBg } = assets

  // 准备场景
  const exportScence = new ExportScence({
    x: 0,
    y: 0,
    questions,
    images: { bg, titleBg },
    title: questions.title,
  })

  stage.addChild(exportScence)

  const subBtn = new SubmitButton({
    x: (1920 - 329) / 2,
    y: (1080 - 96) / 2 + 430,
    images: assets.submitButton,
    rect: [0, 0, 329, 96],
    visible: true,
  })

  stage.addChild(subBtn)

  function shuffle (arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
      var randomIndex = Math.floor(Math.random() * (i + 1));
      var itemAtIndex = arr[randomIndex];
      arr[randomIndex] = arr[i];
      arr[i] = itemAtIndex;
    }
    return arr
  }

  let q = questions

  q.concat = shuffle(questions.left.concat(questions.useless))

  const { leftBg, rightBg } = assets
  // 插入题目 两个板块之间的距离 300 每个背景板的长度 499 106
  const panel = new Panel({
    id: 'panel',
    x: 0,
    y: 0,
    leftBg,
    rightBg,
    questions: questions,
    type: 'panel',
    stage: stage,
    subBtn,
  })
  stage.addChild(panel)

  return new Promise((re) => {
    ticker.nextTick(() => {
      re(stage.canvas.toDataURL('image/png'))
    })
  })
}
