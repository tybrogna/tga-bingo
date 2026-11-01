import { render } from 'preact'
import { LocationProvider, Router, lazy } from 'preact-iso'

import favicon from './img/favicon26.ico'

import './styles/main.scss'

const Home = lazy(() => import('./pages/Home.jsx'))
const BingoCard = lazy(() => import('./pages/BingoCard.jsx'))
const NewTile = lazy(() => import('./pages/newTile.jsx'))
const DbViewer = lazy(() => import('./pages/DbViewer.jsx'))
const Nominees = lazy(() => import('./pages/Nominees.jsx'))
const UserControl = lazy(() => import('./pages/UserControl.jsx'))

document.documentElement.dataset.year = new Date().getFullYear() % 4

let App = () => (
    <>
    <link rel="icon" href={favicon} />
    <LocationProvider>
        <Router>
            <Home path='/' />
            <BingoCard path='/bingo' />
            <BingoCard path='/bingo/:eventName?/:eventYear?' />
            <DbViewer path='/crudview' />
            <NewTile path='/newtile' />
            <UserControl path='/accounts' />
            <Nominees path='/nominees' />
        </Router>
    </LocationProvider>
    </>
)

render(App(), document.querySelector('body'))
