// Messager functions
function addGoodMessage(displayMessage) {
    var messageID = parseInt(new String(Math.random()*1000000));
    document.getElementById("messages").innerHTML += "<div id=" + messageID + " class='message message-good'>" + displayMessage + "</div>";
    setTimeout(function(){
        document.getElementById(messageID).style.display = "none";
        document.getElementById(messageID).remove();
    }, 5000);
}

// Messager functions
function addBadMessage(displayMessage) {
    var messageID = parseInt(new String(Math.random()*1000000));
    document.getElementById("messages").innerHTML += "<div id=" + messageID + " class='message message-bad'>" + displayMessage + "</div>";
    setTimeout(function(){
        document.getElementById(messageID).style.display = "none";
        document.getElementById(messageID).remove();
    }, 5000);
}