var login = require("facebook-chat-api")
var env = require('node-env-file')
var cleverbot = require("cleverbot.io")
env(__dirname + '/.env')

var botmap = new Map()
var peopleTalkedTo = new Set()

// dont wanna spam group chats
function isGroupChat(threadID){
	return true ? (threadID.match(/0/g)||[]).length < 4 : false
}

function newPerson(threadID){
	if (peopleTalkedTo.has(threadID))
		return false
	else {
		peopleTalkedTo.add(threadID)
		return true
	}
}


login({email: process.env.EMAIL, password: process.env.PASSWORD},

	// login
	function callback (err, api) {
	    if(err) return console.error(err);

	    api.setOptions({selfListen: false})

	    // listen for events
	    var stopListening = api.listen(
			function(err, event) {
		        if(err) return console.error(err);
		        console.log(event.threadID)

		        // only responds to messages
		        if (!isGroupChat(event.threadID) && event.type === "message") {

		            if(event.body === '/stop') {
		              api.sendMessage("Goodbye...", event.threadID);
		              return stopListening()
		            }

		            api.markAsRead(event.threadID, function(err) {
		              if(err) console.log(err);
		            });


		            // introduce rohbot to new people
		            if (event.body.indexOf("Rohbot:") == -1 && newPerson(event.threadID)){
		            	api.sendMessage("Rohbot: Helo facebook user " + event.threadID +
		            					", I am Rohbot. AMA, I'm hooked up to cleverbot."
		            					, event.threadID)

		            	var bot = new cleverbot("m9BGjZRC1yiv6R83", "ziHCP17gG5iZk7gDbLtHU91TfszJBJ5G");
		            	bot.setNick(event.threadID)
		            	botmap.set(event.threadID, bot)

		            // continue convo with old people
		            } else {

		            	var bot = botmap.get(event.threadID)

		            	bot.create(function (err, session) {
		            		console.log(session)

		            		bot.ask(event.body,
		            		function (err, response) {
							  api.sendMessage("Rohbot: " + response, event.threadID);
							});

						});

		            }
		        }

		    }

		);
	}
);
