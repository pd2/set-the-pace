const reference = document.getElementById("reference");
const quote = document.getElementById("quote");
const check = document.getElementById("check");
const input = document.getElementById("typedValue");
const start = document.getElementById("start");
const info = document.getElementById("info");
const message = document.getElementById("message");
const meaning = document.getElementById("meaning");
const image = document.getElementById("image");
const dropZone = document.getElementById("dropZone");
const sec_dropZone = document.getElementById("sec_dropZone");
const sec_reference = document.getElementById("sec_reference");
const sec_quote = document.getElementById("sec_quote");
const sec_meaning = document.getElementById("sec_meaning");
const words = document.getElementById("words");
const settings = document.getElementById("settings");
const share =  document.getElementById("share");
const tooltip = document.getElementById("myTooltip");

let ways;

async function get_ways_to_reduce_footprint() {
  
  let responses = await fetch('footprint.txt');
  
  ways = await responses.json();
  
}

get_ways_to_reduce_footprint();

const draggableElems = document.querySelectorAll(".draggable");
const droppableElems = document.querySelectorAll(".droppable");

draggableElems.forEach((elem) => {
  elem.addEventListener("dragstart", dragStart);
  // elem.addEventListener("drag", drag);
  // elem.addEventListener("dragend", dragEnd);
});

droppableElems.forEach((elem) => {
  elem.addEventListener("dragenter", dragEnter);
  elem.addEventListener("dragover", dragOver);
  elem.addEventListener("dragleave", dragLeave);
 // elem.addEventListener("drop", drop);
});

