/* start the external action and say hello */
console.log("App is alive");

/** #10 global #array of channels #arr*/
var channels = [
    yummy,
    sevencontinents,
    killerapp,
    firstpersononmars,
    octoberfest
];

/** create global variable */
var currentChannel;

/** We simply initialize it with the channel selected by default - sevencontinents */
currentChannel = sevencontinents;

/** Store my current (sender) location */
var currentLocation = {
    latitude: 48.249586,
    longitude: 11.634431,
    what3words: "shelf.jetted.purple"
};


// #11 #initialize#ready#app #initialize#onload initialise app
$(function(){

    listChannels(compareNew); 
    loadEmojis();

    // #11 #interval create interval triggering every ten seconds
    var intervall = setInterval(messageUpade,10*1000);

    console.log('App is initialized');
});

/**
 * Switch channels name in the right app bar
 * @param channelObject
 * @param channelElement
 */
// #11 #element channelElement as second parameter
function switchChannel(channelObject, channelElement) {
    // Log the channel switch
    console.log("Tuning in to channel", channelObject);

    // #10 #new: switching channels aborts "create new channel"-mode
    abortCreationMode();

    // Write the new channel to the right app bar using object property
    document.getElementById('channel-name').innerHTML = channelObject.name;

    // change the channel location using object property
    document.getElementById('channel-location').innerHTML = 'by <a href="https://w3w.co/'
        + channelObject.createdBy
        + '" target="_blank"><strong>'
        + channelObject.createdBy
        + '</strong></a>';

    //#9 selector adjusted for #btns #str
    $('#channel-star i').removeClass('fas far');
    $('#channel-star i').addClass(channelObject.starred ? 'fas' : 'far');


    /* highlight the selected #channel.
       This is inefficient (jQuery has to search all channel list items), but we'll change it later on */
    $('#channels li').removeClass('selected');
    // #11 #select add class selected to channelElement
    $(channelElement).addClass('selected');

    /* store selected channel in global variable */
    currentChannel = channelObject;

    // #11 #messages load all messages belonging to channel
    showMessages(channelObject);
    messageUpade();
}

/* liking a channel on #click */
function star() {
    // Toggling star
    // #9 selector adjusted for #btns #str
    $('#channel-star i').toggleClass('far');
    $('#channel-star i').toggleClass('fas');

    // toggle star also in data model
    currentChannel.starred = !currentChannel.starred;

    // toggle star also in list
    $('#channels li:contains(' + currentChannel.name + ') .fa-star').removeClass('fas far');
    $('#channels li:contains(' + currentChannel.name + ') .fa-star').addClass(currentChannel.starred ? 'fas' : 'far');
}

/**
 * Function to select the given tab
 * @param tabId #id of the tab
 */
function selectTab(tabId) {
    $('#tab-bar button').removeClass('selected');
    console.log('Changing to tab', tabId);
    $(tabId).addClass('selected');
}

/**
 * toggle (show/hide) the emojis menu
 */
function toggleEmojis() {

    /* #10 #add/load #emojis when menu is toggled */
    /*
    var emojis = require('emojis-list');    // It is more #suitable to put this in another function "loadEmojis();"
    $('#emojis').empty();                   // (see below) and call loadEmojis() in the body's onload event listener
    for (emoji in emojis) {
        $('#emojis').append(emojis[emoji]);
    }
    */

    $('#emojis').toggle(); // #toggle
}

/* #10 #add ing #emojis with this function and calling it in the body's onload event listener is more #suitable */
function loadEmojis() {
    var emojis = require('emojis-list');
    $('#emojis').empty();

    // #11 #smiley clicking a smiley adds smiley to message
    for (emoji in emojis) {
        $('<button>')
            .html(emojis[emoji])
                .on('click', function(){clickEmoji(this);})
                    .appendTo('#emojis');
    }
}

/**
 * #11 #smiley clicking a smiley adds smiley to message
 */
function clickEmoji(emoji){
    var maxLength = $('#message').attr('maxlength');
    var counter = $('#message').val().length;

    if(counter < maxLength)
    {
        $('#message').val($('#message').val() + emoji.innerHTML);
        countCharacters();
        toggleEmojis();
        $('#message').focus();
    }
}

/**
 * This constructor function creates a new chat #message.
 * @param text `String` a message text
 * @constructor
 */
