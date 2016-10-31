var login = require("facebook-chat-api")
var env = require('node-env-file')
var cleverbot = require("cleverbot.io")
env(__dirname + '/.env')

var botmap = new Map()
var peopleTalkedTo = new Set()

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

	function callback (err, api) {
	    if(err) return console.error(err);

	    api.setOptions({selfListen: false})

	    var stopListening = api.listen(
			function(err, event) {
		        if(err) return console.error(err);
		        console.log(event.threadID)

		        if (!isGroupChat(event.threadID) && event.type === "message") {

		            if(event.body === '/stop') {
		              api.sendMessage("Goodbye...", event.threadID);
		              return stopListening()
		            }

		            api.markAsRead(event.threadID, function(err) {
		              if(err) console.log(err);
		            });

		            if (event.body.indexOf("Rohbot:") == -1 && newPerson(event.threadID)){
		            	api.sendMessage("Rohbot: Helo facebook user " + event.threadID +
		            					", I am Rohbot. AMA"
		            					, event.threadID)

		            	var bot = new cleverbot("m9BGjZRC1yiv6R83", "ziHCP17gG5iZk7gDbLtHU91TfszJBJ5G");
		            	bot.setNick(event.threadID)
		            	botmap.set(event.threadID, bot)


		            } else if (event.body.indexOf("Rohbot:") == -1) { // make sure not replying to self
		            	//continue previous convo

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
