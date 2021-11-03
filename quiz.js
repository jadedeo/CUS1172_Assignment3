let totalSeconds = 0;
let userName = "";

const appState = {
    current_view : "#intro_view",
    current_question : -1,
    current_quiz: "",
    current_model : {},
    total_correct: 0,
    total_incorrect: 0
}

async function fetch_question(questionId, quizChoice){
  let api_endpoint_url = "";

  if(quizChoice == "quiz1"){
    api_endpoint_url = 'https://my-json-server.typicode.com/jadedeo/QuizServer/'
  }
  else if(quizChoice == "quiz2"){
    api_endpoint_url = 'https://my-json-server.typicode.com/jadedeo/QuizServer2/'
  }

  let api_endpoint = `${api_endpoint_url}/${quizChoice}/${questionId}`
  const response = await fetch(api_endpoint);
  const data = await response.json();

  appState.current_model = data;

  setQuestionView(appState);
  update_view(appState);

  document.getElementById("correctCount").innerHTML = appState.total_correct + appState.total_incorrect;
  if(questionId == 1){
    document.getElementById("incorrectCount").innerHTML = 0;
  }
  else{
    document.getElementById("incorrectCount").innerHTML = +(((appState.total_correct/(appState.total_correct + appState.total_incorrect))*100).toFixed(2));
  }

  return(data);
}

// START APPLICATION

document.addEventListener('DOMContentLoaded', () => {
  // Set the state
  appState.current_view =  "#intro_view";
  appState.current_model = {
    action : "quiz1",
    action2 : "quiz2"
  }
  update_view(appState);

  //EventDelegation - handle all events of the widget
  document.querySelector("#widget_view").onclick = (e) => {
      handle_widget_event(e)
  }
});

/**
 * TIMER STUFF
 * **/
let minutesLabel  = "";
let secondsLabel = "";
let timer;

