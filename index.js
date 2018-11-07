/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
//const questions = require('./questions');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const Game = require('./game');

function getSlotValues(filledSlots) {
  //given event.request.intent.slots, a slots values object so you have
  //what synonym the person said - .synonym
  //what that resolved to - .resolved
  //and if it's a word that is in your slot values - .isValidated
  const slotValues = {};

  //console.log('The filled slots: ' + JSON.stringify(filledSlots));
  Object.keys(filledSlots).forEach(function(item) {
    //console.log("item in filledSlots: "+JSON.stringify(filledSlots[item]));
    var name = filledSlots[item].name;
    //console.log("name: "+name);
    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {

      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case "ER_SUCCESS_MATCH":
          slotValues[name] = {
            "synonym": filledSlots[item].value,
            "resolved": filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            "isValidated": true
          };
          break;
        case "ER_SUCCESS_NO_MATCH":
          slotValues[name] = {
            "synonym": filledSlots[item].value,
            "resolved": filledSlots[item].value,
            "isValidated": false
          };
          break;
      }
    } else {
      slotValues[name] = {
        "synonym": filledSlots[item].value,
        "resolved": filledSlots[item].value,
        "isValidated": false
      };
    }
  }, this);
  //console.log("slot values: " + JSON.stringify(slotValues));
  return slotValues;
}

function getGame(anotherObj) {

	const game = new Game();
	Object.assign(game, anotherObj);
	/*game.Board = anotherObj.Board;
	game.UserMark = anotherObj.UserMark;
	game.UserX = anotherObj.UserX;
	game.UserY = anotherObj.UserY;*/
	return game;
}

function executeMove(game, move) {

		//let x = point["x"];
		//let y = point["y"];

		if (move === "east") {

			return game.Travel(0, 1);
		}
		else if (move === "west") {

			return game.Travel(0, -1);
		}
		else if (move === "north") {

			return game.Travel(1, 0);
		}
		else if (move === "south") {

			return game.Travel(-1, 0);
		}
		else if (move === "northwest") {

			return game.Travel(1, -1);
		}
		else if (move === "northeast") {

			return game.Travel(1, 1);
		}
		else if (move === "southwest") {

			return game.Travel(-1, -1);
		}
		else if (move === "southeast") {

			return game.Travel(-1, 1);
		}
		else {

			return -1;//invalid
		}
}

function startGame(handlerInput) {//newGame, handlerInput) {
	const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
	/*
	let speechOutput = newGame
		? requestAttributes.t('NEW_GAME_MESSAGE', requestAttributes.t('GAME_NAME'))
			+ requestAttributes.t('WELCOME_MESSAGE', GAME_LENGTH.toString())
		: '';
	const translatedQuestions = requestAttributes.t('QUESTIONS');
	const gameQuestions = populateGameQuestions(translatedQuestions);
	const correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));

	const roundAnswers = populateRoundAnswers(
		gameQuestions,
		0,
		correctAnswerIndex,
		translatedQuestions
	);
	const currentQuestionIndex = 0;
	const spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
	let repromptText = requestAttributes.t('TELL_QUESTION_MESSAGE', '1', spokenQuestion);
	for (let i = 0; i < ANSWER_COUNT; i += 1) {
		repromptText += `${i + 1}. ${roundAnswers[i]}. `;
	}
*/
	const repromptText = "To open the game manual at any time, just say help.";
	const speechOutput = requestAttributes.t('NEW_GAME_MESSAGE', requestAttributes.t('GAME_NAME'))
			+ requestAttributes.t('WELCOME_MESSAGE');
	const sessionAttributes = {};

	//const translatedQuestion = translatedQuestions[gameQuestions[currentQuestionIndex]];

	const game = new Game();
	game.SetUpBoard(25);
	Object.assign(sessionAttributes, {
		speechOutput: repromptText,
		repromptText,
		state: 'inSession',
		game
		/*
		currentQuestionIndex,
		correctAnswerIndex: correctAnswerIndex + 1,
		questions: gameQuestions,
		score: 0,
		correctAnswerText: translatedQuestion[Object.keys(translatedQuestion)[0]][0]
		*/
	});

	handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

	return handlerInput.responseBuilder
		.speak(speechOutput)
		.reprompt(repromptText)
		.withSimpleCard(requestAttributes.t('GAME_NAME'), repromptText)
		.getResponse();
}
/*
function helpTheUser(newGame, handlerInput) {
	const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
	const askMessage = newGame
		? requestAttributes.t('ASK_MESSAGE_START')
		: requestAttributes.t('REPEAT_QUESTION_MESSAGE') + requestAttributes.t('STOP_MESSAGE');
	const speechOutput = requestAttributes.t('HELP_MESSAGE', GAME_LENGTH) + askMessage;
	const repromptText = requestAttributes.t('HELP_REPROMPT') + askMessage;

	return handlerInput.responseBuilder.speak(speechOutput).reprompt(repromptText).getResponse();
}
*/
function sessionHelp(handlerInput) {

	const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
	//const askMessage = requestAttributes.t('STOP_MESSAGE');
	const speechOutput = requestAttributes.t('HELP_MESSAGE');// + askMessage;
	const repromptText = requestAttributes.t('HELP_REPROMPT');// + askMessage;

	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	Object.assign(sessionAttributes, {
		speechOutput,
		repromptText
	});
	//handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

	return handlerInput.responseBuilder.speak(speechOutput).reprompt(repromptText).getResponse();
}

