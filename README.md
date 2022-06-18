# Sequencer.js
Seuqencer Js Provides sequential execution of javascript functions. It lets you execute stages of tasks & meanwhile you can track success or failures and retry them specifically to complete the stages succesfully.


Licensed under GNU Lesser General Public License v2.1

Usage

 var s=Sequencer.getSequence("user-registration");
 
 
 s.addStage({name: "stage1", times: 1, number: 1, callback: function () {
 Sequencer.getSequence("user-registration").stageThrough("stage1");  //fire mechanism
 return null;
 }});
 
 s.addStage({name: "stage2", times: 1, number: 2, callback: function () {
 Sequencer.getSequence("user-registration").stageThrough("stage2"); //fire mechanism
 return null;
 }});
 
 s.start();
