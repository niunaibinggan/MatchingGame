import Hilo from 'hilojs'
import Text from './text'
export default class ResultPanel extends Hilo.Container {
  constructor(properties) {
    super(properties)

    this.leftQuestions = properties.questions.concat

    this.rightQuestions = properties.questions.right

    // this.stage = properties.stage

    this.creatContainer()

    this.initPanel(properties)
  }

  leftQuestions = null

  leftContainer = null
  rightContainer = null
  rectRight = [0, 0, 471, 87]
  rectLeft = [0, 0, 356, 86]

  creatContainer () {
    this.leftContainer = new Hilo.Container({
      x: 60,
      y: 170 - this.leftQuestions.length * 10,
    }).addTo(this)

    this.rightContainer = new Hilo.Container({
      x: 60,
      y: 60,
    }).addTo(this)
  }

  initPanel (properties) {
    this.leftQuestions.forEach((item, index) => {
      const questionsItem = new Hilo.Container({
        id: item.id,
        x: 0,
        y: 0 + index * 90
      }).addTo(this.leftContainer)

      new Hilo.Bitmap({
        x: 0,
        y: 0,
        rect: this.rectLeft,
        image: properties.leftBg
      }).addTo(questionsItem)
    })
  }
}
