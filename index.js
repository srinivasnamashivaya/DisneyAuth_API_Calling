"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const https = require("https");
const http = require('https');
const requesthttp = require('request');
var request = require("request")
const restService = express();
const {dialogflow, actionssdk, BasicCard} = require('actions-on-google');
const {Suggestions, SignIn, Permission, NewSurface, 
       DeliveryAddress, OrderUpdate, TransactionDecision, TransactionRequirements} = require('actions-on-google');
//const app = actionssdk({debug: true});
const app = dialogflow({debug: true, clientId: 'dZaOhBjKapB2LbDqQzpgOwTVulXRJrgW'});
const functions = require('firebase-functions');
const URL = 'https://raw.githubusercontent.com/actions-on-google/dialogflow-quotes-nodejs/master/quotes.json';
const fetch = require('isomorphic-fetch');

restService.use(bodyParser.urlencoded({extended: true}));
//restService.use(bodyParser.json());
restService.use(bodyParser.json({type: 'application/json'})); 


// Welcome Intent
app.intent('Default Welcome Intent', async (conv) => {
  console.log('welcomeIntent');
  conv.ask('Greetings from Disney! Do Sign In.');  
  conv.add(new Suggestions('Sign in'));      
});

// Create a Dialogflow intent with the `actions_intent_SIGN_IN` event (for Account Linking)
app.intent('Do Sign In', (conv, signin) => {  
  const capability = 'actions.capability.SCREEN_OUTPUT';
  if (conv.surface.capabilities.has(capability)) {         
    conv.ask(new SignIn('To keep using Disney '));         
  } else {
    conv.ask(new NewSurface({
    capabilities: capability,
    context: 'To use this skill you need to sign in ',
    notification: 'Please sign in!',
    }));
  }
});

// SignIn Confirmation intent (from user at runtime)
app.intent('Do Sign In Confirmation', (conv, params, signin) => {
  if (signin.status === 'OK') {
           console.log('userId', conv.user.raw.userId);
           //console.log('accessToken', conv.user.raw.accessToken);

           const options = {
           // We just want permission to get their name
           permissions: ['NAME'],
           // Prompt them why we want the information
           context: 'To address you by name'
         };
  conv.ask(new Permission(options));
  //const payload = conv.user.profile.payload;
  //const name = payload ? ${payload.given_name} : '';
  //conv.ask(Hi${name}!);
  //conv.ask(`payload: ${JSON.stringify(payload)}`);         
  //conv.add(new Suggestions('Ok'));
  } else {
    console.log('not signed in');
    conv.ask(`I won't be able to fetch your data, but what do you want to do next?`);
    conv.add(new Suggestions('Sign in'));
  }
});


//get permission intent (from user at runtime)
app.intent('Do Permission Confirmation', (conv, params, confirmationGranted) => {
  console.log('get permission confirmation Intent');
  const {name} = conv.user;
  //const loc = JSON.stringify(conv.device.location);  
    if (confirmationGranted) {
           if (name) { 
                  
           //return conv.ask(`Hai! ${conv.user.raw.profile.displayName}, your current location is ${loc}.`);
           conv.ask(`Hai! ${conv.user.raw.profile.displayName}, your account is linked.`);                             
           }
  }else {
    conv.ask(`Okay, yeah that's fine. I... didn't really want it anyway.`);
  }
});



//External service integration (for posting data and fetching data from our API services)
//app.intent('Get API Intent', (conv) => getExternalServiceCall(conv));

// Retrieve sample data from the external API
/*function getExternalServiceCall (conv){ 	
  //conv.ask(`Result: ${body}.`);  
   return fetch(URL)
    .then((response) => {
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      } else {
        return response.json();
      }
    })
    .then((json) => {
      // Grab data from JSON.
      const data = json['data']['2']['name'];
      //const ran = data.base;
      conv.ask(`${data}`); 
    });	
  
}*/


//External service integration (for posting data and fetching data from api services)
/*app.intent('Get API Intent', (conv, {title}) => {
    const title = title;
    return fetch(URL)
    .then((response) => {
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      } else {
        return response.json();
      }
    })
    .then((json) => {
      // Grab data from JSON.
      const data = json.data[Math.floor(Math.random() * json.data.length)];
      const randomQuote = data.quotes[Math.floor(Math.random() * data.quotes.length)];
      conv.ask(`${data.author} from Google and Developer Relations once said... ${randomQuote}`);
      conv.add(new Suggestions('More API service'));
      conv.add(new Suggestions('Quit'));      
      
      //const data = json['data']['2']['name'];
      //const ran = data.base;
      //conv.ask(`${data}`); 
    });	
   //conv.ask(`Result: ${value}.`);
});
*/

//testing sample 'new Promise' code working fine.
app.intent('Get API Intent', (conv, {title, status, order_type}) => {
        const titlename = title;
        const titlestatus = status;
        const titleordertype = order_type;
       // parse the user's request text and respond accordingly
       handleUserRequest(titlename, titlestatus, titleordertype)
        // let the assistant respond
        .then(response => conv.ask(response))
        // set the error message
        .catch(err => console.log(err));
   });
   function handleUserRequest (titlename, titlestatus, titleordertype) {
       return new Promise(function (resolve, reject) {
         var tname = titlename;
         var tstatus = titlestatus;
         var totype = titleordertype;
              
 //Todo: need to call Disney API service here, to fetch the status of a particualr title (tname)
              
         var apiresult = "Completed"; // Status from API
         var finalresponse = `For ${tname} title the status is ${apiresult}, Would you like to know more!`;
              
         resolve(finalresponse);
        });
    }

          
// Exit intent
app.intent('Exit Intent', (conv) => {
      console.log('Exit Intent'); 
      conv.ask(`Sure and Thank you. If you need anything else, I'm right here`);      
});


restService.post('/v2/webhook', app) ;

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});

