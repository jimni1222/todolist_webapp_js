import React from 'react'
import './App.css'
import Icon from '@material-ui/core/Icon'
import TodoList from './todoList'
function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <Icon style={{ color: 'white' }}>format_list_numbered</Icon> Todo List
          Web Application
        </div>
        <a className="App-link" href="https://github.com/jimni1222" target="_blank" rel="noopener noreferrer">
          Source code
        </a>
      </header>
      <TodoList />
    </div>
  );
}

export default Home