function setTime() {
  ++totalSeconds;
  secondsLabel.innerHTML = pad(totalSeconds % 60);
  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

/**
 * FEEDBACK VIEW STUFF
 * **/
function setFeedbackView(isCorrect) {
  //console.log("type of feedback:", isCorrect);
  if (isCorrect==true){
    appState.current_view = "#feedback_view_positive";
  } else  {
    appState.current_view = "#feedback_view_negative";
  }    
}

function setExplanationView(){
  appState.current_view = "#explanation_view";
}


/**
handle all events in question widget
**/
function handle_widget_event(e) {
  if (appState.current_view == "#intro_view") {
    userName = document.getElementById("userName").value;
    if(userName == "") {
      userName = "Anonymous";
    }

    if (e.target.dataset.action == "quiz1") {
      timer = setInterval(setTime, 1000);
      minutesLabel = document.getElementById("minutes");
      secondsLabel = document.getElementById("seconds");

      console.log("QUIZ1");
      appState.current_quiz = "quiz1";
      appState.current_question = 0;
      fetch_question(appState.current_question+1, appState.current_quiz);
    }
    else if (e.target.dataset.action == "quiz2") {
      timer = setInterval(setTime, 1000);
      minutesLabel = document.getElementById("minutes");
      secondsLabel = document.getElementById("seconds");

      console.log("QUIZ2");
      appState.current_quiz = "quiz2";
      appState.current_question = 0;
      fetch_question(appState.current_question+1, appState.current_quiz);
    }
  }
  //Handle MC answer event
  if (appState.current_view == "#question_view_multiple_choice") {
    console.log("MC TYPE");

    if (e.target.dataset.action == "submit") {

      let choices = document.getElementsByName("choice");
      let user_response;
      for(let i = 0; i < choices.length; i++){
        if(choices[i].checked){
          user_response = choices[i].value;
        }
      }
    
      isCorrect = check_user_response(user_response, appState.current_model);

      if(isCorrect){
        console.log("CORRECT");
        appState.total_correct ++;
      }
      else{
        console.log("INCORRECT");
        appState.total_incorrect ++;
      }

      setFeedbackView(isCorrect);
      update_feedbackView(appState);

      new Promise(function(resolve, reject) {
        setTimeout(resolve, 1000);
      }).then(function() {
        if(!isCorrect){
          setExplanationView();
          update_explanationView(appState);
        }
        updateQuestion(appState);
        setQuestionView(appState);
        update_view(appState);
      });
    }
  }

  //Handle the checkbox answer event
  if (appState.current_view == "#question_view_checkbox") {
    console.log("CHECKBOX TYPE");
     if (e.target.dataset.action == "submit") {
       var checkboxes = document.getElementsByName("box");
       var checkboxesChecked = [];
       // loop over them all
       for (var i=0; i<checkboxes.length; i++) {
         // And stick the checked ones onto an array...
         if (checkboxes[i].checked) {
           checkboxesChecked.push(checkboxes[i].value);
           //console.log("Checked: " + checkboxes[i].value);
         }
       }
       //console.log(checkboxesChecked);
       //console.log(appState.current_model.correctAnswer);
       isCorrect = check_user_response(checkboxesChecked, appState.current_model);
       if(isCorrect){
         console.log("CORRECT");
         appState.total_correct ++;
         //alert("YAY!");
       }
       else{
         console.log("INCORRECT");
         appState.total_incorrect ++;
         //alert("BOOOOOO!");
       }

       setFeedbackView(isCorrect);
       update_feedbackView(appState);

       new Promise(function(resolve, reject) {
         setTimeout(resolve, 1000);
       }).then(function() {
       updateQuestion(appState);
       setQuestionView(appState);
       update_view(appState);
       });

     }
  }

  // Handle the T/F answer event.
  if (appState.current_view == "#question_view_true_false") {
    console.log("T/F TYPE");
    if (e.target.dataset.action == "answer") {
       // Controller - implement logic.
       isCorrect = check_user_response(e.target.dataset.answer, appState.current_model);

       if(isCorrect){
         console.log("CORRECT");
         appState.total_correct ++;
         //alert("YAY!");
       }
       else{
         console.log("INCORRECT");
         appState.total_incorrect ++;
         //alert("BOOOOOO!");

       }

       setFeedbackView(isCorrect);
       update_feedbackView(appState);

       new Promise(function(resolve, reject) {
         setTimeout(resolve, 1000);
       }).then(function() {
       updateQuestion(appState);
       setQuestionView(appState);
       update_view(appState);
       });

     }
  }

  // Handle answer event for text questions.
  if (appState.current_view == "#question_view_text_input") {
      console.log("INPUT TYPE");
      if (e.target.dataset.action == "submit") {

        user_response = document.querySelector(`#${appState.current_model.answerFieldId}`).value;
        //console.log("USER RESPONSE: " + user_response);
        isCorrect = check_user_response(user_response, appState.current_model);

        if(isCorrect){
          console.log("CORRECT");
          appState.total_correct ++;
          //alert("YAY!");
        }
        else{
          console.log("INCORRECT");
          appState.total_incorrect ++;
          //alert("BOOOOOO!");

        }

        setFeedbackView(isCorrect);
        update_feedbackView(appState);

        new Promise(function(resolve, reject) {
          setTimeout(resolve, 1000);
        }).then(function() {
        updateQuestion(appState);
        setQuestionView(appState);
        update_view(appState);
        });
      }
  }

  // Handle answer event for multi input text questions.
  if (appState.current_view == "#question_view_multi_text_input") {
    console.log("MULTI INPUT TYPE");
    if (e.target.dataset.action == "submit") {

      user_response1 = document.querySelector(`#${appState.current_model.answerFieldId1}`).value;
      user_response2 = document.querySelector(`#${appState.current_model.answerFieldId2}`).value;
      //console.log("USER RESPONSE: " + user_response);

      let textAnswers = [];
      textAnswers.push(user_response1);
      textAnswers.push(user_response2);

      //console.log(textAnswers);
      isCorrect = check_user_response(textAnswers, appState.current_model);

      if(isCorrect){
        console.log("CORRECT");
        appState.total_correct ++;
        //alert("YAY!");
      }
      else{
        console.log("INCORRECT");
        appState.total_incorrect ++;
        //alert("BOOOOOO!");

      }

      setFeedbackView(isCorrect);
      update_feedbackView(appState);
      
      new Promise(function(resolve, reject) {
        setTimeout(resolve, 1000);
      }).then(function() {
      updateQuestion(appState);
      setQuestionView(appState);
      update_view(appState);
      });
    }
 }

  // Handle end.
  if (appState.current_view == "#end_view") {
        clearInterval(timer);
        //edit end message
        let finalScore = +(((appState.total_correct/(appState.total_incorrect + appState.total_correct)) * 100).toFixed(2));
        console.log("SCORE: " + finalScore);
        if(finalScore >= 80){
          document.getElementById("endMessage").innerHTML = "Final Score: " + finalScore + "%<br>Congrats, " + name + " - you passed!";

        }
        else{
          document.getElementById("endMessage").innerHTML = "Final Score: " + finalScore + "%<br>Sorry, " + name + " - you failed.";
        }

        if (e.target.dataset.action == "main_page") {
          totalSeconds = 0;
          secondsLabel.innerHTML = pad(0);
          minutesLabel.innerHTML = pad(0);

          appState.current_view =  "#intro_view";
          appState.current_question = -1,
          appState.current_quiz = "",
          appState.current_model = {},
          appState.total_correct = 0,
          appState.total_incorrect = 0
          appState.current_model = {
            action : "quiz1",
            action2: "quiz2"
          }
          update_view(appState);
        }
        else if (e.target.dataset.action == "retake_quiz") {
          totalSeconds = 0;
          secondsLabel.innerHTML = pad(0);
          minutesLabel.innerHTML = pad(0);

          timer = setInterval(setTime, 1000);

          console.log(appState.current_quiz);
          appState.current_question = 0,
          appState.total_correct = 0,
          appState.total_incorrect = 0
          fetch_question(appState.current_question + 1,appState.current_quiz);
        }
  }
}

function check_user_response(user_answer, model) {
  if(appState.current_model.questionType == "checkbox" || appState.current_model.questionType == "multi_text_input") {
    //console.log("CHECKBOX Q");
    if (JSON.stringify(user_answer) === JSON.stringify(model.correctAnswer)) {
      return true;
    }
  }
  else {
    //console.log("NON CHECKBOX Q");
    if (user_answer == model.correctAnswer) {
    return true;
    }
  }
  return false;
}

function updateQuestion(appState) {
    if (appState.current_question < 19) {
      appState.current_question = appState.current_question + 1;
      fetch_question(appState.current_question+1, appState.current_quiz);
    }
    else {
      appState.current_question = -2;
      appState.current_model = {};
    }
}

function setQuestionView(appState) {

  if (appState.current_question == -2) {
    appState.current_view  = "#end_view";
    return;
  }

  if (appState.current_model.questionType == "true_false") {
    appState.current_view = "#question_view_true_false";
  }
  else if (appState.current_model.questionType == "text_input") {
    appState.current_view = "#question_view_text_input";
  }
  else if (appState.current_model.questionType == "multiple_choice") {
    appState.current_view = "#question_view_multiple_choice";
  }
  else if (appState.current_model.questionType == "checkbox") {
    appState.current_view = "#question_view_checkbox";
  }
  else if (appState.current_model.questionType == "multi_text_input") {
    appState.current_view = "#question_view_multi_text_input";
  }
}

function update_view(appState) {
  const html_element = render_widget(appState.current_model, appState.current_view)
  document.querySelector("#widget_view").innerHTML = html_element;
}

function update_feedbackView(appState) {
  const html_element = render_widget(appState.current_model, appState.current_view)
  document.querySelector("#widget_view").innerHTML = html_element;
}

function update_explanationView(appState) {
  console.log("update_explanationView called.");
  console.log(appState.current_view);
  const html_element = render_widget(appState.current_model, appState.current_view)
  console.log(html_element);
  document.querySelector("#widget_view").innerHTML = html_element;
}

const render_widget = (model,view) => {
  // Get the template HTML
  template_source = document.querySelector(view).innerHTML
  // Handlebars compiles the above source into a template
  var template = Handlebars.compile(template_source);
  // apply the model to the template.
  var html_widget_element = template({...model,...appState})

  return html_widget_element
}

/*
const render_widget = (model,view) => {

  // Get the template HTML
  template_source = document.querySelector(view).innerHTML
  console.log(template_source);
  // Handlebars compiles the above source into a template
  var template = Handlebars.compile(template_source);
  // apply the model to the template.
  var html_widget_element = template({...model,...appState})

  return html_widget_element
}
*/
