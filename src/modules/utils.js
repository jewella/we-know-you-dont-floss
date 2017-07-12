'use strict';

module.exports.mixinHandlers = (mixin, handler) => Object.assign({}, mixin, handler);

module.exports.delegateSlotCollection = function() {
  console.log('dialog state', this.event.request.dialogState);
  if (this.event.request.dialogState === 'STARTED') {
    // optionally pre-fill slots: update the intent object with slot values for which
    // you have defaults, then return Dialog.Delegate wit this updated intent in the
    // updatedIntent property.
    var updatedIntent = this.event.request.intent;
    this.emit(':delegate', updatedIntent);
  } else if (this.event.request.dialogState !== 'COMPLETED') {
    // return a Dialog.Delegate directive with no updatedIntent property
    this.emit(':delegate');
  } else {
    console.log('dialog state is completed, returning intent:', this.event.request.intent);
    // Dialog is now complete and all required slots should be filled,
    // so call your normal intent handler.
    return this.event.request.intent;
  }
}

module.exports.isSlotValid = function(slotName) {
  var slot = this.event.request.intent.slots[slotName];
  //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
  //if we have a slot, get the text and store it into speechOutput
  if (slot && slot.value) {
    //we have a value in the slot
    return slot.value;
  } else {
    //we didn't get a value in the slot.
    return false;
  }
}