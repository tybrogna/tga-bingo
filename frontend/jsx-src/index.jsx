import { render } from 'preact'
import { LocationProvider, Router, lazy } from 'preact-iso'

import favicon from './img/favicon25.ico'

import './styles/main.scss'

const Home = lazy(() => import('./pages/Home.jsx'))
const BingoCard = lazy(() => import('./pages/BingoCard.jsx'))
const NewTile = lazy(() => import('./pages/newTile.jsx'))
const DbViewer = lazy(() => import('./pages/DbViewer.jsx'))
const Test = lazy(() => import('./pages/Test.jsx'))
const UserControl = lazy(() => import('./pages/UserControl.jsx'))
// const TileViewer = lazy(() => import('./components/tiles.jsx'))

let App = () => (
    <>
    <link rel="icon" href={favicon} />
    <LocationProvider>
        <Router>
            <Home path='' />
            <BingoCard path='/bingo' />
            <BingoCard path='/bingo/:eventName?/:eventYear?' />
            <DbViewer path='/crudview' />
            <NewTile path='/newtile' />
            <UserControl path='/accounts' />
            <Test path='/test' />
            {/* <Viewer path='/tiles' /> */}
            {/* <YouLost default /> */}
        </Router>
    </LocationProvider>
    </>
)

render(App(), document.querySelector('body'))
