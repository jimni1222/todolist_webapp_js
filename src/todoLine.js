import React, { Component } from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import { Icon } from '@material-ui/core'
import { IconButton, TextField } from 'material-ui'
import { MuiThemeProvider } from 'material-ui/styles'
import { sendPost } from './todoList'
class TodoLine extends Component {
  constructor(props) {
    super(props)
    this.state = {
      id: props.todo.id,
      todo: props.todo.todo,
      references: props.todo.references.join(', '),
      created_date: new Date(props.todo.created_date).toLocaleString(),
      modified_date: new Date(props.todo.modified_date).toLocaleString(),
      finished: props.todo.finished,
      getListFunction: props.getListFunction,
      editMode: false,
      edit_todo: '',
      edit_references: '',
    }
  }
  render() {
    return (
      <TableRow key={this.state.id} hover>
        <TableCell>{this.state.id}</TableCell>

        <TableCell style={{ width: "150px", padding: "0" }}>
          <div style={{ display: `${this.state.editMode ? 'none' : 'block'}` }}>{this.state.todo}</div>
          <MuiThemeProvider>
            <TextField
              name="edit_todo"
              type="text"
              value={this.state.edit_todo}
              onChange={data => { this.handleInputChange(data) }}
              style={{ width: "150px", padding: "0", display: `${this.state.editMode ? 'block' : 'none'}` }}
            />
          </MuiThemeProvider>
        </TableCell>
        <TableCell style={{ width: "150px", padding: "0" }}>
          <div style={{ display: `${this.state.editMode ? 'none' : 'block'}` }}>{this.state.references}</div>
          <MuiThemeProvider>
            <TextField
              name="edit_references"
              type="text"
              value={this.state.edit_references}
              onChange={data => { this.handleInputChange(data) }}
              style={{ width: "150px", padding: "0", display: `${this.state.editMode ? 'block' : 'none'}` }} />
          </MuiThemeProvider>
        </TableCell>

        <TableCell>{this.state.created_date}</TableCell>
        <TableCell>{this.state.modified_date}</TableCell>

        <TableCell>
          {this.state.finished ? 'Finished' : 'Not Finished'}
        </TableCell>

        {this.state.editMode ?
          <TableCell>
            <MuiThemeProvider>
              <IconButton iconStyle={{ color: 'grey', fontSize: '15px' }} onClick={() => { this.setState({ editMode: false }) }}>
                <Icon>undo</Icon>
              </IconButton>
            </MuiThemeProvider>
            <MuiThemeProvider>
              <IconButton iconStyle={{ color: 'grey', fontSize: '15px' }} onClick={() => { this.saveEdit() }}>
                <Icon>save</Icon>
              </IconButton>
            </MuiThemeProvider>
          </TableCell> :
          <TableCell>
            <MuiThemeProvider>
              <IconButton iconStyle={{ color: 'grey', fontSize: '15px' }} onClick={() => { this.setEditMode() }}>
                <Icon>edit</Icon>
              </IconButton>
            </MuiThemeProvider>
            <MuiThemeProvider>
              <IconButton iconStyle={{ color: 'grey', fontSize: '15px', display: `${this.state.finished ? 'none' : 'block'}` }} onClick={() => { this.toggleJob() }}>
                <Icon>check</Icon>
              </IconButton>
            </MuiThemeProvider>
            <MuiThemeProvider>
              <IconButton iconStyle={{ color: 'grey', fontSize: '15px' }} onClick={() => { this.deleteJob() }}>
                <Icon>delete</Icon>
              </IconButton>
            </MuiThemeProvider>
          </TableCell>}
      </TableRow>
    )
  }
  toggleJob = () => {
    fetch(`/api/finish/${this.state.id}`)
      .then(res => res.json())
      .then(result => {
        if (result.error) {
          alert(result.message)
          return
        }
        this.setState({ finished: true })
        alert(`The todo was successfully completed.`)
      }, error => {
        alert(error)
      })
  }
  deleteJob = () => {
    if (!window.confirm(`If you delete this todo now, all data referencing this todo will also be deleted from reference data. If you agree, please continue.`)) {
      return
    }
    sendPost({ id: this.state.id }, '/api/delete', 'DELETE').then(result => {
      if (result.error) {
        alert(result.message)
        return
      }
      alert(`The todo was successfully deleted.`)
      this.state.getListFunction()
    })
  }

  setEditMode = () => {
    this.setState({
      editMode: true,
      edit_todo: this.state.todo,
      edit_references: this.state.references,
    })
  }

  saveEdit = () => {
    const name = this.state.edit_todo
    const referString = this.state.edit_references.split(',')
    const refers = []
    for (const ref of referString) {
      const num = Number(ref)
      if (isNaN(num)) {
        this.setState({ edit_references: this.state.references })
        alert(`Reference should be number type and should be listed with ","`)
        return
      }
      if (ref === '') { continue }
      refers.push(num)
    }
    sendPost({ id: this.state.id, todo: name, references: refers }, '/api/edit', 'POST').then(result => {
      this.setState({ edit_todo: '', edit_references: '', editMode: false })
      if (result.error) {
        alert(result.message)
        return
      }
      alert(`The modification has been successfully saved.`)
      this.setState({ todo: name, references: refers.toString(), modified_date: new Date(result).toLocaleString() })
    })
  }

  handleInputChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }
}
export default TodoLine
