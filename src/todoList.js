import React, { Component } from 'react'
import {
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Dialog,
    DialogContent,
    DialogTitle
} from '@material-ui/core'
import { TextField } from 'material-ui'
import { MuiThemeProvider } from 'material-ui/styles'
import TodoLine from './todoLine'
const update = require('react-addons-update')
class TodoList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            todoList: [],
            page: 0,
            rowsPerPage: 10,
            newJob: false,
            todoName: '',
            todoRef: ''
        }
    }
    componentDidMount() {
        this.getList()
    }

    render() {
        const { rowsPerPage, page } = this.state
        const emptyRows =
            rowsPerPage -
            Math.min(rowsPerPage, this.state.todoList.length - page * rowsPerPage)
        return (
            <div>
                <Grid container style={{ flexGrow: 1 }}>
                    <Grid container direction={'row'} justify={'flex-end'} alignItems={'center'} style={{ margin: '0.5em' }} >
                        <Button variant="outlined" onClick={() => { this.setState({ newJob: true }) }} >Add Todo</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Todo Name</TableCell>
                                    <TableCell>References</TableCell>
                                    <TableCell>Created Date</TableCell>
                                    <TableCell>Modified Date</TableCell>
                                    <TableCell>Finished</TableCell>
                                    <TableCell>Control</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.todoList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(todo => {
                                    return <TodoLine key={todo.id} todo={todo} getListFunction={this.getList} />
                                })}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 48 * emptyRows }}>
                                        <TableCell colSpan={7} />
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        rowsPerPageOptions={[10, 20, 50, 100]}
                                        colSpan={window.matchMedia('(max-width: 600px)').matches ? 4 : 5}
                                        count={this.state.todoList.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onChangePage={this.handleChangePage}
                                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                    />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </Grid>
                </Grid>
                <Dialog open={this.state.newJob} onClose={() => { this.setState({ newJob: false }) }}>
                    <DialogTitle style={{ textAlign: 'center' }}>Add Todo</DialogTitle>
                    <DialogContent>
                        <MuiThemeProvider>
                            <TextField
                                style={{ marginRight: '3%' }}
                                floatingLabelText="Todo Name"
                                floatingLabelFixed={true}
                                autoComplete="off"
                                name="todoName"
                                value={this.state.todoName}
                                onChange={data => { this.handleInputChange(data) }}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        this.addTodo()
                                    }
                                }}
                            />
                        </MuiThemeProvider>
                        <br />
                        <MuiThemeProvider>
                            <TextField style={{ marginRight: '3%' }} floatingLabelText="References"
                                floatingLabelFixed={true} autoComplete="off"
                                name="todoRef"
                                value={this.state.todoRef}
                                onChange={data => { this.handleInputChange(data) }}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        this.addTodo()
                                    }
                                }}
                            />
                        </MuiThemeProvider>

                        <Grid container direction={'row'} justify={'center'} alignItems={'center'}>
                            <Button variant="outlined" style={{ width: '40%' }} onClick={() => { this.setState({ newJob: false }) }} >Cancel</Button>
                            <Button variant="outlined" style={{ width: '40%' }} onClick={() => { this.addTodo(this.state.todoName, this.state.todoRef) }} >Add</Button>
                        </Grid>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
    getList = () => {
        fetch(`/api/list`)
            .then(res => res.json())
            .then(result => {
                if (result.error) {
                    alert(result.message)
                    return
                }
                this.setState({ todoList: update(this.state.todoList, { $splice: [[0, this.state.todoList.length]] }) })
                this.setState({ todoList: update(this.state.todoList, { $push: result }) })
            }, error => {
                console.log(error)
            })
    }

    addTodo = (name, ref) => {
        const referString = ref.split(',')
        const refers = []
        for (const ref of referString) {
            const num = Number(ref)
            if (isNaN(num)) {
                this.setState({ todoRef: '' })
                alert(`Reference should be number type and should be listed with ","`)
                return
            }
            if (ref === '') {
                continue
            }
            refers.push(num)
        }
        sendPost({ todo: name, references: refers }, '/api/add', 'POST').then(result => {
            this.setState({ todoName: '', todoRef: '', newJob: false })
            if (result.error) {
                alert(result.message)
                return
            }
            alert(
                `The Todo(ID:${result}) has been successfully saved to the database.`
            )
            this.getList()
        })
    }

    handleChangePage = (event, page) => {
        this.setState({ page })
    }

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value })
    }

    handleInputChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }
}

export default TodoList
export function sendPost(json, route, method) {
    const headers = new Headers()
    headers.append('Accept', 'application/json')
    headers.append('Content-Type', 'application/json')
    return Promise.resolve(
        fetch(route, {
            method: method,
            headers,
            body: JSON.stringify(json)
        })
            .then(response => response.json())
            .catch(err => {
                console.log(err)
            })
    )
}