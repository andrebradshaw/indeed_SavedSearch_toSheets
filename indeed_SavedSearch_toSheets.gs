/*/
follow along at https://youtu.be/g17GjV3Lfzs
/*/
function timerTrig(){//lets run this twice per day
  ScriptApp.newTrigger('gmailmsgs')
      .timeBased()
      .everyHours(12)
      .create();
}//all set. perhaps the next step is to combine this with my tool that finds linkedin profile links based on this information.

var id = "YOURsheet_ID_goesHere";
var ss = SpreadsheetApp.openById("id");
var s1 = ss.getSheetByName("Sheet1");

//need a function to handle our groups
function grouped(e,n){
  if(e != null){
    return e[n].toString();
  }else{
    return ''; //empty string
  }
}

function gmailmsgs() {
  var timestamp = new Date();
  var message = GmailApp.getInboxThreads(0, 80); //get the first 25 threads of your inbox

  for(m in message){
    var msg = message[m].getMessages()[0];

    var messageId = msg.getId(); //get its ID
    if(msg.isUnread() === true){
      // Now fetch the same message using that ID.
      var messageById = GmailApp.getMessageById(messageId);
  
      var onelinerBody = messageById.getBody().toString().replace(/\n|\r/g, '');
      
      var currentMessage = grouped(/(ads\.indeed\.com\/Post-Jobs.+)/i.exec(onelinerBody), 1); //lol. oops.
      
      var matchItems = currentMessage.match(/<a href="http.+?<font size="-1">/ig);
      for(i in matchItems){
        var urlLink = grouped(/(http:\/\/www\.indeed\.com\/r\/.+?)"/i.exec(matchItems[i]), 1);
        var firstname = grouped(/\/r\/([a-zA-Z].+?)-([a-zA-Z].+?)\//.exec(urlLink), 1);
        var lastname = grouped(/\/r\/([a-zA-Z].+?)-([a-zA-Z].+?)\//.exec(urlLink), 2);
        var location = grouped(/#000" href="+>\s+(\w+.+?)\s+</i.exec(matchItems[i]), 1);
        var title = grouped(/<\/a><\/font>\s+<br>\s+<span>\s+(\w.+?)\s+</i.exec(matchItems[i]), 1).replace(/,.+/, '').replace(/\s*\/.+/, '').replace(/&amp;|&quot;/g, '');;
        var employer = grouped(/<\/a><\/font>\s+<br>\s+<span>\s+\w.+?\s+<span style="color: #999;">\W+(\w+.+?)\s+<\/span>/i.exec(matchItems[i]), 1).replace(/<\/span>/g, "").replace(/,.+/, '').replace(/&amp;|&quot;/g, '');
        
        var output = new Array([timestamp, urlLink, firstname, lastname, title, employer, location])
        if(firstname != ''){
          var nextRow = s1.getLastRow()+1;
          s1.getRange(nextRow, 1, output.length, output[0].length).setValues(output);  
          
        }//if firstname true
        
      }//for i in matchItems
      
      messageById.markRead();//now we want to mark these msgs as read and only loop through unread msgs in the future. 
    }//if msg is unread
  }//for m in message
}//end of function