function Message(text) {
    // copy my location
    this.createdBy = currentLocation.what3words;
    this.latitude = currentLocation.latitude;
    this.longitude = currentLocation.longitude;
    // set dates
    this.createdOn = new Date() //now
    this.expiresOn = new Date(Date.now() + 15 * 60 * 1000); // mins * secs * msecs
    // set text
    this.text = text;
    // own message
    this.own = true;

    // #11 #update#reference reference of messageElement
    this.messageElement;

    // #11 #update outsource functionality to message object
    this.update = function(){

        var expiresIn = ((this.expiresOn.getTime() - Date.now()) / 60000).toFixed(1);
        var em = this.messageElement.find('em').html(expiresIn + ' min. left');

        // #11 #dying mark remaining time primary colored if shorter than 5 minutes
        if(expiresIn <= 14.6)
        {
            this.messageElement.remove();
            return true;
        }
        else if(expiresIn < 5)
        {
            em.css('color', '#3F51B5');
        }
        else
        {
            em.css('color', 'black');
        }
        return false;
    }
}

/**
 * #11 #interval create interval triggering every ten seconds
 */
function messageUpade()
{
    console.log("Updating message elements...");

    /*
    // #11 #time update remaining time
    $.each(currentChannel.messages, function (index, value) {
        value.update();
    });*/

    // #11 #delete change loop for control over index
    for(index=0; index < currentChannel.messages.length; index++)
    {
         // #11 outsource functionality to message object
         if(currentChannel.messages[index].update())
         {
             currentChannel.messages.splice(index, 1);
             currentChannel.messageCount = currentChannel.messages.length;
             index--;
         }
    }
}

function sendMessage() {

    // #10 only send #messages if text is not #empty
    var text = $('#message').val();
    //check text
    if (text.length == 0) {
        //exit if no text
        alert("Please enter some text");
        return;
    }

    // Creating and logging a message with content from the input field
    var message = new Message(text);
    console.log("New message:", message);

    // #10 #push the new #message to the current channel's messages array
    currentChannel.messages.push(message);

    // #10 #increase the messageCount of the current channel
    currentChannel.messageCount+=1;

    // Adding the message to the messages-div
    $('#messages').append(createMessageElement(message));

    // messages will scroll to a certain point if we apply a certain height, in this case the overall scrollHeight of the messages-div that increases with every message;
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));

    // clear the #message input
    $('#message').val('');
}

/**
 * This function makes an html element out of message objects' properties.
 * @param messageObject a chat message object
 * @returns html element
 */
function createMessageElement(messageObject) {
    // Calculating the expiresIn-time from the expiresOn-property
    // #11 #rework create jQuery messageElement
    var expiresIn = Math.round((messageObject.expiresOn - Date.now()) / 1000 / 60);

    var messageElement = $('<div>').addClass('message')
                                    .addClass(messageObject.own ? ' own' : '');

    var head = $('<h3>').appendTo(messageElement);

    $('<a>').attr('href', 'http://w3w.co/' + messageObject.createdBy + '')
        .attr('target', '_blank')
        .append($('<strong>').html(messageObject.createdBy))
        .appendTo(head);

    head.append(messageObject.createdOn.toLocaleString());
    $('<em>').html(expiresIn + ' min. left').appendTo(head);
    $('<p>').html(messageObject.text).appendTo(messageElement);
    $('<button>').addClass('accent').click(function(){addTime(messageObject)}).html('+5 min.').appendTo(messageElement);                         
    
    // #11 #update#reference reference of messageElement in messageObject
    messageObject.messageElement = messageElement;

    return messageElement;
}

/**
 * #11 #extend message lifetime
 */
function addTime(messageObject)
{
    messageObject.expiresOn = new Date(messageObject.expiresOn.getTime() + 5*60*1000);
    messageObject.update();
}

/**
 * #11 #show create all messages that are saved in a channel object
 */
function showMessages(channelObject){

    $('#messages').empty();

    $.each(channelObject.messages, function (index, value) {
        $('#messages').append(createMessageElement(value));})

   $('#messages').scrollTop($('#messages').prop('scrollHeight'));
}



/* #10 Three #compare functions to #sort channels */
/**
 * #Compares two channels by their amount of messages for #10#sort
 * @param channelA
 * @param channelB
 * @returns {Number} first if < 0
 */
function compareTrending(channelA, channelB) {
    return channelB.messageCount - channelA.messageCount;
}

/**
 * #Compares two channels by their creation date for #10#sort
 * @param channelA
 * @param channelB
 * @returns {number}
 */
function compareNew(channelA, channelB) {
    return channelB.createdOn - channelA.createdOn;
}

/**
 * #Compares two channels by being favorites for #10#sort
 * @param channelA
 * @param channelB
 * @returns {number}
 */
function compareFavorites(channelA, channelB) {
    return channelA.starred ? -1 : 1;
}

