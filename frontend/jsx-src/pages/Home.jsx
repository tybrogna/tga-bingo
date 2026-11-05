import TopMenuBar from './TopMenuBar.jsx'
import LoginWidget from '../components/LoginWidget.jsx'

import '../styles/home.scss'
import previousBingoImage from  '../img/correct25.png'
import bingoImage from  '../img/correct26.png'

export default function Home() {
    return (
    <>
    <title>TGA DOT ZONE</title>
    <meta name="viewport" content="width=device-width, initial-scale=1neon.0" />
    <link rel="icon" href="../img/favicon25.ico" />
    {/* <TopMenuBar /> */}
    <div id="main" className="container widener">
        <TopMenuBar />
        <div id="content" className="shell pl-5 pr-5">
            <LoginWidget />
            <div class='links'>
                <div class='link-card'>
                    <a href='/bingo'>
                        <img src={bingoImage}/>
                        <div>
                            PLAY BINGO (current: TGA 2026)
                        </div>
                    </a>
                </div>
                <div class='link-card'>
                    <a href='/bingo/the game awards/2025'>
                        <img src={previousBingoImage} />
                        <div>
                            PREVIOUS CARD
                        </div>
                    </a>
                </div>
                <div class='link-card'>
                    <a href='/nominees'>
                        <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN_vdlibCnMbPh3tsYfb4yXcsjM5ikyAjrzxKkCXhdHCQdbgd7paLGRG0&s=10' />
                        <div>
                            GUESS NOMINEES
                        </div>
                    </a>
                </div>
            </div>
            {/* <a href='/newtile'>SUBMIT NEW TILE</a> */}
        </div>
    </div>
    </>
    )
}