function endHelp(handlerInput) {

	const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
	const askMessage = requestAttributes.t('ASK_MESSAGE_START');
	const speechOutput = 'No game is in progress. ' + askMessage;
	const repromptText = askMessage;

	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	Object.assign(sessionAttributes, {
		speechOutput,
		repromptText
	});
	//handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

	return handlerInput.responseBuilder.speak(speechOutput).reprompt(repromptText).getResponse();
}

function sessionUhandled(handlerInput) {

	const speechOutput = "To open the game manual at any time, just say help.";//requestAttributes.t('TRIVIA_UNHANDLED', ANSWER_COUNT.toString());

	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	Object.assign(sessionAttributes, {
		speechOutput,
		repromptText: speechOutput
	});
	//handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

	return handlerInput.attributesManager
		.speak(speechOutput)
		.reprompt(speechOutput)
		.getResponse();
}

function sessionWhereAmI(handlerInput) {

	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	const g = sessionAttributes.game;
	//const game = getGame(g);
	if (g.UserX == 0 && g.UserY == 0) {

		const speechOutput = "You are currently at zero zero. Command is northeast at fourteen eight.";

		Object.assign(sessionAttributes, {
			speechOutput,
			repromptText: speechOutput
		});
		//handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

		return handlerInput.responseBuilder.speak(speechOutput)
			.reprompt(speechOutput)
			.getResponse();
	}
	else {

		const speechOutput = `You are currently at ${g.UserX} ${g.UserY}. Command is northeast at fourteen eight.`;

		Object.assign(sessionAttributes, {
			speechOutput,
			repromptText: speechOutput
		});
		//handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

		return handlerInput.responseBuilder.speak(speechOutput)
			.reprompt(speechOutput)
			.getResponse();
	}
}

function sessionMove(handlerInput) {

	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

	const slotValues = getSlotValues(handlerInput.requestEnvelope.request.intent.slots);
	if (slotValues["direction"]) {
		const g = sessionAttributes.game;
		const game = getGame(g);
		//console.log(JSON.stringify(game));
		const result = executeMove(game, slotValues["direction"]["resolved"]);
		//console.log(`The result is ${result}`);
		//if (result) {
			//TODO CHANGE MESSAGE, INTRODUCE WHERE AM I
		let speechOutput;
		let gameOver = false;
		switch (result) {
			case 1:
				speechOutput = 'Sorry, you can\'t move there.';
				break;
			case 2:
				speechOutput = 'KABOOM! You stepped on a bomb! Thanks for playing!';
				gameOver = true;
				break;
			case 3:
				speechOutput = 'You won! You arrive at Command and are awarded the medal of Minding The Field. Thanks for playing!';
				gameOver = true;
				break;
			case 4:
				//console.log('BIG FOO');
			    const mineCount = game.CountMines();
			    //console.log('GOOD FOO');
				speechOutput = `You are now at ${game.UserY} ${game.UserX}. Beep beep. ${mineCount} mines in proximity.`;// + m_lang.ASK_MOVE;
				break;
			default:
				speechOutput = 'Please say a valid move.';
		}
		
		if (gameOver) {

			Object.assign(sessionAttributes, {
				state: 'gameEnded',
				game: null,
				speechOutput,
				repromptText: speechOutput
			});
		}
		else {
			Object.assign(sessionAttributes, {
				state: 'inSession',
				game,
				speechOutput,
				repromptText: speechOutput
			});
		}
		//console.log(JSON.stringify(game));
		//handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

		return handlerInput.responseBuilder
			.speak(speechOutput)
			.reprompt(speechOutput)
			//.withSimpleCard(m_lang.GAME_NAME, speechOutput)
			.withSimpleCard(requestAttributes.t('GAME_NAME'), speechOutput)
			.getResponse();
		//}
	}
	//TODO INVALID MOVE?
	return sessionUhandled(handlerInput);
}

