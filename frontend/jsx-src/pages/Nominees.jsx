import { $, $$$, range, checkMobile, objIsEmpty, delay, elementExists } from "../../js/functionhider.js"
import { signal, computed } from '@preact/signals';
import { useState, useEffect, useRef } from 'preact/hooks'
import { render } from 'preact'
import TopMenuBar from './TopMenuBar.jsx'

import '../styles/nominees.scss'

const draggingGame = signal({})
const dragPickUpGame = signal({})
const selectedGame = signal()
const pickerHighlight = signal()
const displayedRemoveMobile = signal()

const picksFilled = signal(false)
const officialsFilled = signal(false)

const filterNotable = signal(false)
const filterYear = signal(false)
const filterVR = signal(false)
const filterMobile = signal(false)
const filterEarlyAccess = signal(true)

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
        await delay(1000)
        setNominees(nomineeCategories)
        setAllLocked(allLockedStatus)
        picksFilled.value = true
    }, [])


    let saveout
    let update = () => {
        clearTimeout(saveout)
        saveout = setTimeout(() => {
            if (!allLocked) {
                save()
            }
        }, 3000)
        return () => clearTimeout(saveout)
    }


    let mainClasses = mobile ? 'container-mobile' : "noms-container widener"
    let contentClasses = mobile ? "" : "shell pl-1 pr-1"
    let flexClass = mobile ? '' : 'flex'
    let nomineesBoxClasses = mobile ? 'nominees-box-mobile': 'nominees-box'

    return (
    <div id='new-main' class={mainClasses}>
        <title>TGA // Nominee Guesser</title>
        <TopMenuBar />
        <div class={flexClass}>
            <LeftSide mobile={mobile} />
            <>
            <div>
                <div class={nomineesBoxClasses}>
                    {nominees.map(n => 
                        <NomineesRoll category={n} update={update} mobile={mobile} allLocked={allLocked} />
                    )}
                </div>
            </div>
            </>
        </div>
        <HelperOverlay />
    </div>
    )
}

function LeftSide(props) {
    let [ selectedTab, setSelectedTab] = useState(0)
    let [ officialNominees, setOfficialNominees ] = useState([])
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

    useEffect(async () => {
        let officialNomsRes = await fetch('/api/officialNominees/')
        let onoms = await officialNomsRes.json()
        if (onoms.length > 0) {
            let nomineeGamesIds = []
            setOfficialNominees(onoms)
        }
        officialsFilled.value = true
    }, [])

    // useEffect(async () => {
    //     if (officialNominees.length <= 0) {
    //         return
    //     }
    // }, [officialNominees])

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
                <OfficialNomineesRoll official={officialNominees} mobile={props.mobile}/>
            </div>
            <div class={tabContentClass} ref={tabs[2]}>
                <ScoreRoll official={officialNominees} mobile={props.mobile}/>
            </div>
        </div>
    </div>

    )
}

