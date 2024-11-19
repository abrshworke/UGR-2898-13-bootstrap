
var tablink = document.getElementsByClassName("tab");
var tabcontent = document.getElementsByClassName("labout");

function opentab(tabname) {
 for (tablinks of tablink) {
      tablinks.classList.remove("first")
 }

 for (tabcontents of tabcontent) {
      tabcontents.classList.remove("tabn")
 }
 event.currentTarget.classList.add("first");
 document.getElementById(tabname).classList.add("tabn");
}
