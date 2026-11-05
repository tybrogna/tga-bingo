import { $, $$$, range, checkMobile } from "../../js/functionhider.js"
import { signal, computed } from '@preact/signals';
import { useState, useEffect, useRef } from 'preact/hooks'
import { render } from 'preact'
import TopMenuBar from './TopMenuBar.jsx'

import '../styles/nominees.scss'

const draggingGame = signal({})
const selectedGame = signal()
const pickerHighlight = signal()
const displayedRemoveMobile = signal()

let displayStyle = 0

// TODO: scoring system
// TODO: animations

function NomineesSkeleton(props) {
    let mobile = props.mobile
    let [ nominees, setNominees ] = useState([])
    let [ allLocked, setAllLocked ] = useState()
    let [ changeMade, setChangeMade ] = useState()

    useEffect(async () => { //loads categories and user saved games, either from db or localStorage
        let nomineeCategories, allLockedStatus = true
        if (localStorage.getItem('id') != undefined) { // user signed in, there is somethign in the db
            let url = '/api/nomineeCategories/' + localStorage.getItem('id') + '/'
            let nomineesRes = await fetch(url)
            nomineeCategories = await nomineesRes.json()
            let initGameIds = []
            nomineeCategories.forEach(nom =>
                initGameIds = [...initGameIds, ...nom.game_ids.filter(gid => gid!=null)])
            let initGamesRes = await fetch('/api/igdb/games/id/' + initGameIds.toString())
            let initGames = await initGamesRes.json()
            nomineeCategories.forEach(nc => {
                let fullGames = []
                nc.game_ids.forEach(gid => fullGames.push(initGames.find(g => g.id == gid)))
                nc.game_ids = fullGames
                allLockedStatus = allLockedStatus && nc.locked
            })
        } else if (localStorage.getItem('nomineeSelections') != undefined) { // no user, but someone already played from this browser
            let url = '/api/nomineeCategories/'
            let nomineesRes = await fetch(url)
            nomineeCategories = await nomineesRes.json()
            let initGameIds = []
            let saveData = localStorage.getItem('nomineeSelections')
            saveData = await JSON.parse(saveData)
            saveData.selections.forEach(sel => {
                initGameIds = [...initGameIds, ...sel.games.filter(s => s != "null")]
            })
            let initGamesRes = await fetch('/api/igdb/games/id/' + initGameIds.toString())
            let initGames = await initGamesRes.json()
            nomineeCategories.forEach(nc => {
                let fullGames = []
                let ncSel = saveData.selections.find(s => s.id == nc.id)
                ncSel.games.forEach(gid => {
                    if (gid == 'null') {
                        fullGames.push(null)
                    } else {
                        fullGames.push(initGames.find(g => g.id == gid))
                    }
                })
                nc.game_ids = fullGames
                allLockedStatus = allLockedStatus && nc.locked
            })
        } else {
            let url = '/api/nomineeCategories/'
            let nomineesRes = await fetch(url) //get everything here??
            nomineeCategories = await nomineesRes.json()
            nomineeCategories.forEach(nc => {
                allLockedStatus = allLockedStatus && nc.locked
            })

        }
        setNominees(nomineeCategories)
        setAllLocked(allLockedStatus)
    }, [])


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
            return <meta name="viewport" content="width=device-width, initial-scale=1neon.0" />
        }
    }

    let mainClasses = mobile ? 'container-mobile' : "noms-container widener"
    let contentClasses = mobile ? "" : "shell pl-1 pr-1"
    let flexClass = mobile ? '' : 'flex'
    let nomineesBoxClasses = mobile ? 'nominees-box-mobile': 'nominees-box'

    return (
    <div id='new-main' class={mainClasses}>
        <meta name="viewport" content="width=device-width, initial-scale=1neon.0" />
        {/* <title>TGA // Nominee Guesser</title> */}
        <MobileElement />
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
    </div>
    )

}