function GamePicker(props) {
    let mobileui = props.mobile
    let [ search, setSearch ] = useState('')
    let [ pickerData, setPickerData ] = useState([])

    let typeout
    useEffect(() => {
        clearTimeout(typeout)
        typeout = setTimeout(() => {
            let url = `/api/igdb/games/search` +
                    `/${filterYear.value},${filterNotable.value},${filterVR.value},false,${filterMobile.value}` +
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
    }, [search, filterYear.value, filterNotable.value, filterVR.value, filterMobile.value])

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
            <input id='filters' type='button' value='Filters...' onClick={e => displayFiltersOverlay()}/>
            <div class={gridOptions}>
                {pickerData.map(g => 
                    <DatabaseBox game={g} mobile={mobileui}/>
                )}
            </div>
        </div>
    )
}

function displayFiltersOverlay(event) {
    $(".helper-overlay").style.display = "block"
}

function hideFiltersOverlay(event) {
    $(".helper-overlay").style.display = "none"
}

function OfficialNomineesRoll(props) {
    let officialClass = 'official-noms'
    if (props.mobile) {
        officialClass += '-mobile'
    }

    useEffect(async () => {
        let nomineeGamesIds = []
        props.official.forEach(on => nomineeGamesIds.concat(on.game_ids))
        nomineeGamesIds = [...new Set(nomineeGamesIds)] // unique games only
        let officialDetailsRes = await fetch('/api/igdb/games/id/' + nomineeGamesIds.toString())
        let officialDetails = officialDetailsRes.json()
    }, [props.official])

    // useEffect(async () => {
    //     let officialNomsRes = await fetch('/api/officialNominees/')
    //     let onoms = await officialNomsRes.json()
    //     if (onoms.length > 0) {
    //         officialNominees.value = onoms
    //         console.log(officialNominees.value)
    //     }
    // }, [])

    // useEffect(async () => {
    //     if (officialNominees.value.length <= 0) {
    //         return
    //     }
    //     let nomineeGamesIds = []
    //     officialNominees.value.forEach(on => nomineeGamesIds.concat(on.game_ids))
    //     nomineeGamesIds = [...new Set(nomineeGames)] // unique games only
    //     let nomGameDataRes = await fetch('/api/igdb/games/id/' + nomineeGamesIds.toString())
    // }, [officialNominees])

    let OfficialRoll = (props) => {
        
    }

    if (props.official.length > 0) {
        return (
            <div>
                {props.official.map(on => OfficialRoll(on))}
            </div>
        )
    } else {
        return <div>Official TGA nominees will go here (when I get around to it sometime after they're posted)</div>
    }

}

function ScoreRoll(props) {
    let [ scoreReady, setScoreReady ] = useState({})

    useEffect(async () => {
        if (officialsFilled.value && picksFilled.value && props.official.length > 0) {
            if (props.mobile) {
                await elementExists('.nominees-box-mobile >:last-child > :last-child > :last-child')
            } else {
                await elementExists('.nominees-box >:last-child > :last-child > :last-child')
            }
            let scores = await calculateScore(props.official)
            setScoreReady(scores)
        }
    }, [officialsFilled.value, picksFilled.value])

    let EachCategoryScore = (props) => 
        Object.entries(scoreReady.categoryScores).map(([key, value]) => {
            let cssSel = `.nominee-roll[name='${key}'] > div`
            if (props.mobile) {
                cssSel = `.nominee-roll-mobile[name='${key}'] > div`
            }
            let txt = $(cssSel).innerHTML
            return (
                <>
                {value >= 0 ? <div>+</div> : <div>-</div>}
                <div style='text-align:end;'>{value}</div>
                <div>{txt}</div>
                </>
            )
        })

    if (scoreReady.hasOwnProperty('total')) {
        let percentage = 100 * (scoreReady.correctPicks/scoreReady.gamesNominated) + '%'
        return (
            <div>
                <div class='percentage-score-grid'>
                    <h4>{scoreReady.correctPicks}</h4>
                    <h4>/</h4>
                    <h4>{scoreReady.gamesNominated}</h4>
                </div>
                <h2 style='text-align:center'>{percentage}</h2>
                <h4 style='text-align:center'>SCORE {scoreReady.total}</h4>
                <div class='sorted-score-grid'>
                    <div>+</div>
                    <div style='text-align: end'>{scoreReady.allCategoriesHaveGuessBonus}</div>
                    <div>One Guess per Category Bonus</div>
                    <div>+</div>
                    <div style='text-align: end'>{scoreReady.allCategoriesHaveCorrectBonus}</div>
                    <div>One Correct per Category Bonus</div>
                    <EachCategoryScore mobile={props.mobile} />
                </div>
            </div>
        )
    } else {
        return ScoreRules(props)
    }
}

function ScoreRules(props) {
    let scoreRollClass = 'score-roll-info-box'
    if (props.mobile) {
        scoreRollClass += '-mobile'
    }
    let text = `Percentage correct is a fairly normal way to determine how well you guessed, 
        but we can do better! Inspired by strange arcade scoring, also intended to create variance
        among participants.`
    let text2 = `Oftentimes, there are universally acclaimed 'frontrunners,' which show up in many categories.
        But there are 6 times 16 for 96 slots required. If you guess a game in a category that's not
        one of the frontrunners, you get a bonus.`
    return (
    <div class={scoreRollClass}>
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
        setGameList([...gameList])
        // if (!objIsEmpty(dragPickedUpFromRemoveButton.value)) {
        //     dragPickedUpFromRemoveButton.value.click()
        // }
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
        // dragPickedUpFromRemoveButton.value = removeEle.current
    }

    let dragEnd = (e) => {
        draggingGame.value = {}
    }

    let mouseOver = (e) => {
        textEle.current.style.visibility = 'visible'
        imgEle.current.style.opacity = '.33'
        if (!props.mobile && !props.categoryLocked) {
            removeEle.current.style.display = 'block'
        }
    }

    let mouseLeave = (e) => {
        textEle.current.style.visibility = 'hidden'
        imgEle.current.style.opacity = ''
        if (!props.mobile && !props.categoryLocked) {
            removeEle.current.style.display = 'none'
        }
    }

    let click = (e) => {
        if (props.mobile) {
            if (displayedRemoveMobile.value != undefined) {
                displayedRemoveMobile.value.style.display = 'none'
                if (displayedRemoveMobile.value == removeEle.current) {
                    displayedRemoveMobile.value = undefined
                    return
                }
            }
            displayedRemoveMobile.value = removeEle.current
            displayedRemoveMobile.value.style.display = 'block'
        }
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

function HelperOverlay(props) {
    return (
    <div class='helper-overlay'>
        <div>
            <div>
                <input type='checkbox' onChange={e => filterYear.value = e.target.checked} />
                <label>Only games released this year, 2026</label>
            </div>
            <div>
                <input type='checkbox' onChange={e => filterNotable.value = e.target.checked} />
                <label>Only show notable games</label>
            </div>
            <div>
                <input type='checkbox' onChange={e => filterVR.value = e.target.checked} />
                <label>Only show games tagged with VR in IGDB</label>
            </div>
            <div>
                <input type='checkbox' onChange={e => filterMobile.value = e.target.checked} />
                <label>Only show games tagged with Mobile in IGDB</label>
            </div>
            <div class='exit-button'>
                <input type='button' value='Exit' onClick={e => hideFiltersOverlay()} />
            </div>
        </div>
    </div>
    )
}

async function calculateScore(official) {
    let scoreObj = {
        total: 0,
        allCategoriesHaveGuessBonus: 0,
        allCategoriesHaveCorrectBonus: 0,
        perfectCategories: 0,
        categoryScores: {},
        gamesNominated: 0,
        correctPicks: 0
    }
    let frontrunners = {}
    official.forEach(on => {
         on.game_ids.forEach(g => {
            if (frontrunners[g] == undefined) {
                frontrunners[g] = 0
            }
            frontrunners[g] += 1
         })
    })
    frontrunners = Object.entries(frontrunners)
        .filter(([k,v]) => v >= 3)
        .map(([k,v]) => k)
    let guessRolls = document.querySelectorAll('.nominee-roll, .nominee-roll-mobile')
    let allCategoriesHaveGuess = true
    let minGuessBonus = 250
    let allCategoriesHaveCorrect = true
    let oneCorrectBonus = 250
    let perfectCategoryBonus = 250
    let unpopularGamePickMulti = .1
    let overPickMulti = .1
    guessRolls.forEach(cat => {
        let numCorrectInCategory = 0
        let curCategoryScore = 0
        let curUnpopMulti = 0
        let catId = cat.getAttribute('name')
        let officialRoll = official.find(o => o.category_id == catId)
        let picks = cat.querySelectorAll('.game-grid > div.game-view, .game-grid-mobile > div.game-view-mobile')
        picks.forEach(choice => {
            let choiceGameId = choice.getAttribute('name')
            let idxOfGuess = officialRoll.game_ids.findIndex(orgid => orgid == choiceGameId)
            if (idxOfGuess >= 0) {
                officialRoll.game_ids[idxOfGuess] = -1 //remove game from official so it cant be guessed again
                let guessScore = 50 + (10 * numCorrectInCategory)
                if (!frontrunners.includes(choiceGameId)) {
                    curUnpopMulti += unpopularGamePickMulti
                }
                numCorrectInCategory += 1
                curCategoryScore += guessScore
                choice.classList.add('correct-guess')
            } else {
                choice.classList.add('incorrect-guess')
            }

        })
        curCategoryScore *= 1 + curUnpopMulti
        scoreObj.gamesNominated += officialRoll.game_ids.length
        scoreObj.correctPicks += numCorrectInCategory

        if (numCorrectInCategory == officialRoll.game_ids.length) {
            curCategoryScore += perfectCategoryBonus
            scoreObj.perfectCategories += 1
        }

        let cap = Math.max(6, officialRoll.game_ids.length)
        if (picks.length > cap) { // minus 10% per pick over
            curCategoryScore *= 1 - ((picks.length - cap) * overPickMulti)
        }

        if (picks.length == 0) {
            allCategoriesHaveGuess = false
            allCategoriesHaveCorrect = false
        }

        if (curCategoryScore == 0) {
            allCategoriesHaveCorrect = false
        }

        scoreObj.categoryScores[catId] = Math.floor(curCategoryScore)
        scoreObj.total += curCategoryScore
    })

    if (allCategoriesHaveGuess) {
        scoreObj.allCategoriesHaveGuessBonus += minGuessBonus
        scoreObj.total += minGuessBonus
    }

    if (allCategoriesHaveCorrect) {
        scoreObj.allCategoriesHaveCorrectBonus += oneCorrectBonus
        scoreObj.total += oneCorrectBonus
    }

    scoreObj.total = scoreObj.total.toFixed(1)

    return scoreObj
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
