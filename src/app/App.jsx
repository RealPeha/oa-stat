import React from 'react'

import { GlobalStyle } from './styles'

const App = ({
  children
}) => {
  return (
    <>
      <GlobalStyle />
      {children}
    </>
  );
}

export default App