function dragStart(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function dragEnter(event) {
  event.target.classList.add("droppable-hover");
}

function dragOver(event) {
  event.preventDefault();
}

function dragLeave(event) {
  event.target.classList.remove("droppable-hover");
}

function allowDrop(event) {
  event.preventDefault();
  if (event.currentTarget.querySelectorAll(".draggable").length > 1)
        return false;
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
  event.preventDefault();
  if (event.currentTarget.querySelectorAll('.draggable').length > 0)
  {
    let id_incoming = event.dataTransfer.getData('text/plain');
    let data_incoming = document.getElementById(id_incoming).childNodes[0].childNodes[0];
    let data_outgoing = event.currentTarget.childNodes[1].childNodes[0].childNodes[0];
    if (event.target.childElementCount == 1) {
      event.target.childNodes[1].childNodes[0].appendChild(data_incoming);
    } 
    if (event.target.childElementCount == 0) {
      event.target.childNodes[0].replaceWith(data_incoming);
    }
    document.getElementById(id_incoming).childNodes[0].appendChild(data_outgoing);
    return true;
    // return false;
  }
  var data = event.dataTransfer.getData("text");
  event.currentTarget.appendChild(document.getElementById(data));
}

function allowMultipleDrop(event) {
  event.preventDefault();
}

function multiItemsDrop(event) {
  event.preventDefault();
  var data = event.dataTransfer.getData("text");
  event.currentTarget.appendChild(document.getElementById(data));
}


let wordQueue, quoteText, leadText, highlightPosition, startTime, index = -1, is_playing = false;
let Guess = [], cur_guess, cur_ans, line_len;
let sec_index, sec_cur_ans, sec_cur_guess, sec_wordQueue, sec_quoteText, sec_leadText, sec_line_len;
let num_tries, is_random;

let lastPlayedTs;

function startGame() {
  
  var today = new Date();
  
  if ( Na(new Date(lastPlayedTs), today) < 1) {
     alert("Play a new puzzle tomorrow!")
     return;
  }
  
  console.log("new game started!");
  is_playing = false;
  num_tries = 0;
  Guess = [];

  is_random = document.getElementById('rand').checked;
  // console.log("Is random: ",is_random);
  
  message.innerHTML = ``;
  dropZone.innerHTML = `<template id="dropBox">
    <span class="droppable" ondrop="drop(event)" ondragover="allowDrop(event)"><br></span>
    </template>`;
  sec_dropZone.innerHTML = ``;
  info.innerHTML = ``;
  start.innerHTML = `New Game`;
  image.innerHTML = ``;
  check.style.display = "revert";
  tooltip.innerHTML = "Copy to clipboard";
  share.style.display = "none";
  
  if (is_random == true) {
    index = Math.floor(Math.random() * ways.length);
  } else {
    index++;
    if (index == ways.length) {
      index = 0;
    }
  }
  do {
    sec_index = Math.floor(Math.random() * ways.length);
  } while(sec_index == index)
  
  quoteText = ways[index].text;
  leadText = ways[index].lead;
  wordQueue = quoteText.split(" ");
  cur_ans = wordQueue.join(" ");
  line_len = wordQueue.length;

  sec_quoteText = ways[sec_index].text;
  sec_leadText = ways[sec_index].lead;
  sec_wordQueue = sec_quoteText.split(" ");
  sec_cur_ans = sec_wordQueue.join(" ");  
  sec_line_len = sec_wordQueue.length;
  
  const template = document.getElementById('dropBox');
  
  for(var i=0; i < line_len; i++) {
    
    const newBox = template.content.cloneNode(true);
    const text = newBox.querySelector('.droppable');
    text.innerText = ["Word ".concat(i+1).concat(" ")].join(" ");
    
    dropZone.appendChild(newBox);
  }

  for(var i=0; i < sec_line_len; i++) {
    
    const newBox = template.content.cloneNode(true);
    const text = newBox.querySelector('.droppable');
    text.innerText = ["Word ".concat(i+1).concat(" ")].join(" ");
    
    sec_dropZone.appendChild(newBox);
  }
  
  wordQueue = wordQueue.concat(sec_wordQueue);
  
  words.innerHTML = shuffle(wordQueue).map((word, ind) => `<div id="word${ind+1}" class="draggable" draggable="true" ondragstart="drag(event)"><span class="word">${word}</span></div>`).join(" ");
  
  reference.innerHTML = `Category 1: ${ways[index].category}`
  quote.innerHTML = leadText;
  meaning.innerHTML = ``;
  
  sec_reference.innerHTML = `Category 2: ${ways[sec_index].category}`
  sec_quote.innerHTML = sec_leadText;
  sec_meaning.innerHTML = ``;
  
  startTime = new Date().getTime();
  
  document.body.className = "";
  // quote.style.display = "revert";
  dropZone.style.display = "none";
  sec_dropZone.style.display = "none";
  words.style.display = "none";
  check.innerHTML = `Try`;
  check.style.display = "block";
}

function shuffle(array) {
    var i = array.length;
    while (i-- > 0) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


function checkOrder() {
  
  if (is_playing == false) {
    is_playing = true;
    // quote.style.display = "none";
    dropZone.style.display = "flex";
    sec_dropZone.style.display = "flex";
    words.style.display = "revert";
    words.className = 'droppable';
    meaning.innerHTML = `<span class="meaning">CO<sub>2</sub> reduction: ${ways[index].points} kg</span>`;
    sec_meaning.innerHTML = `<span class="meaning">CO<sub>2</sub> reduction: ${ways[sec_index].points} kg</span>`;
    check.innerHTML = `Check`;
    return;
  }
  is_playing = false;
  dropZone.style.display = "none";
  sec_dropZone.style.display = "none";
  words.style.display = "none";
  words.className = '';
  // quote.style.display = "revert";
  check.innerHTML = `Retry`;
  
  num_tries++;

  let w, noDataFound = "0";
  let new_Guess = [...dropZone.getElementsByClassName("word")].map(w => w.textContent).join(" ");
  console.log(new_Guess);
  Guess = [];
  for (var i=0; i< line_len; i++) {
    try {
      w = dropZone.children[i+1].childNodes[1].childNodes[0].childNodes[0].data;
    } catch {
      w = noDataFound;
    }
    Guess.push(w);
  }
  cur_guess = Guess.join(" ");

  if(cur_guess !== cur_ans){
    console.log("mistake in line 1");
    message.innerHTML = `  <span >Wrong, ${num_tries} guesses. Try again!</span>  `;
    return;
  }
  
  let sec_new_Guess = [... sec_dropZone.getElementsByClassName("word")].map(w => w.textContent).join(" ");
  console.log(sec_new_Guess);
  Guess = [];
  for (var i=0; i < sec_line_len; i++) {
    try {
      w = sec_dropZone.children[i].childNodes[1].childNodes[0].childNodes[0].data;
    } catch {
      w = noDataFound;
    }
    Guess.push(w);
  }
  sec_cur_guess = Guess.join(" ");
  
  if(sec_cur_guess == sec_cur_ans){
    console.log("Successfully finished game");
    gameOver();
    return;
  }
  
  console.log("mistake in line 2");
  message.innerHTML = `  <span >Wrong, ${num_tries} guesses. Try again!</span>  `;

}

let elapsedTime;

function gameOver() {
  
  quote.style.display = "revert";
  dropZone.style.display = "flex";
  sec_dropZone.style.display = "flex";
  words.style.display = "revert";

  lastPlayedTs = new Date();

  elapsedTime = new Date().getTime() - startTime;
  // let time_taken = (elapsedTime/1000);
  // console.log(`Time taken is: ${Math.round(time_taken)}`)
  
  dropZone.innerHTML = `<template id="dropBox">
    <span class="droppable" ondrop="drop(event)" ondragover="allowDrop(event)"></span>
    </template>`;
  sec_dropZone.innerHTML = ``;
  message.innerHTML = `
    <span class="congrats">Congrats!</span>
    <br> You finished in ${elapsedTime/1000} seconds with ${num_tries} tries
    `;
  
  quote.innerHTML = quoteText;
  sec_quote.innerHTML = sec_quoteText;
  meaning.innerHTML = `<span class="meaning">CO<sub>2</sub> reduction: ${ways[index].points} kg</span>`;
  
  document.getElementById("start").focus();
  
  if (is_random == false) {
    save_history();
  }
  check.style.display = "none";
  share.style.display = "block";
  
  image.innerHTML = `<img class="img" draggable="false" src="https://cdn.glitch.global/34ea32e3-6f89-4767-93ea-ea0e08fd297f/green-footprints.jpg">`

  document.body.className = "image";
  // document.body.className = "winner";
  ShareIt();
}

document.addEventListener("keypress", function onPress(event) {
    if (event.key === "@") {
      console.log("cheat code for testing game");
      words.innerHTML = ``;
      words.className = '';
      gameOver();
      return;
    }
});

var copyText;

function ShareIt() {
  
  let linkURL = "https://set-the-pace.glitch.me";
  
  copyText = `#SetThePACE I learnt 2 different ways out of 40 ways to reduce my carbon footprint in ${Math.round(elapsedTime/1000)} sec at ${linkURL}`;
  
  navigator.clipboard.writeText(copyText);
  
   if (navigator.canShare) {
    navigator.share({
      title: 'Share results',
      text: copyText,
      // url: linkURL,
    })
    .then(() => console.log('Successful share'))
    .catch((error) => console.log('Error sharing', error));
  }
  
//  alert("Copied the results to clipboard");
  tooltip.innerHTML = "Results copied";
}

function outFunc() {
  tooltip.innerHTML = "Copy to clipboard";
}

function Na(e, a) {
    var s = new Date(e);
    var t = new Date(a).setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0);
    return Math.round(t / 864e5);
}

function get_history() {
  const noItemsFound_ad = 0, noItemsFound_ku = -1, noItemsFound_lastPlayedTs = 0;
  const ka = localStorage.getItem('index') || noItemsFound_ku;
  const lpts = localStorage.getItem('lpts') || noItemsFound_lastPlayedTs;
  
  index = JSON.parse(ka);
  lastPlayedTs = JSON.parse(lpts);
}

function save_history() {
  const ka = JSON.stringify(index);
  const lpts = JSON.stringify(lastPlayedTs);
  localStorage.setItem('index', ka);
  localStorage.setItem('lpts', lpts);
}

get_history();
check.style.display = "none";
share.style.display = "none";

document.getElementById("start").focus();
start.addEventListener("click", startGame);
check.addEventListener("click", checkOrder);

