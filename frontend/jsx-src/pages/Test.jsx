import { $ } from "../../js/functionhider"
import { signal, computed } from '@preact/signals';
import { useState, useEffect } from 'preact/hooks'
import { render } from 'preact'
import TopMenuBar from './TopMenuBar.jsx'
import SlimSelect from 'slim-select/react'

import 'slim-select/styles'
import '../styles/nominees.scss'

const games = [
    {name: "Rift Wizard 2", fullBox: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7yy8.webp',smallBox: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2058570/header.jpg'},
    {name: "Brush Burial: Gutter World", fullBox: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaqim.webp',smallBox: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3594120/04e2e5ec0340a10312a15cda8f38ad5aa37cc238/header.jpg'},
    {name: "BRAZILIAN DRUG DEALER 3: I OPENED A PORTAL TO HELL IN THE FAVELA TRYING TO REVIVE MIT AIA I NEED TO CLOSE IT", fullBox: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8u39.webp', smallBox: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3594120/04e2e5ec0340a10312a15cda8f38ad5aa37cc238/header.jpg'},
]

const allGames = signal([])

const completedCount = computed(
    () => todos.value.filter(todo => todo.completed).length
);

const newItem = signal('');

function addGame(e) {
    e.preventDefault()
    console.log('add game')
    let newGame = games[Math.floor(Math.random() * 3)]
    allGames.value = [...allGames.value, newGame]
}

function removeGame(index) {
    allGames.value.splice(index, 1);
    allGames.value = [...allGames.value];
}

let displayStyle = 0

function GameBox(props) {
    let game = props.game
    let art = ""
    if (displayStyle == 0) {
        art = game.fullBox
    }
    if (displayStyle == 1) {
        art = game.smallBox
    }
    return (
    <>
    <div class="game-container">
        <div class="game-title-text">
            {game.name}
        </div>
        <img class="game-cover" src={art} />
    </div>
    </>
    )
}

function DatabaseBox(props) {
    let game = props.game
    let art = ""
    if (displayStyle == 0) {
        art = game.fullBox
    }
    if (displayStyle == 1) {
        art = game.smallBox
    }
    return (
    <>
    <div class="db-game-container" onDragStart={(e) => console.log('drag start')} onDragEnd={e => console.log('drag end')}>
        <div class="db-game-title-text">
            {game.name}
        </div>
        <img class="db-game-cover" src={art} />
    </div>
    </>
    )
}

function GameTile(props) {

}

function GameList() {
    let [ pickerData, setPickerData ] = useState([])
    let [ selected, setSelected ] = useState('1')
    let [ options, setOptions ] = useState([])

    useEffect(async () => {
        let gamesRes = await fetch('/api/igdb/games')
        let games = await gamesRes.json()
        // setOptions(games.map((g, idx) => { return {text: g.name, value: String(idx)}}))

        $('.flex').addEventListener('drop', e => {
            e.preventDefault()
            console.log('drop detected')
        })
    }, [])

    let addGameLocal = (e) => {
        e.preventDefault()
        console.log('add game')
        let newGame = games[Math.floor(Math.random() * 3)]
        allGames.value = [...allGames.value, newGame]
    }

    let removeGameLocal = () => {
        allGames.value.splice(allGames.value.length - 1, 1);
        allGames.value = [...allGames.value];
    }

    // useEffect(() => {
    //     console.log(selected)
    // }, [selected])

    // let addOption = () => {
    //     setOptions(options.concat({text:'a new one', value:'lol'}))
    // }

    return (
    <div id="main" className="nom-container widener">
        <div id="content" className="shell pl-1 pr-1">
            <TopMenuBar />
            <div class='flex'>
                <div class='games-db-box'>
                    <input id='search-db' type='text' placeholder='search...' />
                    <div class='db-tile-container'>
                        <DatabaseBox game={{name: "Rift Wizard 2", fullBox: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7yy8.webp',smallBox: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2058570/header.jpg'}} />
                        <DatabaseBox game={{name: "Brush Burial: Gutter World", fullBox: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaqim.webp',smallBox: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3594120/04e2e5ec0340a10312a15cda8f38ad5aa37cc238/header.jpg'}} />
                        <DatabaseBox game={{name: "Rift Wizard 2", fullBox: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7yy8.webp',smallBox: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2058570/header.jpg'}} />
                        <DatabaseBox game={{name: "BRAZILIAN DRUG DEALER 3: I OPENED A PORTAL TO HELL IN THE FAVELA TRYING TO REVIVE MIT AIA I NEED TO CLOSE IT", fullBox: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8u39.webp', smallBox: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3594120/04e2e5ec0340a10312a15cda8f38ad5aa37cc238/header.jpg'}} />
                        <DatabaseBox game={{name: "Brush Burial: Gutter World", fullBox: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaqim.webp',smallBox: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3594120/04e2e5ec0340a10312a15cda8f38ad5aa37cc238/header.jpg'}} />
                        <DatabaseBox game={{name: "BRAZILIAN DRUG DEALER 3: I OPENED A PORTAL TO HELL IN THE FAVELA TRYING TO REVIVE MIT AIA I NEED TO CLOSE IT", fullBox: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8u39.webp', smallBox: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3594120/04e2e5ec0340a10312a15cda8f38ad5aa37cc238/header.jpg'}} />
                    </div>
                </div>
                <>
                <div>
                    <div class="nominee-container" >
                        <div id="personal-track" style="display:none;">
                            {allGames.value.map(g => (<GameBox game={g} />))}
                        </div>
                        <div class="track-toggle" onclick={swapTrack}></div>
                        <div id="tga-track" class="game-grid" onDragOver={e => e.preventDefault()}>
                            {allGames.value.map(g => (<GameBox game={g} />))}
                        </div>
                    </div>
                    <button onClick={addGameLocal}>test append game</button>
                    <button onClick={removeGameLocal}>test remove game</button>
                </div>
                </>
            </div>
            {/* <SlimSelect id='selele' data={options} value={selected} onChange={setSelected} /> */}
            
        </div>
    </div>
    )
}

function swapTrack() {
    console.log('swapping track')
    // let trackToggle = $('.divider-toggle')
    // let personalTrack = $('#personal-track')
    // let tgaTrack = $('#tga-track')
    // trackToggle.float = "right"
}

function Test() {

    const callForServer = async () => {
        let hwRes = await fetch('/api/helloworld')
        console.log(hwRes)
        let hwJson = await hwRes.text()
        console.log(hwJson)
        $('p').innerHTML = hwJson
    }

    // let shoot = async () => {
    //     let uid = localStorage.getItem('id')

    //     let payload = []
    //     // let nomineeElements = $$$(...)
    //     for (let nom of nominees) {
    //         let vals = [nom.id]
    //         let nomItems = nom.querySelectorAll(...)
    //         for (let selections of nom.)
    //     }
    // }

    return (
    <>
    <title>Bingo: The Game Awards 2024</title>
    <div id="main" className="container widener">
        <TopMenuBar />
        {/* <input type='button' value='send that shit' onClick={shoot} /> */}
    </div>
    </>
    )
}

export default function() {
    render(<GameList />, document.body)
}
