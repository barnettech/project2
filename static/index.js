var moveX = 20;
var moveY = 20;

var keyW = false;
var keyA = false;
var keyS = false;
var keyD = false;

document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('activeroom') === null) {
      localStorage.setItem('activeroom', 0);
      document.querySelector('#button-selector0').classList.add('active');
    }
    else {
      let selector = '#button-selector' + localStorage.getItem('activeroom');
      document.querySelector(selector).classList.add('active');
    }

    console.log(localStorage.getItem('username'));
    document.querySelector("#textarena").value = '';
    if (localStorage.getItem('username') === null) {
      document.querySelector('#username').style.visibility = 'visible';
      document.querySelector('#button0').style.visibility = 'visible';
      document.querySelector('#textarena').style.visibility = 'hidden';
      document.querySelector('#button1').style.visibility = 'hidden';
      document.querySelector('#username-line').style.visibility = 'visible';
      document.querySelector('#thechatarea').style.visibility = 'hidden';
    } else {
        document.querySelector('#username').style.visibility = 'hidden';
        document.querySelector('#button0').style.visibility = 'hidden';
        document.querySelector('#textarena').style.visibility = 'visible';
        document.querySelector('#button1').style.visibility = 'visible';
        document.querySelector('#username-line').style.visibility = 'hidden';
        document.querySelector('#thechatarea').style.visibility = 'visible';
    }
    var activeChatRoom = 'Lobby';
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    document.querySelector("#textarena").onclick = () => {
      document.querySelector("#textarena").focus();
    if(document.querySelector("#textarena").value.length < 1) {
        document.querySelector("#textarena").setSelectionRange(0, 0);
      }
    }
    // code to fly the ship, democratically, whomever hits awsd first is the captain!
    //event listener
    window.addEventListener("keydown", onKeyDown, false);

    // When connected, configure buttons
    socket.on('connect', () => {
        // Each button should emit a "submit vote" event
        document.querySelectorAll('.button0').forEach(button => {
            button.onclick = () => {
                const selection = button.dataset.vote;
                socket.emit('submit vote', {'selection': selection});
            };
        });
        console.log(':46');
        var activeroom = localStorage.getItem('activeroom');
        let room_number = activeroom.match(/\d+/)[0];
        socket.emit('change channel', {'channel_number': room_number});

        document.querySelector("#button1").onclick = () => {
                let chattext = document.querySelector('#textarena').value;
                let username = localStorage.getItem('username');
                document.querySelector('#textarena').value = '';
                document.querySelector('#textarena').focus();
                let room_selected_selector = localStorage.getItem('activeroom');
                let room_number = room_selected_selector.match(/\d+/)[0];
                chattext = username + ': ' + chattext
                socket.emit('chat emit', {'chattext': chattext , 'channel_number': room_number});
            };

        var allchannelbuttons = document.querySelectorAll("#channel-buttons button");
        for (var i = 0; i < allchannelbuttons.length; i++) {
          allchannelbuttons[i].addEventListener('click', function(event) {
            var allchannelbuttons2 = document.querySelectorAll("#channel-buttons button");
            for (var i = 0; i < allchannelbuttons2.length; i++) {
                allchannelbuttons2[i].classList.remove('active');

            }

            this.classList.add('active');
            room = this.getAttribute("id");
            let roomid = room.match(/\d+/)[0];
            localStorage.setItem('activeroom', roomid);
            var activeChatRoom = this.textContent;
            let room_selected_selector = localStorage.getItem('activeroom');
            let room_number = room_selected_selector.match(/\d+/)[0];
            socket.emit('change channel', {'channel_number': room_number});
          });
        }

        document.querySelector("#button0").onclick = () => {
                var username = document.querySelector('#username').value;
                localStorage.setItem('username', username);
                document.querySelector('#username').style.visibility = 'hidden';
                document.querySelector('#button0').style.visibility = 'hidden';
                document.querySelector('#textarena').style.visibility = 'visible';
                document.querySelector('#button1').style.visibility = 'visible';
                document.querySelector('#thechatarea').style.visibility = 'visible';
                document.querySelector('#username-line').style.visibility = 'hidden';
            };
        document.querySelector("#button2").onclick = () => {
                const newchannel = document.querySelector('#newchannel').value;
                var activeChatRoom = newchannel;
                socket.emit('add channel', {'newchannel': newchannel});
            };
        document.querySelector("#button-ship").onclick = () => {
          draw();
        }
    });

    // When a new vote is announced, increase the count
    socket.on('vote totals', data => {
        document.querySelector('#yes').innerHTML = data.yes;
        document.querySelector('#no').innerHTML = data.no;
        document.querySelector('#maybe').innerHTML = data.maybe;
    });

    // When new text is chatted, broadcast it to all
    socket.on('chat emit', data => {
        console.log('room number is ' + data.channel_number);
        document.querySelector('#chathistory-area').innerHTML += '<div>' + data.chattext + '</div>';
    });

    socket.on('new channel', data => {
        console.log('added new channel ' + data);
        var allchannelbuttons = document.querySelectorAll("#channel-buttons button");
        var chatroomCount = allchannelbuttons.length;
        document.getElementById('channel-buttons').innerHTML += '<a href="#"><button id="#button-selector' + chatroomCount + '" type="button" class="btn btn-info">' + data + '</button><a href="#">';

        var allchannelbuttons = document.querySelectorAll("#channel-buttons button");
        for (var i = 0; i < allchannelbuttons.length; i++) {
          allchannelbuttons[i].addEventListener('click', function(event) {
            var allchannelbuttons2 = document.querySelectorAll("#channel-buttons button");
            for (var i = 0; i < allchannelbuttons2.length; i++) {
                allchannelbuttons2[i].classList.remove('active');

            }

            this.classList.add('active');
            room = this.getAttribute("id");
            let roomid = room.match(/\d+/)[0];
            localStorage.setItem('activeroom', roomid);
            var activeChatRoom = this.textContent;
            let room_selected_selector = localStorage.getItem('activeroom');
            let room_number = room_selected_selector.match(/\d+/)[0];
            socket.emit('change channel', {'channel_number': room_number});
          });
        }
    });

    socket.on('change channel', data => {
        document.querySelector('#chathistory-area').innerHTML = data;
    });

    socket.on('on fly', data => {
        console.log('channel, ' + data);
        let keyD = data.keyD;
        let keyS = data.keyS;
        let keyA = data.keyA;
        let keyW = data.keyW;
        fly(keyD, keyS, keyA, keyW);

    });
});

