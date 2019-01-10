const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.set('port', process.env.PORT || 3001)
var jsonParser = bodyParser.json()
// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('../build/static'))
}
const sqlite3 = require('sqlite3')
const TransactionDatabase = require('sqlite3-transactions').TransactionDatabase
const sqlite = sqlite3.verbose()
const path = 'todoDB'
const todoDB = new TransactionDatabase(new sqlite.Database(path + `sql`))
todoDB.serialize(() => {
    todoDB.run(
        `CREATE TABLE IF NOT EXISTS todo_list(id INTEGER PRIMARY KEY AUTOINCREMENT,todo TEXT, created_date DATE, modified_date DATE, finished INTEGER NOT NULL DEFAULT 0);`
    )
    todoDB.run(
        `CREATE TABLE IF NOT EXISTS reference(id INTEGER, ref INTEGER, primary key (id, ref));`
    )
    todoDB.run(`CREATE INDEX IF NOT EXISTS id ON todo_list(id);`)
})

app.get('/api/list', async (req, res) => {
    res.json(await getList())
})
app.get('/api/finish/:id', async (req, res) => {
    res.json(await finish(req.params.id))
})

app.delete('/api/delete', jsonParser, async (req, res) => {
    res.json(await delTodo(req.body.id))
})

app.post('/api/add', jsonParser, async (req, res) => {
    res.json(await addJob(req.body))
})
app.post('/api/edit', jsonParser, async (req, res) => {
    res.json(await editJob(req.body))
})

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`) // eslint-disable-line no-console
})

async function finish(id) {
    try {
        const isFinished = await finishCheck(id)
        if (!isFinished) {
            return {
                status: 400,
                timestamp: Date.now(),
                error: 'BAD_REQUEST',
                message: `The referenced todo is not completed, and the todo can not be completed.`
            }
        }
        const updateSQL = 'update todo_list set finished = 1 where id = $id'
        await exec(updateSQL, [{ $id: id }])
        return true
    } catch (e) {
        return {
            status: 503,
            timestamp: Date.now(),
            error: 'INTERNAL_SERVER_ERROR',
            message: `Failed toggle finish.`
        }
    }
}
async function finishCheck(id) {
    const query =
        'SELECT todo_list.id, ref FROM todo_list LEFT JOIN reference ON todo_list.id = reference.id where todo_list.id = $id'
    const references = await get(query, { $id: id })
    for (const refer of references) {
        const query = 'SELECT finished FROM todo_list where id = $id'
        const result = await get(query, { $id: refer['ref'] })
        if (result.length === 0) {
            return {
                status: 503,
                timestamp: Date.now(),
                error: 'INTERNAL_SERVER_ERROR',
                message: `The information in the database is not correct.`
            }
        }
        if (!result[0]['finished']) {
            return false
        }
    }
    return true
}

async function delTodo(id) {
    try {
        const todo = await getTodoByID(id)
        if (todo.length < 1) {
            return {
                status: 404,
                timestamp: Date.now(),
                error: 'NOT_FOUND',
                message: `The Todo want to delete was not found in the database.`
            }
        }
        if (todo[0]['finished']) {
            await exec(`DELETE FROM todo_list WHERE id = $id`, [{ $id: id }])
            await exec(`DELETE FROM reference WHERE ref = $ref`, [{ $ref: id }])
            return true
        }
        return {
            status: 400,
            timestamp: Date.now(),
            error: 'BAD_REQUEST',
            message: `Only Finished Todos can be deleted.`
        }
    } catch (e) {
        return {
            status: 503,
            timestamp: Date.now(),
            error: 'INTERNAL_SERVER_ERROR',
            message: `An error occurred while attempting to delete from the database.`
        }
    }
}

async function getList() {
    try {
        const query = 'SELECT * FROM todo_list'
        const result = await get(query)
        await setReferences(result)
        return result
    } catch (e) {
        return {
            status: 503,
            timestamp: Date.now(),
            error: 'INTERNAL_SERVER_ERROR',
            message: `Failed get Todo list from database.`
        }
    }
}

async function setReferences(todoList) {
    const query =
        'SELECT todo_list.id, ref FROM todo_list LEFT JOIN reference ON todo_list.id = reference.id where todo_list.id = $id'
    for (const todo of todoList) {
        todo.references = []
        const references = await get(query, { $id: todo.id })
        for (const reference of references) {
            todo.references.push(reference['ref'])
        }
    }
}

async function addJob(param) {
    try {
        for (const reference of param.references) {
            const check = await getTodoByID(reference)
            if (check.length === 0) {
                return {
                    status: 400,
                    timestamp: Date.now(),
                    error: 'BAD_REQUEST',
                    message: `The ID(${reference}) of the referenced job does not exist.`
                }
            }
        }
        const insertSQL =
            'INSERT OR REPLACE INTO todo_list (todo, created_date, modified_date) VALUES ($todo, $created_date, $modified_date)'
        const insertParam = {
            $todo: param.todo,
            $created_date: Date.now(),
            $modified_date: Date.now()
        }
        await exec(insertSQL, [insertParam])
        const id = await getLastID()
        if (id === undefined) {
            return {
                status: 503,
                timestamp: Date.now(),
                error: 'INTERNAL_SERVER_ERROR',
                message: `Failed while get last rowid.`
            }
        }
        if (param.references !== undefined) {
            await addReferences(id, param.references)
        }
        return id
    } catch (e) {
        console.error(`Failed to addJob : ${e}`)
        return {
            status: 503,
            timestamp: Date.now(),
            error: 'INTERNAL_SERVER_ERROR',
            message: `Failed put new job to database.`
        }
    }
}

async function editJob(param) {
    try {
        const id = param.id
        for (const reference of param.references) {
            const check = await getTodoByID(reference)
            if (check.length === 0) {
                return {
                    status: 400,
                    timestamp: Date.now(),
                    error: 'BAD_REQUEST',
                    message: `The ID(${reference}) of the referenced job does not exist.`
                }
            }
        }
        let updateSQL = 'update todo_list set todo = $todo, modified_date = $modified_date where id = $id'
        const modifiedDate = Date.now()
        await exec(updateSQL, [{ $id: id, $todo: param.todo, $modified_date: Date.now() }])
        // 레퍼런스 잡 다 불러와서 삭제하고 다시 넣기
        await exec(`DELETE FROM reference WHERE id = $id`, [{ $id: id }])
        await addReferences(id, param.references)
        return modifiedDate
    } catch (e) {
        console.error(`Failed to editJob : ${e}`)
        return {
            status: 503,
            timestamp: Date.now(),
            error: 'INTERNAL_SERVER_ERROR',
            message: `Failed edit todo data to database.`
        }
    }
}

function addReferences(id, references) {
    const insertSQL =
        'INSERT OR REPLACE INTO reference (id, ref) VALUES ($id, $ref)'
    const insertParams = []
    for (const reference of references) {
        insertParams.push({
            $id: id,
            $ref: reference
        })
    }
    return exec(insertSQL, insertParams)
}

async function getTodoByID(id) {
    const param = { $id: id }
    const query = 'SELECT id, finished FROM todo_list WHERE id = $id'
    return get(query, param)
}

async function getLastID() {
    const query = 'SELECT last_insert_rowid()'
    const result = await get(query)
    if (result === undefined) {
        return undefined
    }
    return result[0]['last_insert_rowid()']
}

function get(query, param = {}) {
    return new Promise(async (resolve, reject) => {
        todoDB.all(query, param, (err, rows) => {
            if (err) {
                reject(err)
            }
            resolve(rows)
        })
    })
}

function exec(query, params) {
    return new Promise((resolve, reject) => {
        const insert = todoDB.prepare(query, err => {
            if (err) {
                reject(err)
            }
            todoDB.parallelize(() => {
                for (const param of params) {
                    insert.run(param)
                }
            })
            insert.finalize(async error => {
                if (error) {
                    reject(error)
                }
                resolve()
            })
        })
    })
}
