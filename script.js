
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

let userId = getCookie('userId');

if (!userId || userId == undefined || userId == 'undefined') {
  let popo =  Math.floor(1 - 0.5 + Math.random() * (1000000 - 1 + 1))

  document.cookie = `userId = ${popo};max-age=3600`;
  userId = getCookie('userId');
} else if (userId == undefined || userId == 'undefined' || userId == '') {
  let popo =  Math.floor(1 - 0.5 + Math.random() * (1000000 - 1 + 1));

  document.cookie = `userId = ${popo};max-age=3600`;
  userId = getCookie('userId');
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-analytics.js";
import { getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmdlh18hYgzicVcD70jEzqUbbSxCbSpqQ",
  authDomain: "clone-trello-78c6a.firebaseapp.com",
  projectId: "clone-trello-78c6a",
  storageBucket: "clone-trello-78c6a.appspot.com",
  messagingSenderId: "86837399706",
  appId: "1:86837399706:web:74880b406f147fee720f23",
  measurementId: "G-W6WGDPXHY8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db =  getDatabase();


let user = [];
let cards = document.querySelectorAll('.item');
let placeholders = document.querySelectorAll('.placeholder');
let createButtons = document.querySelectorAll('.create-card');
let popup = document.querySelector('.create-card-popup');
let createCardButton = popup.querySelector('.popup__create');
let closeCardButton = popup.querySelector('.popup__close');
let cardInfoBlock = document.querySelector('.card-info');

// функци отправки данных в базу данных
function setFirebase(userId, obj) {
  set(ref(db, `user/${userId}/${obj.id}/`), obj) 
}
//функция получения данных из базы данных
function getFirebase() {
  const dbref = ref(db);

  get(child(dbref, `user/${userId}/`)).then((res) => {
    if (res.exists()) {
      let userCard = res.val();

      for(let key in userCard) {
        let userObj = res.val(key);

        user.push(userObj[key]);
        userCreateCard(userObj[key]);
      }
    }
  })
}

getFirebase();

function updateFirebase (id, columnNum) {
  let column = {
    column: columnNum
  }
  update(ref(db, `user/${userId}/${id}/`), column) 
}

function removeFirebase (id) {
  remove(ref(db, `user/${userId}/${id}/`)) ;
}
// показываем блок создания карточки
createButtons.forEach((item, i) => {
  item.addEventListener('click', function(event) {
    if (cardInfoBlock.classList.contains('active')) {
      cardInfoBlock.classList.remove('active')
    }

    popup.classList.add('active');
    popup.setAttribute('index',  i);
  })
})

// карточки из базы данных
function userCreateCard (user) {
  let div = document.createElement('div');
  let titleCard = `${user.name} ${user.surname} `;

  div.setAttribute('id', user.id);

  div.draggable = true;
  div.classList.add('item');
  div.textContent = titleCard;
  div.addEventListener('dragstart', dragstart);
  div.addEventListener('dragend', dragend);
  div.addEventListener('click', showCardInfo);
  placeholders[user.column].append(div);
  popup.classList.remove('active');
}

//обычное создание карточек
createCardButton.addEventListener('click', function() {
  let index = popup.getAttribute('index');
  let pop = cardInfo ();
  if (pop != false) {
    let div = document.createElement('div');
    let titleCard = `${pop.name} ${pop.surname} `;

    div.setAttribute('id', pop.id);

    div.draggable = true;
    div.classList.add('item');
    div.textContent = titleCard;
    div.addEventListener('dragstart', dragstart);
    div.addEventListener('dragend', dragend);
    div.addEventListener('click', showCardInfo);
    placeholders[index].append(div);
    popup.classList.remove('active');
  }
})

closeCardButton.addEventListener('click', function() {
  popup.classList.remove('active');
})

//Перебор карточек и навешивание на них события 
cards.forEach(function(item) {
  item.addEventListener('dragstart', dragstart);
  item.addEventListener('dragend', dragend);
});

let card;

function dragstart (event) {
  card = event.target;

  setTimeout(function(){
  event.target.classList.add('hide');
  }, 0);
}

function dragend (event) {
  event.target.classList.remove('hide');
}

placeholders.forEach(function(block) {
  block.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
  block.addEventListener('drop', function (event) {
    if (event.target.classList.contains('placeholder')) {
      event.target.append(card);
      updateFirebase(card.id, event.target.getAttribute('index'));
    } else {
      let col = event.target.closest('.col-wrapper').querySelector('.placeholder');
      
      col.append(card);
      updateFirebase(card.id, col.getAttribute('index'))
    }
  });
})

function cardInfo () {
  let cardColumn = popup.getAttribute('index');
  let userName = popup.querySelector('.popup__name');
  let userSurname = popup.querySelector('.popup__surname');
  let userAge = popup.querySelector('.popup__age');
  let userBudget = popup.querySelector('.popup__budget');
  if (userName.value.search("^[A-Za-zА-Яа-яЁё\s]") || userSurname.value.search("^[A-Za-zА-Яа-яЁё\s]") || userAge.value.search("^[0-9]+$") || userBudget.value.search("^[0-9]+$")) {
    alert(`empty field`);
    return false;
  } else {
    let userInfo = {
      name: userName.value,
      surname: userSurname.value,
      age: userAge.value,
      budget: userBudget.value,
      column: cardColumn,
      id: Math.floor(1 - 0.5 + Math.random() * (1000000 - 1 + 1)),
    };

    user.push(userInfo);
    setFirebase(userId, userInfo);

    return userInfo;
  }
}

function showCardInfo (event) {
  let cardId = event.target.getAttribute('id');
  let cardName = document.querySelector('.card-info__name');
  let cardAge= document.querySelector('.card-info__age');
  let cardBudget = document.querySelector('.card-info__budget');
  let removedCard = document.getElementById(`${cardId}`);

  user.forEach(function(item) {
    if (item.id == cardId) {
      cardName.textContent = `Name: ${item.name} ${item.surname}`;
      cardAge.textContent = `Age: ${item.age}`;
      cardBudget.textContent = `Money: ${item.budget}`;
    }
  })

  if (popup.classList.contains('active')) {
    popup.classList.remove('active')
  }
  cardInfoBlock.classList.add('active');

  cardInfoBlock.addEventListener('click', function(event) {
    if (event.target.classList.contains('card-info__close')) {
      cardInfoBlock.classList.remove('active')
    }
    if (event.target.classList.contains('card-info__remove')) {
      cardInfoBlock.classList.remove('active') 
      removeFirebase(cardId);
      removedCard.remove();
    }
  })
}