// https://stackoverflow.com/questions/20567342/how-to-create-a-canvas-animation-with-one-moving-triangle-rectangle
(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

function onKeyDown(event) {
  var keyCode = event.keyCode;
  switch (keyCode) {
    case 68: //d
      keyD = true;
      break;
    case 83: //s
      keyS = true;
      break;
    case 65: //a
      keyA = true;
      break;
    case 87: //w
      keyW = true;
      break;
  }
}

function draw() {
  window.requestAnimationFrame(draw);
  var canvas = document.getElementById('canvas');
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    if (keyD == true) {
      socket.emit('on fly', {'keyD': true, 'keyS': false, 'keyA': false, 'keyW': false});
      keyD = false;
    }
    if (keyS == true) {
      socket.emit('on fly', {'keyD': false, 'keyS': true, 'keyA': false, 'keyW': false});
      keyS = false;
    }
    if (keyA == true) {
      socket.emit('on fly', {'keyD': false, 'keyS': false, 'keyA': true, 'keyW': false});
      keyA = false;
    }
    if (keyW == true) {
      socket.emit('on fly', {'keyD': false, 'keyS': false, 'keyA': false, 'keyW': true});
      keyW = false;
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,204,142,0.5)";
    ctx.moveTo(75 + moveX, 50 + moveY);
    ctx.lineTo(100 + moveX, 75 + moveY);
    ctx.lineTo(100 + moveX, 25 + moveY);
    ctx.scale(1,1);
    ctx.rotate(Math.PI / 1);
    ctx.fill();
  }
}

function fly(keyD, keyS, keyA, keyW) {
  window.requestAnimationFrame(draw);
  var canvas = document.getElementById('canvas');
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    if (keyD == true) {
      moveX += 10 ;
    }
    if (keyS == true) {
      moveY += 10;
    }
    if (keyA == true) {
      moveX -= 10;
    }
    if (keyW == true) {
      moveY -= 10;
    }
  }
}

window.requestAnimationFrame(draw);