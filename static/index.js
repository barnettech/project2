document.addEventListener('DOMContentLoaded', () => {

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
                var chattext = document.getElementById("textarena").value;
                socket.emit('chat emit', {'chattext': chattext});
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
        console.log(data);
        document.querySelector('#textarena').innerHTML = data;
    });
});