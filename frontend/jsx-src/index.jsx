import { render } from 'preact'
import { LocationProvider, Router, lazy } from 'preact-iso'

const BingoCard = lazy(() => import('./components/BingoCard.jsx'))
const NewTile = lazy(() => import('./components/newTile.jsx'))
const DbViewer = lazy(() => import('./components/DbViewer.jsx'))
const Test = lazy(() => import('./components/Test.jsx'))
// const TileViewer = lazy(() => import('./components/tiles.jsx'))

let App = () => (
    <LocationProvider>
        <Router>
            <BingoCard path='/' />
            <BingoCard path='/bingo/current' />
            <BingoCard path='/bingo/:eventName?/:eventYear?' />
            <DbViewer path='/crudview' />
            <NewTile path='/newtile' />
            <Test path='/test' />
            {/* <Viewer path='/tiles' /> */}
            {/* <YouLost default /> */}
        </Router>
    </LocationProvider>
)

render(App(), document.querySelector('body'))
