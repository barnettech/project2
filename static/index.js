document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('activeroom') === null) {
      localStorage.setItem('activeroom', 0);
      document.querySelector('#button-selector0').classList.add('active');
    }
    else {
      let selector = '#button-selector' + localStorage.getItem('activeroom');
      console.log('selector is ' + selector);
      document.querySelector(selector).classList.add('active');
    }

    console.log(localStorage.getItem('username'));
    document.querySelector("#textarena").value = '';
    if (localStorage.getItem('username') === null) {
      document.querySelector('#username').style.visibility = 'visible';
      document.querySelector('#button0').style.visibility = 'visible';
      document.querySelector('#textarena').style.visibility = 'hidden';
      document.querySelector('#button1').style.visibility = 'hidden';
    } else {
        document.querySelector('#username').style.visibility = 'hidden';
        document.querySelector('#button0').style.visibility = 'hidden';
        document.querySelector('#textarena').style.visibility = 'visible';
        document.querySelector('#button1').style.visibility = 'visible';
    }
    var activeChatRoom = 'Lobby';
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    document.querySelector("#textarena").onclick = () => {
      document.querySelector("#textarena").focus();
      console.log(document.querySelector("#textarena").value.length);
    if(document.querySelector("#textarena").value.length < 1) {
        document.querySelector("#textarena").setSelectionRange(0, 0);
      }
    }

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
        console.log('room number is ' + room_number);
        socket.emit('change channel', {'channel_number': room_number});

        document.querySelector("#button1").onclick = () => {
                // var chattext = document.getElementById("textarena").value;
                let chattext = document.querySelector('#textarena').value;
                let username = localStorage.getItem('username');
                document.querySelector('#textarena').value = '';
                document.querySelector('#textarena').focus();
                let room_selected_selector = localStorage.getItem('activeroom');
                let room_number = room_selected_selector.match(/\d+/)[0];
                console.log('the number extracted is ' + room_number);
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
            console.log('active chat room is ' + activeChatRoom);
            let room_selected_selector = localStorage.getItem('activeroom');
            let room_number = room_selected_selector.match(/\d+/)[0];
            console.log('the number extracted is ' + room_number);
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
                //socket.emit('chat emit', {'chattext': chattext});
            };
        document.querySelector("#button2").onclick = () => {
                console.log('add a channel');
                const newchannel = document.querySelector('#newchannel').value;
                var activeChatRoom = newchannel;
                socket.emit('add channel', {'newchannel': newchannel});
            };
    });


    socket.on('get chats', data => {
        console.log('get rooms chats:, ' + data);
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
    });

    socket.on('change channel', data => {
        console.log('channel, ' + data);
        document.querySelector('#chathistory-area').innerHTML = data;
    });
});