function LeftSide(props) {
    let [ selectedTab, setSelectedTab] = useState(0)
    let tabs = [useRef(null), useRef(null), useRef(null)]

    let tabsClass = 'tab-buttons'
    let switcherClass = 'tab-switcher'
    let tabContentClass = 'tab-content'
    if (props.mobile) {
        tabsClass += '-mobile'
        switcherClass += '-mobile'
        tabContentClass += '-mobile'
    }

    useEffect(() => {
        let tabEles = $$$('.' + tabsClass + ' span')
        tabs.forEach((tab, idx) => {
            if (idx == selectedTab) {
                tabEles[idx].classList.add('tab-selected')
                tabEles[idx].classList.remove('tab-unselected')
                tab.current.style = 'display: block'
            } else {
                tabEles[idx].classList.remove('tab-selected')
                tabEles[idx].classList.add('tab-unselected')
                tab.current.style = 'display: none'
            }
        })
    }, [selectedTab])

    return (
    <div>
        <div class={tabsClass}>
            <span onClick={e => setSelectedTab(0)}>Game Picker</span>
            <span onClick={e => setSelectedTab(1)}>Official List</span>
            <span onClick={e => setSelectedTab(2)}>Score</span>
        </div>
        <div class={switcherClass}>
            <div class={tabContentClass} ref={tabs[0]}>
                <GamePicker mobile={props.mobile} />
            </div>
            <div class={tabContentClass} ref={tabs[1]}>
                <OfficialNomineesRoll />
            </div>
            <div class={tabContentClass} ref={tabs[2]}>
                <ScoreRoll />
            </div>
        </div>
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
            {/* <input type='button' value='hide' onClick={e => {e.target.parentElement.style='display:none;'}} /> */}
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
        </div>
    )
}

