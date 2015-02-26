var socket = new WebSocket("ws://localhost:8888/main/")

socket.onopen = function() {
    document.getElementById("LOGIN").style.display = 'none';
    window.G_H = new Object();
    G_H.USER = new Authenticate();
    G_H.ROOMS = new Handler_rooms();
    G_H.COOKIE = Handler_of_cookie;
    G_H.ERRORS = Errors;
}

socket.onmessage = function(event) {
    data = JSON.parse(event.data);

    for (var key in data) {
       if (Array.isArray(data[key])){//////
          G_H[key](data[key]);
       }
       else if (typeof data[key] == 'object') {
          for (var i in data[key])
             { G_H[key][i](); }
       }
    }
}

socket.onclose = function() {
    alert("Connection is closed");
}

function Errors(type) {
    alert(type);
}

function Authenticate() {
    this.identification = function() {
        document.getElementById('LOGIN').style.display = 'block';
        var login = document.createElement('input');
        var pass_one = document.createElement('input');
        var regist = document.createElement('input');
        var ident = document.createElement('input');

        login.type = 'text';
        pass_one.type = 'text';
        regist.type = 'button';
        ident.type = 'button';

        login.id = 'login_input';
        pass_one.id = 'pass_one_input';

        regist.value = 'Зарегистрироваться';
        ident.value = 'Войти';

        login.placeholder = 'login';
        pass_one.placeholder = 'password';

        regist.setAttribute('onclick', 'G_H.USER.registration()');
        ident.setAttribute('onclick', 'G_H.USER.send_data()');

        document.getElementById("login").appendChild(login);
        document.getElementById("pass_one").appendChild(pass_one);
        document.getElementById("regist").appendChild(regist);
        document.getElementById("ident").appendChild(ident);
    }
    this.registration = function() {
        var pass_two = document.createElement('input');
        var mail = document.createElement('input');

        pass_two.type = 'text';
        mail.type = 'text';

        pass_two.id="pass_two_input";
        mail.id='mail_input';

        pass_two.placeholder="password again";
        mail.placeholder="e-mail";

        document.getElementById("regist").style.display = 'none';
        document.getElementById("pass_two").appendChild(pass_two);
        document.getElementById("mail").appendChild(mail);
    }
    this.send_data = function() {
        var login = document.getElementById("login_input").value;
        var pass_one = document.getElementById("pass_one_input").value;
        var pass_two = document.getElementById("pass_two_input").value;
        var mail = document.getElementById("mail_input").value;
        if (pass_one != pass_two) { alert('Пароли не одинаковы'); }
        else {
           var hash = CryptoJS.SHA3(pass_one+mail+login, { outputLength: 224 });
           return socket.send(JSON.stringify(
             {'CREATE_USER': {'login':login, 'user_hash':hash, 'mail':mail}} ));
       }
    }
}

function Handler_of_cookie(list_data) {
    document.getElementById('LOGIN').style.display = 'none';
    var d = new Date();
    d.setTime(d.getTime()+list_data[1]*1000)
    document.cookie = 'COOKIE='+list_data[0]+';'+'expires='+d+';';
}

function Handler_rooms(array_rooms) {
    this.callback_onclick = function(room) {
        return socket.send(JSON.stringify(room.name));
    }
 
    this.show_rooms = function(array_rooms) {
        alert('show_rooms');
        /*for (var i = 0; i < array_rooms.length; i++) {
           var room = document.createElement('div');
           room.name = array_rooms[i];
           room.setAttribute('onclick', 'ROOMS.callback_onclick(this)');
        }*/
    }
}