function sessionCountMines(handlerInput) {

	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	const g = sessionAttributes.game;
	const mineCount = g.MineCount;
	const speechOutput = `Beep beep. ${mineCount} mines in proximity.`;

	Object.assign(sessionAttributes, {
			speechOutput,
			repromptText: speechOutput
	});
	//handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

	return handlerInput.responseBuilder.speak(speechOutput)
		.reprompt(speechOutput)
		.getResponse();
}

/* jshint -W101 */
const languageString = {
	en: {
		translation: {
			//QUESTIONS: questions.QUESTIONS_EN_US,
			GAME_NAME: 'Mind Field',
			HELP_MESSAGE: 'To get your coordinates, ask where am I? To use your mine detector, ask how many mines are near me? Once you have decided which direction to move, say move and specify any of the eight compass directions. For example, to move north, say move north. What would you like to do? ',
			//REPEAT_QUESTION_MESSAGE: 'To repeat the last question, say, repeat. ',
			ASK_MESSAGE_START: 'Would you like to start playing?',
			HELP_REPROMPT: 'To listen to the game manual again, say repeat. ',
			STOP_MESSAGE: 'Would you like to keep playing?',
			CANCEL_MESSAGE: 'Ok, let\'s play again soon.',
			NO_MESSAGE: 'Ok, if you ever want to mind the field, just say: Alexa open Mind Field!',//we\'ll play another time. Goodbye!',
			//TRIVIA_UNHANDLED: 'Try saying a number between 1 and %s',
			HELP_UNHANDLED: 'Say yes to continue, or no to end the game.',
			START_UNHANDLED: 'Say start to start a new game.',
			NEW_GAME_MESSAGE: 'Welcome to %s. ',
			WELCOME_MESSAGE: 'Your mission, should you choose to accept it, is to deliver a message to Command. However, there are mines in your way. So you will have to mind the field. You have a mine detector that tells you the number of adjacent mines. Also, to open the game manual at any time, just say help. Let\'s begin. ',
			ANSWER_CORRECT_MESSAGE: 'correct. ',
			ANSWER_WRONG_MESSAGE: 'wrong. ',
			CORRECT_ANSWER_MESSAGE: 'The correct answer is %s: %s. ',
			ANSWER_IS_MESSAGE: 'That answer is ',
			TELL_QUESTION_MESSAGE: 'Question %s. %s ',
			GAME_OVER_MESSAGE: 'You got %s out of %s questions correct. Thank you for playing!',
			SCORE_IS_MESSAGE: 'Your score is %s. '
		},
	},
};

const localizationClient = i18n.use(sprintf).init({
	lng: 'en',
	overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
	resources: languageString,
	returnObjects: true
});

const my_t_func = function (...args) {

	return localizationClient.t(...args);
};

const LocalizationInterceptor = {
	process(handlerInput) {

		const attributes = handlerInput.attributesManager.getRequestAttributes();
		attributes.t = my_t_func;
	},
};

const myStates = {
	inSession: {
		help: sessionHelp,
		uhandled: sessionUhandled,
		whereAmI: sessionWhereAmI,
		move: sessionMove,
		minesAdjacent: sessionCountMines
	},
	gameEnded: {
		help: endHelp,
		uhandled: endHelp,
		whereAmI: endHelp,
		move: endHelp,
		minesAdjacent: endHelp
	}
};

const LaunchRequest = {
	canHandle(handlerInput) {
		const { request } = handlerInput.requestEnvelope;

		return request.type === 'LaunchRequest'
			|| (request.type === 'IntentRequest'
				&& request.intent.name === 'AMAZON.StartOverIntent');
	},
	handle(handlerInput) {
/*
		const attributes = handlerInput.attributesManager.getRequestAttributes();
		attributes.t = function (...args) {
			return localizationClient.t(...args);
		};
*/
		return startGame(handlerInput);
	},
};


const HelpIntent = {
	canHandle(handlerInput) {
		const { request } = handlerInput.requestEnvelope;

		return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

		return myStates[sessionAttributes.state].help(handlerInput);

		//const newGame = !(sessionAttributes.questions);
		//return helpTheUser(newGame, handlerInput);
	},
};

