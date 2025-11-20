import { render } from 'preact'
import { LocationProvider, Router, lazy } from 'preact-iso'


const BingoCard = lazy(() => import('./components/BingoCard.jsx'))
const NewTile = lazy(() => import('./components/newTile.jsx'))
// const TileViewer = lazy(() => import('./components/tiles.jsx'))

let App = () => (
    <LocationProvider>
        <Router>
            <BingoCard path='/' />
            <NewTile path='/newtile' />
            {/* <Viewer path='/tiles' /> */}
        </Router>
    </LocationProvider>
)

render(App(), document.querySelector('body'))
