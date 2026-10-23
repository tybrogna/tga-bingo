import { $, $$$ } from "../../js/functionhider.js"
import { signal, computed } from '@preact/signals';
import { useState, useEffect, useRef } from 'preact/hooks'
import { render } from 'preact'
import TopMenuBar from './TopMenuBar.jsx'

import '../styles/nominees.scss'

const draggingGame = signal({})
let displayStyle = 0

function GameBox(props) {
    let game = props.game
    let art = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.igdb_cover_id}.webp`
    let textEle = useRef(null)
    let imgEle = useRef(null)

    let dragStart = (e) => {
        draggingGame.value = game
    }

    let dragEnd = (e) => {
        draggingGame.value = {}
    }

    let mouseOver = (e) => {
        textEle.current.style.visibility = 'visible'
        imgEle.current.style.opacity = '.33'
    }

    let mouseLeave = (e) => {
        textEle.current.style.visibility = 'hidden'
        imgEle.current.style.opacity = ''
    }

    return (
    <>
    <div name={game.id} class="game-container" onDragStart={dragStart} onDragEnd={dragEnd} onMouseOver={mouseOver} onMouseLeave={mouseLeave}>
        <div class="remove-button" onClick={props.remove}>x</div>
        <div ref={textEle} class="game-title-text">
            {game.name}
        </div>
        <img ref={imgEle} class="game-cover" src={art} />
    </div>
    </>
    )
}

function DatabaseBox(props) {
    let game = props.game
    let art = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.igdb_cover_id}.webp`
    let textEle = useRef(null)
    let imgEle = useRef(null)

    let dragStart = (e) => {
        draggingGame.value = game
    }

    let dragEnd = (e) => {
        draggingGame.value = {}
    }

    let mouseOver = (e) => {
        textEle.current.style.visibility = 'visible'
        imgEle.current.style.opacity = '.33'
    }

    let mouseLeave = (e) => {
        textEle.current.style.visibility = 'hidden'
        imgEle.current.style.opacity = ''
    }

    return (
    <>
    <div name={game.id} class="db-game-container" onDragStart={dragStart} onDragEnd={dragEnd} onMouseOver={mouseOver} onMouseLeave={mouseLeave} >
        <div ref={textEle} class="db-game-title-text">
            {game.name}
        </div>
        <img ref={imgEle} class="db-game-cover" src={art} />
    </div>
    </>
    )
}

function GamePicker(props) {
    return (
        <div class='db-tile-container'>
            {props.games.map(g => 
                <DatabaseBox game={g} />
            )}
        </div>
    )
}

function NomineesList(props) {
    let [ gameList, setGameList ] = useState([])

    useEffect(async () => {
        setGameList(props.category.initGames)
    }, [])

    let onDropLocal = (e) => {
        e.preventDefault()
        setGameList([...gameList, draggingGame.value])
    }

    let removeGameLocal = (e) => {
        let idx = gameList.findIndex(g => g.id == e.target.parentElement.getAttribute('name'))
        gameList.splice(idx, 1)
        setGameList([...gameList])
    }

    return (
        <div class="nominee-container" name={props.category.id}>
            {/* <div style="display:none;">
                {gameList.map(g => (<GameBox game={g} />))}
            </div> */}
            {/* <div class="track-toggle" onclick={swapTrack}></div> */}
            <div style='margin:5px'>
                {props.category.name}
            </div>
            <div class="game-grid" onDragOver={e => e.preventDefault()} onDrop={onDropLocal}>
                {gameList.map(g => (<GameBox game={g} remove={removeGameLocal} />))}
            </div>
        </div>
    )
}

function GameList() {
    let [ nominees, setNominees ] = useState([])
    let [ search, setSearch ] = useState('')
    let [ pickerData, setPickerData ] = useState([])
    let [ options, setOptions ] = useState([])

    useEffect(async () => {
        let nomineesRes = await fetch('/api/nomineeCategories/' + localStorage.getItem('id')) //get everything here??
        let nomineeCategories = await nomineesRes.json()
        let initGameIds = []
        nomineeCategories.forEach(nom => initGameIds = [...initGameIds, ...nom.game_ids])
        let initGamesRes = await fetch('/api/igdb/games/id/' + initGameIds.toString())
        let initGames = await initGamesRes.json()
        nomineeCategories.forEach(nc => {
            let fullGames = []
            nc.game_ids.forEach(gid => fullGames.push(initGames.find(g => g.id == gid)))
            nc.initGames = fullGames
        })
        setNominees(nomineeCategories)
    }, [])

    // useEffect(async () => {

    // }, [pickerData])

    useEffect(() => {
        let type = setTimeout(() => {
            fetch('/api/igdb/games/search/'+ search).then(res => {
                res.json().then(gamesJson => {
                    setPickerData(gamesJson)
                })
            })
        }, 400)
        return () => clearTimeout(type)
    }, [search])

    return (
    <div id="main" className="nom-container widener">
        <div id="content" className="shell pl-1 pr-1">
            <TopMenuBar />
            <div class='flex'>
                <div class='games-db-box'>
                    <input id='search-db' type='text' defaultValue={search} placeholder='search...' onInput={e => setSearch(e.currentTarget.value)}/>
                    <input id='save-test' type='button' value='save' onClick={save}/>
                    <GamePicker games={pickerData} />
                </div>
                <>
                <div>
                    <div style='display: flex; flex-direction: column; overflow: scroll; height: 90vh;'>
                        {nominees.map(n => 
                            <NomineesList category={n} />
                        )}
                    </div>
                </div>
                </>
            </div>
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

async function save() {
    let saveData = {}
    let cats = $$$('.nominee-container')
    saveData.selections = []
    saveData.userId = localStorage.getItem('id')
    cats.forEach(cat => {
        let saveRow = {}
        saveRow.id = cat.getAttribute('name')
        saveRow.games = []
        let choices = cat.querySelectorAll('.game-container')
        choices.forEach(g => {
            saveRow.games.push(g.getAttribute('name'))
        })
        saveData.selections.push(saveRow)
    })
    
    console.log(JSON.stringify(saveData))
    fetch('/api/saveNominees', {
        method: 'post',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(saveData)
    })
}

export default function() {
    render(<GameList />, document.body)
}
