const app = Vue.createApp({
  data () {
    return {
      ui: 1,
      matrixLayout: true,
      i: 0,
      streak: 0,
      matrices: 0,
      msg: 'Good Luck!',
      soundOn: true,
      musicOn: false,
      music: new Audio('sounds/bg.mp3'),
      pairs: [
        {
          id: 0,
          size: [[2,2],[2,2],[2,2]],
          a: [1, 2, 3, 4],
          b: [2, -1, 5, 0],
          r: [12, -1, 26, -3],
          resultFields:['', '', '', ''],
          inputs: []
        }
      ]
    }
  },
  methods: {
    // pass 0 for first matrix and 1 for second matrix
    numberOfCells: function(id, matrix) {
      const nr = this.pairs[id].size[matrix][0] * this.pairs[id].size[matrix][1]
      return nr
    },

    generatePair: function() {

      if (this.ui < 6) {
        this.ui = 6;

      }
      this.matrixLayout = false

      const aRows = Math.floor(Math.random() * 3) + 1
      const aCols = Math.floor(Math.random() * 3) + 1

      const bRows = aCols
      const bCols = Math.floor(Math.random() * 3) + 1

      const size = [[aRows, aCols], [bRows, bCols], [aRows, bCols]]

      // just "a" is the matrix as a flat list, aM is nested for calculations
      let aM = []
      let row = 0
      let col = 0

      // Generate Matrix A
      for (row; row < aRows; row++) {
        let r = []
        for (col=0; col < aCols; col++) {
          r.push(Math.floor(Math.random() * 20) - 6)
        }
        aM.push(r)
      }

      // Generate Matrix B
      let bM = []

      for (row=0; row < bRows; row++) {
        let r = []
        for (col=0; col <bCols; col++) {
          r.push(Math.floor(Math.random() * 20) - 6)
        }
        bM.push(r)
      }

      // calculate the results

      // prefill the result matrix so we can access indices directly
      // in the same wash, make an array with the states of the result field
      let rM = []
      let resultFields = []

      for (var s=0; s < size[2][0]; s++) {
        rM[s] = []
        for (var t=0; t < size[2][1]; t++) {
          rM[s][t] = 0
          resultFields.push('')
        }
      }

      for (var i=0; i < aRows; i++) {
        for (var j=0; j < bCols; j++) {
          for (var k=0; k < bRows; k++) {
            rM[i][j] = rM[i][j] + (aM[i][k] * bM[k][j])
          }
        }
      }
      // Data Cleaning and adding pair to array

      const a = aM.flat()
      const b = bM.flat()
      const r = rM.flat()

      const pair = {
        id: this.i + 1,
        size,
        a,
        b,
        r,
        resultFields,
        inputs: []
      }

      console.log(pair)
      this.i += 1
      this.pairs.push(pair)

      document.querySelector("input").focus()

    },

    checkSpecialMessage: function() {

      // Streaks
      const milestones = [4, 8, 12, 20]
      if (milestones.includes(this.streak)) {
        this.msg = "New Milestone!"
        switch(this.streak) {
          case 4:
          var audio = new Audio('sounds/streak1.mp3')
          break
          case 8:
          var audio = new Audio('sounds/streak2.mp3')
          break
          case 12:
          var audio = new Audio('sounds/streak3.mp3')
          break
          case 20:
          var audio = new Audio('sounds/streak4.mp3')
          break

        }
        audio.volume = 0.5;
        if (this.soundOn) {
          audio.play()
        }
        return true
      }

      // Achievements TODO

      return false
    },

    newMessage: function(valence) {
      const s1 = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
      if(valence == "good") {
        if (this.checkSpecialMessage()) {
          return
        }
        switch(s1) {
          case 1:
          this.msg =  (Math.random()>0.5)? `You got ${this.streak} in a row` : `Your streak is: ${this.streak}`
          break
          case 2:
          this.msg = `You are working on exercise: ${this.matrices + 1}`
          break
          case 3:
          const positiveMessages = ['You got this', 'Wow!', 'Not bad', 'I am so proud of you <3', '<3', 'gj', 'leeets go', 'Impressive!']
          this.msg =  positiveMessages[Math.floor(Math.random() * positiveMessages.length)]
        }
      } else if (valence == "bad"){
        const negativeMessages = [':(', 'Never Give Up!', 'Awww', 'Close!', 'Unlucky', 'Happens to the best of us...', 'Better luck next time', '...not over yet']
        this.msg = negativeMessages[Math.floor(Math.random() * negativeMessages.length)]
      } else {
        this.msg = "..."
      }
    },

    checkResult: function(e, index) {

      if (parseInt(e.target.value) === this.pairs[this.i].r[index]) {
        this.streak++
        this.pairs[this.i].resultFields[index] = 'success'
        // dirty special case of that we are in the tutorial and the user gets it right for the first time
        if (index == 0 && this.ui == 4 ) {
          this.ui++
        }


        // if we have a complete correct matrix now
        if (this.pairs[this.i].resultFields.every(field => field == 'success')) {
          this.ui++
          this.matrices++
          this.generatePair()
          var audio = new Audio('sounds/matrix_complete.mp3');
          audio.volume = 0.8;
          if (this.soundOn) {
            audio.play()
          }
        } else {
          var audio = new Audio('sounds/field_complete.mp3');
          audio.volume = 1;
          if (this.soundOn) {
            audio.play()
          }
        }
        this.newMessage("good")

        // get next free number field
        // weird hack that either gets the next one or the first free one,
        // but the latter part works only for fields that are before the
        // current one
        let nextField = document.getElementById(index + 1).firstChild

        if (nextField.classList.contains('success') || nextField == document.activeElement) {
          nextField = document.querySelector("input:not(.success)")
        }

        nextField.focus()
        // incorrect if the string we put in so far does not match with the first n letters of the target string
      } else if (this.pairs[this.i].inputs[index] != this.pairs[this.i].r[index].toString().substring(0, this.pairs[this.i].inputs[index].length)) {
        this.pairs[this.i].resultFields[index] = 'incorrect'
        var audio = new Audio('sounds/nr_wrong.mp3');

        if (this.soundOn) {
          audio.play()
        }
        this.streak = 0
        this.newMessage("bad")
      } else {
        this.pairs[this.i].resultFields[index] = ''
        this.newMessage("neutral")
      }
    },

    toggleMusic: function() {
      this.musicOn = !this.musicOn
      if (this.musicOn) {
        this.music.volume = .2
        this.music.loop = true;
        this.music.play()
      } else {
        this.music.pause()
      }
    }

  },
  computed: {
    getSuccessfulFields() {
      let count = 0
      for (const el of this.pairs[this.i].resultFields) {
        if (el == 'success') {
          count++
        }
      }
      return count + .1
    }
  }




})
