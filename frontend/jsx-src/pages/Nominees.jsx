import { $, $$$, range, checkMobile } from "../../js/functionhider.js"
import { signal, computed } from '@preact/signals';
import { useState, useEffect, useRef } from 'preact/hooks'
import { render } from 'preact'
import TopMenuBar from './TopMenuBar.jsx'

import '../styles/nominees.scss'

const draggingGame = signal({})
const selectedGame = signal()
const pickerHighlight = signal()

let displayStyle = 0

// TODO: locked view/nominees revealed view
//           clear the picker and repeat the guesser pattern. maybe do custom css to make it 50/50?
// TODO: scoring system
// TODO: css
//           primary game highlighting, remove all these borders, dont need em anymore

function NomineesSkeleton(props) {
    let mobile = props.mobile
    let [ nominees, setNominees ] = useState([])
    let [ allLocked, setAllLocked ] = useState()
    let [ changeMade, setChangeMade ] = useState()

    useEffect(async () => {
        let nomineesRes = await fetch('/api/nomineeCategories/' + localStorage.getItem('id')) //get everything here??
        let nomineeCategories = await nomineesRes.json()
        // console.log(nomineeCategories)
        let initGameIds = []
        nomineeCategories.forEach(nom => initGameIds = [...initGameIds, ...nom.game_ids.filter(gid => gid!=null)])
        // console.log(initGameIds.toString())
        let initGamesRes = await fetch('/api/igdb/games/id/' + initGameIds.toString())
        let initGames = await initGamesRes.json()
        // console.log(initGames)
        let allLockedStatus = true
        nomineeCategories.forEach(nc => {
            let fullGames = []
            nc.game_ids.forEach(gid => fullGames.push(initGames.find(g => g.id == gid)))
            nc.game_ids = fullGames
            allLockedStatus = allLockedStatus && nc.locked
        })
        setNominees(nomineeCategories)
        setAllLocked(allLockedStatus)
    }, [])

    let LeftSide = (props) => {
        if (!allLocked) {
            return <GamePicker mobile={props.mobile}/>
        } else {
            return <div>ya done</div>
        }
    }

    let saveout
    let update = () => {
        clearTimeout(saveout)
        saveout = setTimeout(() => {
            // console.log('saveout')
            save()
        }, 3000)
        return () => clearTimeout(saveout)
    }

    let MobileElement = () => {
        if (mobile) {
            return <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        }
    }

    let mainClasses = mobile ? 'container-mobile' : "noms-container widener"
    let contentClasses = mobile ? "" : "shell pl-1 pr-1"
    let flexClass = mobile ? '' : 'flex'
    let nomineesBoxClasses = mobile ? 'nominees-box-mobile': 'nominees-box'

    return (
    <div id='new-main' class={mainClasses}>
        <MobileElement />
        {/* <div id='content' class={contentClasses}> */}
            <TopMenuBar />
            <div class={flexClass}>
                <LeftSide mobile={mobile} />
                <>
                <div>
                    <div class={nomineesBoxClasses}>
                        {nominees.map(n => 
                            <NomineesRoll category={n} update={update} mobile={mobile} />
                        )}
                    </div>
                </div>
                </>
            </div>
        {/* </div> */}
    </div>
    )

}

function GamePicker(props) {
    let mobileui = props.mobile
    let [ search, setSearch ] = useState('')
    let [ notable, setNotable ] = useState(false)
    let [ thisYear, setThisYear ] = useState(false)
    let [ vr, setVr ] = useState(false)
    let [ remaster, setRemaster ] = useState(false)
    let [ mobile, setMobile ] = useState(false)
    let [ pickerData, setPickerData ] = useState([])

    let typeout
    useEffect(() => {
        clearTimeout(typeout)
        typeout = setTimeout(() => {
            let url = `/api/igdb/games/search` +
                    `/${thisYear},${notable},${vr},${remaster},${mobile}` +
                    `/${search}`

            fetch(url).then(res => {
                res.json().then(gamesJson => {
                    setPickerData(gamesJson)
                    selectedGame.value = undefined
                    if (pickerData.value != undefined) {
                        pickerHighlight.value.style.background = ''
                    }
                })
            })
        }, 1000)
        return () => clearTimeout(typeout)
    }, [search])

    let majorClass = 'games-db-grid'
    let gridOptions = 'db-tile-grid-options'
    if (mobileui) {
        majorClass += '-mobile'
        gridOptions += '-mobile'
    }

    return (
        <div class={majorClass}>
            <input type='button' value='hide' onClick={e => {e.target.parentElement.style='display:none;'}} />
            <input id='search-db' type='text' defaultValue={search} placeholder='search...' onInput={e => setSearch(e.currentTarget.value)}/>
            {/* <div>
                <label>notable?</label>
                <input id='notable-checkbox' type='checkbox' onInput={e => {setNotable(e.target.value)}}/>
                <label>this year?</label>
                <input id='year-checkbox' type='checkbox' onInput={e => {setThisYear(e.target.checked)}}/>
            </div> */}
            <div class={gridOptions}>
                {pickerData.map(g => 
                    <DatabaseBox game={g} mobile={mobileui}/>
                )}
            </div>
            {/* <GamePicker games={pickerData} /> */}
        </div>

    )
}

/**
 * Games that are in the picker list. They have fewer features
 * @param {*} props 
 * @returns 
 */