function listChannels(criterion) {
    // #10 #sorting: #sort channels#array by the criterion #parameter
    channels.sort(criterion);

    // #10 #sorting #duplicate: empty list
    $('#channels ul').empty();

    /* #10 append channels from #array with a #for loop */
    for (i = 0; i < channels.length; i++) {
        $('#channels ul').append(createChannelElement(channels[i])
            .addClass(channels[i].name == currentChannel.name ? 'selected' : ''));
    };
}

/**
 * #10 #new: This constructor function creates a new channel object.
 * @param name `String` a channel name
 * @constructor
 */
function Channel(name) {
    // copy my location
    this.createdBy = currentLocation.what3words;
    // set dates
    this.createdOn = new Date(); //now
    this.expiresIn = 60; // this is just temporary
    // set name
    this.name = name;
    // set favourite
    this.starred = false;
    // set messages array and message count
    this.messages = [];
    this.messageCount = 0;
}

/**
 * #10 #new
 * This function creates a channel object and pushes it to the global 'channels' array.
 * It also calls the function 'sendMessage()' to deal with the initial message on channel creation.
 */
function createChannel() {
    // #10 #new: #name of the channel
    var name = $('#new-channel').val();
    //initial message
    var text = $('#message').val();
    // Check whether channel #name input field is #valid.
    if (name.length == 0 || name.search(" ") > -1 || name.search("#") == -1) {
        alert('Enter valid channel name! ("#" at the beginning, no spaces)');
        return;
        // Check whether message input field is #valid.
    } else if (!text) {
        alert('Enter an initial message!');
        return;
    } else { // #10 #new #store
        // Create new channel object by calling the constructor.
        var channel = new Channel(name);
        // Set new channel as currentChannel.
        currentChannel = channel;
        // Push new channel object to 'channels' array.
        channels.push(channel);
        // Create DOM element of new channel object and append it to channels list.
        $('#channels ul').append(createChannelElement(channel));
        // Log channel creation.
        console.log('New channel: ' + channel);
        // Send initial message.
        sendMessage();
        // Empty channel name input field.
        $('#new-channel').val('');
        // Return to normal view.
        abortCreationMode();
        // #show #new channel's data
        document.getElementById('channel-name').innerHTML = channel.name;
        document.getElementById('channel-location').innerHTML = 'by <a href="http://w3w.co/'
            + channel.createdBy
            + '" target="_blank"><strong>'
            + channel.createdBy
            + '</strong></a>';
    }
}

/**
 * This function creates a new jQuery channel <li> element out of a given object
 * @param channelObject a channel object
 * @returns {HTMLElement}
 */
function createChannelElement(channelObject) {
    /* this HTML is build in jQuery below:
     <li>
     {{ name }}
        <span class="channel-meta">
            <i class="far fa-star"></i>
            <i class="fas fa-chevron-right"></i>
        </span>
     </li>
     */

    // create a channel
    // #11 #channels#click add click event listener and #channels#switch call switchChannel
    var channel = $('<li>').text(channelObject.name)
        .click(function(){switchChannel(channelObject, this);});

    // create and append channel meta
    var meta = $('<span>').addClass('channel-meta').appendTo(channel);

    // The star including star functionality.
    // Since we don't need any further children, we don't need any variables (references)
    $('<i>').addClass('fa-star').addClass(channelObject.starred ? 'fas' : 'far').appendTo(meta);

    // boxes for some additional metadata
    $('<span>').text(channelObject.expiresIn + ' min').appendTo(meta);
    $('<span>').text(channelObject.messageCount + ' new').appendTo(meta);

    // The chevron
    $('<i>').addClass('fas').addClass('fa-chevron-right').appendTo(meta);

    // return the complete channel
    return channel;
}

/**
 * #10 #new: This function enables the "create new channel"-mode
 */
function initCreationMode() {
    //#10 #new: swapping the right app-bar
    $('#app-bar-messages').hide();
    $('#app-bar-create').addClass('show');

    //#10 #new #clear all messages in the container
    $('#messages').empty();

    //#10 #new: swapping "send" with "create" button
    $('#button-send').hide();
    $('#button-create').show();
}

/**
 * #10 #new: This function ends the "create new channel"-mode
 */
function abortCreationMode() {
    //#10 #new: #abort restores the previously selected channel
    $('#app-bar-messages').show();
    $('#app-bar-create').removeClass('show');
    $('#button-create').hide();
    $('#button-send').show();
}

/**
 * #11 #counter counts characters of message
 */
function countCharacters(){
    var maxLength = $('#message').attr('maxlength');
    var counter = $('#message').val().length;
    $('#character-counter').html(' ' + counter + '/' + maxLength);
}