const UnhandledIntent = {
	canHandle() {
		return true;
	},
	handle(handlerInput) {
		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
		if (Object.keys(sessionAttributes).length === 0) {
			const speechOutput = requestAttributes.t('START_UNHANDLED');
			return handlerInput.attributesManager
				.speak(speechOutput)
				.reprompt(speechOutput)
				.getResponse();
		} else if (sessionAttributes.state) {
			
			return myStates[sessionAttributes.state].uhandled(handlerInput);
		}
		const speechOutput = requestAttributes.t('HELP_UNHANDLED');
		return handlerInput.attributesManager.speak(speechOutput).reprompt(speechOutput).getResponse();
	},
};

const SessionEndedRequest = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

		return handlerInput.responseBuilder.getResponse();
	},
};

const WhereAmIIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
				&& (handlerInput.requestEnvelope.request.intent.name === 'WhereAmI');
	},
	handle(handlerInput) {


		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		return myStates[sessionAttributes.state].whereAmI(handlerInput);
	}
};

const MoveIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
				&& handlerInput.requestEnvelope.request.intent.name === 'Move';
	},
	handle(handlerInput) {

		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		return myStates[sessionAttributes.state].move(handlerInput);
	}
};

const MinesAdjacentIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
				&& handlerInput.requestEnvelope.request.intent.name === 'MinesAdjacent';
	},
	handle(handlerInput) {

		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		return myStates[sessionAttributes.state].minesAdjacent(handlerInput);
	}
};

/*
const AnswerIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
				&& (handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent'
				|| handlerInput.requestEnvelope.request.intent.name === 'DontKnowIntent');
	},
	handle(handlerInput) {
		//guess attempt
		if (handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent') {
			return handleUserGuess(false, handlerInput);
		}
		//don't know
		return handleUserGuess(true, handlerInput);
	},
};
*/
const RepeatIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
				&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
	},
	handle(handlerInput) {
		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		if (sessionAttributes.speechOutput) {
			if (sessionAttributes.repromptText) {
				return handlerInput.responseBuilder.speak(sessionAttributes.speechOutput)
					.reprompt(sessionAttributes.repromptText)
					.getResponse();
			}
			else {
				return handlerInput.responseBuilder.speak(sessionAttributes.speechOutput)
					.getResponse();
			}
		}
		else {
			return handlerInput.responseBuilder.speak('Sorry, there is nothing to repeat.')
				.reprompt('Sorry, there is nothing to repeat.')
				.getResponse();
		}
	},
};

const YesIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
				&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
	},
	handle(handlerInput) {
		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
		//repeat
		//strike the above comment
		if (sessionAttributes.state === 'inSession') {

			const speechOutput = "To open the game manual at any time, just say help.";//requestAttributes.t('TRIVIA_UNHANDLED', ANSWER_COUNT.toString());

			const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
			Object.assign(sessionAttributes, {
				speechOutput,
				repromptText: speechOutput
			});
			//handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

			return handlerInput.attributesManager
				.speak(speechOutput)
				.reprompt(speechOutput)
				.getResponse();
			/*
			return handlerInput.responseBuilder.speak(sessionAttributes.speechOutput)
				.reprompt(sessionAttributes.repromptText)
				.getResponse();
			*/
		}
		//starts game without tutorial/introduction ? (I think)
		//strike above, removed boolean arg
		return startGame(handlerInput);
	},
};


const StopIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
				&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
	},
	handle(handlerInput) {
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
		const speechOutput = requestAttributes.t('STOP_MESSAGE');

		return handlerInput.responseBuilder.speak(speechOutput)
			.reprompt(speechOutput)
			.getResponse();
	},
};

const CancelIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent';
	},
	handle(handlerInput) {
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
		const speechOutput = requestAttributes.t('CANCEL_MESSAGE');

		return handlerInput.responseBuilder.speak(speechOutput)
			.getResponse();
	},
};

const NoIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
	},
	handle(handlerInput) {
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
		const speechOutput = requestAttributes.t('NO_MESSAGE');
		return handlerInput.responseBuilder.speak(speechOutput).getResponse();
	},
};

const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		console.log(`Error handled: ${error.message}`);

		return handlerInput.responseBuilder
			.speak('Sorry, I can\'t understand the command. Please say again.')
			.reprompt('Sorry, I can\'t understand the command. Please say again.')
			.getResponse();
	},
};

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
	.addRequestHandlers(
		LaunchRequest,
		HelpIntent,
		WhereAmIIntent,
		MoveIntent,
		MinesAdjacentIntent,
		//AnswerIntent,
		RepeatIntent,
		YesIntent,
		StopIntent,
		CancelIntent,
		NoIntent,
		SessionEndedRequest,
		UnhandledIntent
	)
	.addRequestInterceptors(LocalizationInterceptor)
	.addErrorHandlers(ErrorHandler)
	.lambda();