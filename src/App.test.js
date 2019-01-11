import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { shallow, configure } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import TodoList from './todoList'

configure({ adapter: new Adapter.default() })

describe('App Unit Test', () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn(() => { return { matches: true } })
    })
  })

  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<App />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('renders children when passed in', () => {
    const wrapper = shallow((<App />))
    expect(wrapper.contains(<TodoList />)).toEqual(true)
  })
})