
/* ADMIN LOGIN */

const ADMIN_USER = "admin"
const ADMIN_PASS = "123456"

function adminLogin(){

let u = document.getElementById("adminUser").value
let p = document.getElementById("adminPass").value

if(u === ADMIN_USER && p === ADMIN_PASS){

localStorage.setItem("admin","true")
window.location.href="panel.html"

}else{

alert("Wrong login")

}

}


/* CHECK LOGIN */

if(location.pathname.includes("/admin/panel")){

if(localStorage.getItem("admin") !== "true"){
location.href="login.html"
}

}


/* LOGOUT */

function adminLogout(){

localStorage.removeItem("admin")
location.href="/admin/index.html"

}


/* VIDEO DATABASE */

let videos = JSON.parse(localStorage.getItem("videos")) || []


/* ADD VIDEO */

function addVideo(){

let video = {

id: Date.now(),
title: vTitle.value,
category: vCategory.value,
duration: vDuration.value,
url: vUrl.value,
thumb: vThumb.value,
desc: vDesc.value,
featured: vFeatured.checked

}

videos.push(video)

localStorage.setItem("videos", JSON.stringify(videos))

loadVideos()

}


/* LOAD ADMIN VIDEO LIST */

function loadVideos(){

let list = document.getElementById("videoList")

if(!list) return

list.innerHTML=""

videos.forEach(v=>{

let div = document.createElement("div")

div.innerHTML = `

<div class="vcard">
<img src="${v.thumb}" style="width:100%">
<h4>${v.title}</h4>
<p>${v.category}</p>

<button onclick="deleteVideo(${v.id})">Delete</button>

</div>

`

list.appendChild(div)

})

}

loadVideos()


/* DELETE */

function deleteVideo(id){

videos = videos.filter(v=>v.id!==id)

localStorage.setItem("videos", JSON.stringify(videos))

loadVideos()

}
