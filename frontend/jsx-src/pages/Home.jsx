import TopMenuBar from './TopMenuBar.jsx'
import LoginWidget from '../components/LoginWidget.jsx'

export default function Home() {
    return (
        <>
        <title>TGA DOT ZONE</title>
        <link rel="icon" href="../img/favicon25.ico" />
        {/* <TopMenuBar /> */}
        <div id="main" className="container widener">
            <TopMenuBar />
            <div id="content" className="shell pl-5 pr-5">
                <LoginWidget />
                <br />
                <br />
                <div>
                    <a href='/bingo'>PLAY BINGO (current: TGA 2026)</a>
                </div>
                <div>
                    <a href='/bingo/the game awards/2025'>PREVIOUS CARD</a>
                </div>
                <div>
                    <a href='/nominees'>GUESS NOMINEES</a>
                </div>
                <div>
                    <a href='/gamelist'>LIST OF GAMES</a>
                </div>
                {/* <a href='/newtile'>SUBMIT NEW TILE</a> */}
            </div>
        </div>
        </>
    )
}
