const tracks = [
  {title:"Midnight City",artist:"The Night Drive",album:"Neon Dreams",duration:"3:42",cover:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=240&h=240&fit=crop",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},
  {title:"Electric Dreams",artist:"Nova Bloom",album:"Electric Dreams",duration:"4:12",cover:"https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=240&h=240&fit=crop",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},
  {title:"Golden Hour",artist:"Sundaze",album:"Warm Light",duration:"3:28",cover:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=240&h=240&fit=crop",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"},
  {title:"Slow Motion",artist:"Mira Sol",album:"Soft Focus",duration:"2:58",cover:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=240&h=240&fit=crop&sat=-40",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"},
  {title:"After Hours",artist:"Velvet Echo",album:"After Hours",duration:"3:56",cover:"https://images.unsplash.com/photo-1506157786151-b8491531f063?w=240&h=240&fit=crop",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"},
  {title:"Blue Skies",artist:"Coastline",album:"Open Roads",duration:"4:05",cover:"https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=240&h=240&fit=crop",audio:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"}
];
const audio = document.getElementById("audio");
const trackList = document.getElementById("trackList");
const searchInput = document.getElementById("searchInput");
let currentIndex = 0, isShuffle = false, isRepeat = false, toastTimer;
const liked = new Set(JSON.parse(localStorage.getItem("sonora-liked") || "[]"));
const $ = id => document.getElementById(id);
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2200)}
function saveLikes(){localStorage.setItem("sonora-liked",JSON.stringify([...liked]))}
function timeString(sec){if(!Number.isFinite(sec))return "0:00";return `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,"0")}`}
function renderTracks(list=tracks){
  trackList.innerHTML="";
  if(!list.length){trackList.innerHTML='<div class="empty-state">No tracks found. Try another search.</div>';return}
  list.forEach(track=>{
    const i=tracks.indexOf(track), row=document.createElement("div");
    row.className="track-row"+(i===currentIndex?" playing":"");
    row.innerHTML=`<span class="track-index">${i===currentIndex&&!audio.paused?"♫":String(i+1).padStart(2,"0")}</span>
      <div class="track-info"><img src="${track.cover}" alt=""><div><strong>${track.title}</strong><small>${track.artist}</small></div></div>
      <span class="track-album">${track.album}</span><span class="track-duration">${track.duration}</span>
      <div class="row-actions"><button class="row-like ${liked.has(i)?"liked":""}" data-like="${i}" aria-label="Like ${track.title}">${liked.has(i)?"♥":"♡"}</button><button class="row-play" data-play="${i}" aria-label="Play ${track.title}">▶</button></div>`;
    trackList.appendChild(row);
  });
}
function updatePlayer(){
  const t=tracks[currentIndex];$("currentTitle").textContent=t.title;$("currentArtist").textContent=t.artist;$("currentCover").src=t.cover;
  $("likeCurrent").textContent=liked.has(currentIndex)?"♥":"♡";$("likeCurrent").classList.toggle("liked",liked.has(currentIndex));
  $("playBtn").textContent=audio.paused?"▶":"Ⅱ";$("playBtn").title=audio.paused?"Play":"Pause";
  renderTracks(getVisibleTracks());
}
function getVisibleTracks(){
  const query=searchInput.value.trim().toLowerCase();
  if(document.body.dataset.view==="liked")return tracks.filter((t,i)=>liked.has(i));
  if(!query)return tracks;
  return tracks.filter(t=>`${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(query));
}
function playTrack(index){
  currentIndex=(index+tracks.length)%tracks.length;audio.src=tracks[currentIndex].audio;updatePlayer();
  audio.play().then(()=>updatePlayer()).catch(()=>{updatePlayer();showToast("Press play again if audio did not start. Internet connection may be needed.")});
}
function toggleLike(i){if(liked.has(i))liked.delete(i);else liked.add(i);saveLikes();renderTracks(getVisibleTracks());updateLikeButton();showToast(liked.has(i)?"Added to Liked Songs":"Removed from Liked Songs")}
function updateLikeButton(){$("likeCurrent").textContent=liked.has(currentIndex)?"♥":"♡";$("likeCurrent").classList.toggle("liked",liked.has(currentIndex))}
document.addEventListener("click",e=>{
  const play=e.target.closest("[data-play]");if(play){e.stopPropagation();playTrack(Number(play.dataset.play));return}
  const like=e.target.closest("[data-like]");if(like){toggleLike(Number(like.dataset.like));return}
  const quick=e.target.closest(".quick-pick");if(quick&&!e.target.closest(".quick-play")){playTrack(Number(quick.dataset.track));return}
  const nav=e.target.closest("[data-view]");if(nav){document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n===nav));document.body.dataset.view=nav.dataset.view;
    const titles={home:"Trending right now",search:"Search results",library:"Your library",liked:"Liked Songs",chill:"Late Night Chill",focus:"Deep Focus",energy:"Good Energy"};
    $("trackHeading").textContent=titles[nav.dataset.view]||"Trending right now";
    if(nav.dataset.view==="search")searchInput.focus();renderTracks(getVisibleTracks());return}
});
$("playBtn").addEventListener("click",()=>{if(!audio.src){playTrack(currentIndex);return}if(audio.paused)audio.play().then(updatePlayer).catch(()=>showToast("Could not start audio. Check your connection."));else audio.pause();updatePlayer()});
$("nextBtn").addEventListener("click",()=>playTrack(isShuffle?Math.floor(Math.random()*tracks.length):currentIndex+1));
$("prevBtn").addEventListener("click",()=>{if(audio.currentTime>3){audio.currentTime=0}else playTrack(currentIndex-1)});
$("shuffleBtn").addEventListener("click",()=>{isShuffle=!isShuffle;$("shuffleBtn").style.color=isShuffle?"#b7ff5a":"";showToast(isShuffle?"Shuffle on":"Shuffle off")});
$("repeatBtn").addEventListener("click",()=>{isRepeat=!isRepeat;$("repeatBtn").style.color=isRepeat?"#b7ff5a":"";audio.loop=isRepeat;showToast(isRepeat?"Repeat track on":"Repeat off")});
$("likeCurrent").addEventListener("click",()=>toggleLike(currentIndex));
$("progress").addEventListener("input",e=>{if(Number.isFinite(audio.duration))audio.currentTime=(e.target.value/100)*audio.duration});
audio.addEventListener("timeupdate",()=>{if(Number.isFinite(audio.duration)){$("progress").value=(audio.currentTime/audio.duration)*100;$("currentTime").textContent=timeString(audio.currentTime);$("duration").textContent=timeString(audio.duration)}});
audio.addEventListener("play",updatePlayer);audio.addEventListener("pause",updatePlayer);audio.addEventListener("ended",()=>{if(!isRepeat)playTrack(currentIndex+1)});
$("volume").addEventListener("input",e=>audio.volume=Number(e.target.value));audio.volume=.7;
searchInput.addEventListener("input",()=>{document.body.dataset.view="search";$("trackHeading").textContent=searchInput.value?"Search results":"Trending right now";renderTracks(getVisibleTracks())});
$("showLiked").addEventListener("click",()=>{document.body.dataset.view="liked";$("trackHeading").textContent="Liked Songs";renderTracks(getVisibleTracks());document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view==="liked"))});
$("shuffleAll").addEventListener("click",()=>playTrack(Math.floor(Math.random()*tracks.length)));
$("seeAll").addEventListener("click",()=>{document.querySelector(".tracks-section").scrollIntoView({behavior:"smooth"});showToast("Showing all available tracks")});
$("newPlaylist").addEventListener("click",()=>{const name=prompt("Name your playlist:");if(name&&name.trim())showToast(`“${name.trim()}” playlist idea saved for this session`)});
$("queueBtn").addEventListener("click",()=>showToast("Up next: "+tracks[(currentIndex+1)%tracks.length].title));
$("goBack").addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));$("goForward").addEventListener("click",()=>document.querySelector(".tracks-section").scrollIntoView({behavior:"smooth"}));
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();searchInput.focus()}if(e.code==="Space"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){e.preventDefault();$("playBtn").click()}});
renderTracks();updatePlayer();
