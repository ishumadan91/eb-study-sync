var Data = {
  selected: null,
  answers_total: 0,
  score: 0,
  current_question: function() {
    var question = null
    console.log(Data.question_index)
    console.log(Data.questions)
    for(var i=0; i < Data.questions.list.length;i++) {
      if(Data.question_index === Data.questions.list[i].uuid) {
        question = Data.questions.list[i];
        break;
      }
    }
    console.log('current_question', question);
    return question;
  },
  question_index: null,
  questions: {
    list: [],
    fetch: function(){
      m.request({
          method: "GET",
          url: "/questions",
      })
      .then(function(data) {
        Data.score = parseInt(data.score);
        Data.answers_total = parseInt(data.answers_total);
        Data.questions.list = data.questions
        Data.question_index = data.question_index

      })
    },
  }
}
  
var Choice = {
  click: function(n){
    return function(){
      Data.selected = n
    }
  },
  classes: function(n){
    if (Data.selected === n){
      return 'active'
    } else {
      return ''
    }
  },
  view: function(vnode){
    var n = vnode.attrs.index
    return m('.choice',{ class: Choice.classes(n), onclick: Choice.click(n) },
      m('span.l'),
      m('span.v',Data.current_question()[`option_${n}`])
    )
  }
}
var Question = {
  view: function(vnode) {
    const currentQuestion = Data.current_question();
    if(currentQuestion === null) {
      return false
    }
    return m('.question_wrapper', [
      m('.question' ,currentQuestion.question),
      m(Choice,{index: 'a'}),
      m(Choice,{index: 'b'}),
      m(Choice,{index: 'c'}),
      m(Choice,{index: 'd'}),
    ])
  }
}
var App = {
  oninit: Data.questions.fetch,
  reset: function(){
    m.request({
        method: "PUT",
        url: "/reset",
    })
    .then(function(data) {
      Data.score = parseInt(data.score);
      Data.answers_total = parseInt(data.answers_total);
      Data.question_index = data.question_index
      Data.selected = null;
    })
  },
  submit: function(){
    m.request({
        method: "PUT",
        url: "/submit",
        body: {
          question_uuid: Data.question_index, choice: Data.selected.toUpperCase()
        },
    })
    .then(function(data) {
      console.log('data',data);
      Data.score = parseInt(data.score);
      Data.answers_total = parseInt(data.answers_total);
      Data.question_index = data.question_index
      Data.selected = null;
    })
  },
  view: function() {
    return m('main', [
      m("h1", 'Study sync'),
      m('article',
        m('h2', `Question ${Data.answers_total + 1}:`),
        m(Question),
        
        m('.submit',
          m("button", {onclick: App.submit}, 'Submit')
        )
      ),
      m(".progress",
        m(".total", 
          `Total:  ${Data.answers_total + 1} / ${Data.questions.list.length}`),
        m(".score", `Score: ${Data.score} / ${Data.questions.list.length}`),
      ),
      m('.reset',
        m("button.reset", {onclick: App.reset}, 'Reset')
      )
    ])
  }
}

m.mount(document.body, App)