function DatabaseBox(props) {
    let game = props.game
    let mobileui = props.mobile
    let art = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.igdb_cover_id}.webp`
    let frameEle = useRef(null)
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

    let click = (e) => {
        if (pickerHighlight.value != undefined) {
            pickerHighlight.value.style.background = ''
        }
        pickerHighlight.value = frameEle.current
        pickerHighlight.value.style.background = 'red'
        selectedGame.value = game
    }

    let gameViewClasses = 'db-game-view'
    if (mobileui) {
        gameViewClasses += '-mobile'
    }

    return (
    <>
    <div ref={frameEle} name={game.id} class={gameViewClasses} onClick={click} onDragStart={dragStart} onDragEnd={dragEnd} onMouseOver={mouseOver} onMouseLeave={mouseLeave} >
        <div ref={textEle} class="db-game-title-text">
            {game.name}
        </div>
        <img ref={imgEle} class="db-game-cover" src={art} />
    </div>
    </>
    )
}

function NomineesRoll(props) {
    let [ gameList, setGameList ] = useState([])
    let filledSpots = 0

    useEffect(async () => {
        range(10).forEach(idx => {
            if (props.category.game_ids[idx] != undefined) {
                gameList[idx] = props.category.game_ids[idx]
            } else {
                gameList[idx] = undefined
            }
        })
        setGameList([...gameList])

        // setGameList(props.category.initGames)
        // filledSpots += props.category.initGames.length
    }, [])

    let onDropLocal = (e) => {
        let target = e.target
        while (!target.hasAttribute('position')) {
            target = target.parentElement
        }
        if (props.category.locked) {
            return
        }
        let droppedPos = target.getAttribute('position')
        e.preventDefault()

        gameList[droppedPos] = draggingGame.value
        filledSpots += 1
        setGameList([...gameList])
        props.update()
    }

    let clickPlus = (e) => {
        if (props.category.locked) {
            return
        }
        // if (nextIdx >= 10) {
        //     return
        // }
        let position = e.target.parentElement.getAttribute('position')
        if (selectedGame.value == undefined) {
            return
        }
        // e.preventDefault()
        gameList[position] = selectedGame.value
        filledSpots += 1
        setGameList([...gameList])
        props.update()
    }

    let removeGameLocal = (e) => {
        // console.log(e.target)
        // console.log(e.target.parentElement.getAttribute('position'))
        gameList[e.target.parentElement.getAttribute('position')] = undefined
        setGameList([...gameList])
        props.update()
    }

    let Fill = () => gameList.map((g, idx) => {
        if (g != undefined) {
            return <GameBox game={gameList[idx]} position={idx} remove={removeGameLocal} categoryLocked={props.category.locked} mobile={props.mobile}/>
        } else {
            return <Bookend position={idx} mobile={props.mobile} />
        }
    })

    let Bookend = (props) => {
        let bookendClasses = 'bookend'
        if (props.mobile) {
            bookendClasses += '-mobile'
        }
        return (
        <div class={bookendClasses} position={props.position}>
            <div onClick={clickPlus} style='font-size: 4em;'>+</div>
        </div>
        )
    }

    let nomRollClasses = 'nominee-roll'
    let gridClasses = 'game-grid'
    let headerClasses = 'category-header'
    if (props.mobile) {
        nomRollClasses += '-mobile'
        gridClasses += '-mobile'
        headerClasses += '-mobile'
    }

    return (
        <div class={nomRollClasses} name={props.category.id}>
            {/* <div style="display:none;">
                {gameList.map(g => (<GameBox game={g} />))}
            </div> */}
            {/* <div class="track-toggle" onclick={swapTrack}></div> */}
            <div class={headerClasses} style='margin:5px'>
                {props.category.name}
            </div>
            <div class={gridClasses} onDragOver={e => e.preventDefault()} onDrop={onDropLocal}>
                <>
                {Fill()}
                </>
            </div>
        </div>
    )
}

/**
 * Games that are in a nominee list. They have slightly different controls
 * @param {Object} props
 * @param {Object} game - contains named items: id, name, and igdb_cover_id
 * @param {Function} remove - deletes item from parent nominee list
 */
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

    let RemoveButton = () => {
        if (props.categoryLocked) {
            return
        } else return <div class="remove-button" onClick={props.remove}>X</div>
    }

    let gameViewClasses = 'game-view'
    let bookendClasses = 'bookend'
    if (props.mobile) {
        gameViewClasses += '-mobile'
        bookendClasses += '-mobile'
    }

    return (
    <>
    <div name={game.id} position={props.position} class={gameViewClasses} onDragStart={dragStart} onDragEnd={dragEnd} onMouseOver={mouseOver} onMouseLeave={mouseLeave}>
        <RemoveButton />
        <div ref={textEle} class="game-title-text">
            {game.name}
        </div>
        <img ref={imgEle} class="game-cover" src={art} />
    </div>
    </>
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
    if (localStorage.getItem('id') == null) {
        return
    }
    let saveData = {}
    let cats = $$$('.nominee-roll')
    saveData.selections = []
    saveData.userId = localStorage.getItem('id')
    cats.forEach(cat => {
        let saveRow = {}
        saveRow.id = cat.getAttribute('name')
        saveRow.games = []
        let choices = cat.querySelectorAll('.game-grid > div')
        choices.concat(cat.querySelectorAll('.game-grid-mobile > div'))
        choices.forEach(g => {
            if (g.getAttribute('name') != null) {
                saveRow.games.push(g.getAttribute('name'))
            } else {
                saveRow.games.push('null')
            }
        })
        saveData.selections.push(saveRow)
    })
    
    // console.log(JSON.stringify(saveData))
    return
    fetch('/api/saveNominees', {
        method: 'post',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(saveData)
    })
}

export default function() {
    render(<NomineesSkeleton mobile={checkMobile()}/>, document.body)
}
