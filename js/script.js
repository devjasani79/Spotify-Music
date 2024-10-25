console.log('javascript')

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder){
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
       //show all the songs in the playlist

       let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
       songUL.innerHTML=""
       for (const song of songs) {
           songUL.innerHTML = songUL.innerHTML +
               `<li><img class="invert" src="img/music.svg" alt="music">
                               <div class="info">
                                   <div>${song.replaceAll("%20", " ")}</div>
                                   <div>DevJ</div>
                               </div>
                               <div class="playnow">
                                   <span>Play Now </span>
                                   <img class="invert" src="img/play.svg" alt="play">
                               </div></li>`;
       }
   
   
       //attach event listner to each song
       Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
           e.addEventListener("click", element => {
               playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
           })
       });

       return songs
    
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    
}


async function displayAlbums() {
    console.log("displaying albums");
    
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")  
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for(let index =0; index < array.length;index++){
        const e = array[index];
    

        if (e.href.includes("/songs")&& !e.href.includes(".htaccess")) {
          let folder=  e.href.split("/").slice(-2)[0]
          
          //get meta data
          let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
          let response = await a.json();
          console.log(response);
          cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" fill="#000"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jfif" alt="album cover">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //load the library when the folder is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
         e.addEventListener("click",async item=>{
            console.log("Fetching Songs");
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {
    //get list of songs
    await getSongs()
    playMusic(songs[0], true)

 //display all the albums on the page
 displayAlbums()


    //attach an event listner to next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //add eventlistner to prev and next
    previous.addEventListener("click", () => {
        console.log("Previous clicked");
        let index = songs.indexOf(
            currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })
    //add eventlistner to prev and next
    next.addEventListener("click", () => {
        console.log("Next clicked");


        let index = songs.indexOf(
            currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    //event to vol

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting volume to",e.target.value, "/ 100");
        currentSong.volume=parseInt(e.target.value)/100
        if (currentSong.volume >0) {
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
        
    })

    //add event lsitner to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        
        if(e.target.src.includes("volume.svg")){
            e.target.src= e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume= .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
            
        }
        
    })

}
main()