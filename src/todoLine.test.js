
import React from 'react'
import { shallow } from 'enzyme'
import TodoLine from './todoLine'
import * as enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
enzyme.configure({ adapter: new Adapter.default() })

describe('Todo Line Unit Test', () => {
    it('Shows todo with table row', () => {
        const date = Date.now()
        const todo = {
            id: 1,
            todo: "testTodo1",
            references: [1, 2],
            created_date: date,
            modified_date: date,
            finished: false,
        }
        const wrapper = shallow(<TodoLine todo={todo} />)
        expect(wrapper.state('id')).toEqual(1)
        expect(wrapper.state('todo')).toEqual("testTodo1")
        expect(wrapper.state('references')).toEqual(todo.references.join(', '))
        expect(wrapper.state('created_date')).toEqual(new Date(date).toLocaleString())
        expect(wrapper.state('modified_date')).toEqual(new Date(date).toLocaleString())
        expect(wrapper.state('finished')).toEqual(false)
    })
})