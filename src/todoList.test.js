
import React from 'react'
import { shallow } from 'enzyme'
import * as enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import TodoList from "./todoList"
import { fetchMock } from 'fetch-mock'

enzyme.configure({ adapter: new Adapter.default() })

describe('Todo List Unit Test', () => {
    beforeAll(() => {
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => { return { matches: true } })
        })
    })
    it('Shows todo with table row', () => {
        const listMock = fetchMock.mock('/api/list', [
            { id: 1, todo: "test1", references: [], created_date: Date.now(), modified_date: Date.now(), finished: false },
            { id: 2, todo: "test2", references: [1], created_date: Date.now(), modified_date: Date.now(), finished: false }
        ])
        shallow(<TodoList />)
        expect(listMock.called('/api/list')).toBeTrue
    })
})