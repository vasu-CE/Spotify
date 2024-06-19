
let currentSong = new Audio();

let songs;
let currentFolder;
let host = window.location.host; 
let protocol = window.location.protocol;


async function getSongs(folder)
{
    currentFolder = folder;
    
    console.log(host);
    // returns something like '192.168.116.134:61168'
    // let folder = 'your_folder_name';
    let a = await fetch(`${protocol}//${host}/${folder}/`);

    // let a = await fetch(`${protocol}//192.168.116.134:61459/${folder}/`);
    let responce = await a.text();
    // console.log(responce);
    let div = document.createElement('div');
    div.innerHTML = responce;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    songs = [];

    for(let i=0 ; i<as.length ; i++) {
        const element = as[i];
        if(element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

     //show all the songs in the playlist
     let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
     songUL.innerHTML = "";
     for(const song of songs)
        {
            songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="images/music.svg" alt=""> 
                            <div class="info">
                                 <div> ${song}</div>
                                <div>vasu</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="invert" src="images/play.svg" alt="">
                            </div>
                        </li> `;
        }
     
         //Attach event listner to each song
         Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach( e => {
             e.addEventListener('click' , () => {  
                 // console.log(e.querySelector('.info>div').innerHTML)
                 playMusic(e.querySelector('.info>div').innerHTML.trim());
             })
         })
}


function secondToMinut(second) {
    if(isNaN(second) || second<0) {
        return '00:00';
    }
    const minute = Math.floor(second/60);
    const remainSecond = Math.floor(second % 60);

    const formatMinute = String(minute).padStart(2,'0');
    const formatSecond = String(remainSecond).padStart(2,'0');

    return `${formatMinute}:${formatSecond}`;
}
const playMusic = (track,pause=false) => {
    // let audio = new Audio(`/${currentFolder}/` +  track);
    currentSong.src = `/${currentFolder}/` + track;
    if(pause==false) {
        currentSong.play();
        play.src = "images/pause.svg";
    }

    let info = document.querySelector('.songInfo');
        info.innerHTML = track;
        info.style.color = 'black';

    let time = document.querySelector('.songTime');
        time.innerHTML = "00:00 /00:00";
        time.style.color = 'black';
}

async function displayAlbum() {
    // let a = await fetch(`${protocol}//192.168.116.134:61459/song/`);
    let a = await fetch(`${protocol}//${host}/song/`);
    let responce = await a.text();
    // console.log(responce);
    let div = document.createElement('div');
    div.innerHTML = responce;
    // console.log(div);

    let anchor = div.querySelector('#files').getElementsByTagName("a");
    // console.log(anchor);
    let array = Array.from(anchor);

    for(let i=0 ; i<array.length ; i++) {
        const e = array[i];

        if(e.href.includes("/song")) {
            // console.log(e.href);
            // console.log(e.href.split('/').slice(-1)[0]);
            
            let folder  = e.href.split('/').slice(-1)[0];
           
            //get the metadata of the folder
            // let a = await fetch(`${protocol}//192.168.116.134:61459/song/${folder}/info.json`);
            let a = await fetch(`${protocol}//${host}/song/${folder}/info.json`);
            let responce = await a.json();
            // console.log(responce);    

            let cardContainer = document.querySelector('.cardContainer');
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder=${folder} class="card">
                        <div class="img">
                            <img src="/song/${folder}/hero.jpeg" alt="">
                            <div class="play">
                                <img src="images/play2.svg" alt="">
                            </div>
                        </div>
                        <h2>${responce.title}</h2>
                        <p>${responce.description}</p>
                    </div>`   
            
        }
    }

    //load playlist when card touch
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        // console.log(e);
        e.addEventListener('click' ,async item => {
            // console.log( item.currentTarget.dataset.folder);   //show the data-folder 
            songs = await getSongs(`song/${item.currentTarget.dataset.folder}`);
            document.querySelector('.left').style.left = "0";
        })
    })
    
}

async function main() {
    //Get list of all songs
    await getSongs("song/1");
    // console.log(songs);
    
    playMusic(songs[0],true);
    //display all the album on the page 
    displayAlbum();
    //attach event listner to next and previous
    
    play.addEventListener('click' , () => {
        if(currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    })

        //listen for timeUpdate
    currentSong.addEventListener('timeupdate' , () => {
        // console.log(currentSong.currentTime , currentSong.duration);
        document.querySelector('.songTime').innerHTML = 
        `${secondToMinut(currentSong.currentTime)} /
        ${secondToMinut(currentSong.duration)}`

        document.querySelector('.seekBar>.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add event listner to seekbar
    document.querySelector('.seekBar').addEventListener('click' , (e) => {
        // console.log(e.target.getBoundingClientRect());
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.seekBar>.circle').style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) *percent)/100;
    })

    //add eventlistner for hamburger
    document.querySelector('.hamburger').addEventListener('click',() => {
        document.querySelector('.left').style.left = "0";
    })

    //for close
    document.querySelector('.close').addEventListener('click' , () => {
        document.querySelector('.left').style.left = '-100%';
    })

    //for previous
    previous.addEventListener('click' , () => {
        
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index>0) {
            playMusic(songs[index-1]);
        }
    })

    //for next
    next.addEventListener('click' , () => {
        index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if((index+1) < songs.length) {
            playMusic(songs[index+1]);
        }
    })

    //for volume
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change' ,(e)=> {
        // console.log(e);
        currentSong.volume = parseInt(e.target.value)/100;
    })
    let currentVolume;
    volumeImg.addEventListener('click' , ()=> {
        if(currentSong.volume!=0) {
            currentVolume = currentSong.volume;
            currentSong.volume = 0;
            volumeImg.src = "images/novolume.svg";
            document.querySelector('.range').getElementsByTagName('input')[0].value=0;
        }
        else {
            currentSong.volume = currentVolume;
            volumeImg.src = "images/volume.svg";
            document.querySelector('.range').getElementsByTagName('input')[0].value = currentSong.volume;
        }
    })

    
}
main();