function OfficialNomineesRoll(props) {
    return <div>Official TGA nominees will go here (when I get around to it sometime after they're posted)</div>
}

function ScoreRoll(props) {
    let text = `Percentage correct is a fairly normal way to determine how well you guessed, 
        but we can do better! Inspired by strange arcade scoring, also intended to create variance
        among participants.`
    let text2 = `Oftentimes, there are universally acclaimed 'frontrunners,' which show up in many categories.
        But there are 6 times 16 for 96 slots required. If you guess a game in a category that's not
        one of the frontrunners, you get a bonus.`
    return (
    <div class='score-roll-info-box'>
        <h3>How to play</h3>
        <h4>or, get a High Score</h4>
        <div>{text}</div>
        <ul>
            <li>Make sure you guess at least one game for each category.</li>
            <li>You get a bonus for getting a game right in each category.</li>
            <li>If you correctly guess all the games in one category, you get a bonus.</li>
            <li>{text2}</li>
            <li>There are 10 slots for your guesses, but only ever six nominees. There's a penalty for each guess over six you make.</li>
        </ul>
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
            pickerHighlight.value.classList.remove('picker-highlight')
        }
        if (props.mobile && displayedRemoveMobile.value != undefined) {
            displayedRemoveMobile.value.style.display = 'none'
        }
        if (selectedGame.value == game) {
            selectedGame.value = undefined
            return
        }
        pickerHighlight.value = frameEle.current
        pickerHighlight.value.classList.add('picker-highlight')
        // pickerHighlight.value.style.background = 'red'
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
        let position = e.target.parentElement.getAttribute('position')
        if (selectedGame.value == undefined) {
            return
        }
        gameList[position] = selectedGame.value
        filledSpots += 1
        setGameList([...gameList])
        props.update()
    }

    let removeGame = (e) => {
        gameList[e.target.parentElement.getAttribute('position')] = undefined
        setGameList([...gameList])
        props.update()
    }

    let Fill = () => gameList.map((g, idx) => {
        if (g != undefined) {
            return <GameBox game={gameList[idx]} position={idx} remove={removeGame} categoryLocked={props.category.locked} mobile={props.mobile}/>
        } else {
            return <Bookend position={idx} mobile={props.mobile} locked={props.category.locked} />
        }
    })

    let Bookend = (props) => {
        let glyph = '+'
        let bookendClasses = 'bookend'

        if (props.locked) {
            glyph = '🔒︎'
            bookendClasses += '-locked'
        }

        if (props.mobile) {
            bookendClasses += '-mobile'
        }
        return (
        <div class={bookendClasses} position={props.position}>
            <div onClick={clickPlus} class='glyph'>{glyph}</div>
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
    let frameEle = useRef(null)
    let removeEle = useRef(null)

    let dragStart = (e) => {
        draggingGame.value = game
    }

    let dragEnd = (e) => {
        draggingGame.value = {}
    }

    let mouseOver = (e) => {
        textEle.current.style.visibility = 'visible'
        imgEle.current.style.opacity = '.33'
        if (!props.mobile) {
            removeEle.current.style.display = 'block'
        }
    }

    let mouseLeave = (e) => {
        textEle.current.style.visibility = 'hidden'
        imgEle.current.style.opacity = ''
        if (!props.mobile) {
            removeEle.current.style.display = 'none'
        }
    }

    let click = (e) => {
        // if (pickerHighlight.value != undefined) {
        //     pickerHighlight.value.style.background = ''
        // }
        // if (props.mobile) {
        //     if (displayedRemoveMobile.value != undefined) {
        //         displayedRemoveMobile.value.style.display = 'none'
        //     }
        //     displayedRemoveMobile.value = removeEle.current
        //     displayedRemoveMobile.value.style.display = 'block'
        // }
        // pickerHighlight.value = frameEle.current
        // pickerHighlight.value.style.background = 'white'
        // selectedGame.value = game
    }
    
    let gameViewClasses = 'game-view'
    let bookendClasses = 'bookend'
    if (props.mobile) {
        gameViewClasses += '-mobile'
        bookendClasses += '-mobile'
    }

    let RemoveButton = () => {
        let removeBtnClasses = 'remove-button'
        if (props.mobile) {
            removeBtnClasses += '-mobile'
        }
        if (props.categoryLocked) {
            return
        } else return <div ref={removeEle} class={removeBtnClasses} onClick={props.remove}>X</div>
    }

    return (
    <>
    <div ref={frameEle} name={game.id} position={props.position} class={gameViewClasses} onClick={click} onDragStart={dragStart} onDragEnd={dragEnd} onMouseOver={mouseOver} onMouseLeave={mouseLeave}>
        <RemoveButton />
        <div ref={textEle} class="game-title-text">
            {game.name}
        </div>
        <img ref={imgEle} class="game-cover" src={art} />
    </div>
    </>
    )
}

async function calculateScore() {
    let officialRolls = {}
    // compile offical rolls
    // put the games less than three noms in a list, those are 'unpopular picks'
    // 
    let guessRolls = $$$('.nominee-roll, .nominee-roll-mobile')
    let totalScore = 0
    let categoryScore = 0
    let numCorrectInCategory = 0
    let allCategoriesHaveAGuess = true
    let allCategoriesHaveOneCorrect = true
    let perfectCategory = false
    let unpopularGamePickBonus = 1.1
    guessRolls.forEach(cat => {
        let categoryName = cat.getAttribute('name')
        let choices = cat.querySelectorAll('.game-grid > div, .game-grid-mobile > div')
        choices.forEach(g => {
            if (g.getAttribute('name') != null) {
                // found a guess, check it against official nominees
                // check off official nominiee so you can't get extra points from guessing e33 six times
                // if its correct
                //   highlight the element somehow
                //   update stats
            }
        })
        // display numCorrectInCategory and categoryScore in approipate boxes
        // update totalScore
        // 
    })

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
    let cats = $$$('.nominee-roll, .nominee-roll-mobile')
    saveData.selections = []

    cats.forEach(cat => {
        let saveRow = {}
        saveRow.id = cat.getAttribute('name')
        saveRow.games = []
        let choices = cat.querySelectorAll('.game-grid > div, .game-grid-mobile > div')
        choices.forEach(g => {
            if (g.getAttribute('name') != null) {
                saveRow.games.push(g.getAttribute('name'))
            } else {
                saveRow.games.push('null')
            }
        })
        saveData.selections.push(saveRow)
    })

    console.log(JSON.stringify(saveData))
    if (localStorage.getItem('id') != undefined) {
        saveData.userId = localStorage.getItem('id')
        fetch('/api/saveNominees', {
            method: 'post',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(saveData)
        })
    } else {
        localStorage.setItem('nomineeSelections', JSON.stringify(saveData))
    }
}

export default function() {
    render(<NomineesSkeleton mobile={checkMobile()}/>, document.body)
}
