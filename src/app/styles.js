import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Segoe UI Light';
    src:
      url(${require('./SegoeUI-Light.ttf')}) format('truetype');
  }

  @font-face {
    font-family: 'Segoe UI';
    src:
      url(${require('./SegoeUI.ttf')}) format('truetype');
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    font-family: 'Segoe UI Light';
    background-color: rgb(39, 44, 51);
    color: white;
    overflow: hidden;
  }

  #root {
    height: 100%;
    width: 100%;
  }
`
