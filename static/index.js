document.addEventListener('DOMContentLoaded', () => {
    console.log(localStorage.getItem('username'));
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
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        // Each button should emit a "submit vote" event
        document.querySelectorAll('.button0').forEach(button => {
            button.onclick = () => {
                const selection = button.dataset.vote;
                socket.emit('submit vote', {'selection': selection});
            };
        });
        document.querySelector("#button1").onclick = () => {
                // var chattext = document.getElementById("textarena").value;
                const chattext = document.querySelector('#textarena').value;
                let username = localStorage.getItem('username');
                console.log(username);
                socket.emit('chat emit', {'chattext': username + ': ' + chattext});
            };
        document.querySelector("#button0").onclick = () => {
                var username = document.querySelector('#username').value;
                localStorage.setItem('username', username);
                localStorage.setItem('key', 'value');
                document.querySelector('#username').style.visibility = 'hidden';
                document.querySelector('#button0').style.visibility = 'hidden';
                document.querySelector('#textarena').style.visibility = 'visible';
                document.querySelector('#button1').style.visibility = 'visible';
                //socket.emit('chat emit', {'chattext': chattext});
            };
    });

    // When a new vote is announced, increase the count
    socket.on('vote totals', data => {
        document.querySelector('#yes').innerHTML = data.yes;
        document.querySelector('#no').innerHTML = data.no;
        document.querySelector('#maybe').innerHTML = data.maybe;
    });

    // When new text is chatted, broadcast it to all
    socket.on('chat emit', data => {
        document.querySelector('#chathistory-area').innerHTML += '<div>' + data + '</div>';
    });
});