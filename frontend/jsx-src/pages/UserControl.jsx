import { render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { $, range, delay } from '../../js/functionhider.js'

import TopMenuBar from './TopMenuBar.jsx'
import LoginWidget from '../components/LoginWidget.jsx'

import '../styles/userControl.scss'

let token

export default function UserControl(props) {
    return (
        <>
        <title>User</title>
        <div id="main" className="container widener">
            <div id="content" className="shell pl-5 pr-5">
                <TopMenuBar />
                <LoginWidget />
            </div>
        </div>
        </>
    )
}
