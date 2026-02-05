import '../styles/topMenuBar.css'


let defaultMenuItems = [
    {text: 'Home', link: '/', image: '../img/menu-home-icon.png'},
    {text: 'Bingo', link: '/', image: '../img/menu-bingo-icon.png'},
    {text: 'Nominees', link: '/', image: '../img/menu-noms-icon.png'}
]

function MenuItem(props) {
    return (
        <>
        <img src={props.image} class='menu-image' />
        <div class='menu-item'>
            <a href={props.link}>{props.text}</a>
        </div>
        </>
    )
}

export function TopMenuBar(props) {
    let menuItems = defaultMenuItems.concat(props.menuItems)
    menuItems.push({text: 'Account', link: '/', image: '../img/menu-account-icon.png'})
    return (
        <>
        <div id='header-menu' class='row'>
            <div id='header-menu-items'>
                {menuItems.map((item) => 
                    <MenuItem props={item}/>
                )}
            </div>
        </div>
        </>
    )
}