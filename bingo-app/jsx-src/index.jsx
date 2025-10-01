import { render } from 'preact'
import { LocationProvider, Router, lazy } from 'preact-iso'


const BingoCard = lazy(() => import('./components/BingoCard.jsx'))
const NewTile = lazy(() => import('./components/newTile.jsx'))

let App = () => (
    <LocationProvider>
        <Router>
            <BingoCard path='/' />
            <NewTile path='/newtile' />
        </Router>
    </LocationProvider>
)

render(App(), document.querySelector('body'))
