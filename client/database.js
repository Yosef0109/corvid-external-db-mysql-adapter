const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'mbaghdasaryan',
  host: 'database-1.csxbhznoei2x.us-east-1.rds.amazonaws.com',
  database: 'themachineDB',
  password: 'minas2020',
  port: 5432,
})

exports.select = (table, clause = '', sortClause = '', skip = 0, limit = 1) =>
  query(
    `SELECT * FROM ${table} ${clause} ${sortClause} LIMIT ${skip}, ${limit}`,
    {},
    identity => identity
  )

exports.insert = (table, item) =>
  query(`INSERT INTO ${table} SET ?`, item, () => item)

exports.update = (table, item) =>
  query(
    `UPDATE ${table} SET ? WHERE _id = ${pool.escape(item._id)}`,
    item,
    () => item
  )

exports.deleteOne = (table, itemId) =>
  query(
    `DELETE FROM ${table} WHERE _id = ${pool.escape(itemId)}`,
    {},
    result => result.affectedRows
  )

exports.count = (table, clause) =>
  query(
    `SELECT COUNT(*) FROM ${table} ${clause}`,
    {},
    result => result[0]['COUNT(*)']
  )

exports.describeDatabase = () =>
  query('SHOW TABLES', {}, async result => {
    const tables = result.map(entry => entry[`Tables_in_${sqlConfig.database}`])

    return Promise.all(
      tables.map(async table => {
        const columns = await describeTable(table)

        return {
          table,
          columns
        }
      })
    )
  })

const describeTable = table =>
  query(`DESCRIBE ${table}`, {}, result => {
    return result.map(entry => {
      return {
        name: entry['Field'],
        type: entry['Type'],
        isPrimary: entry['Key'] === 'PRI'
      }
    })
  })

const query = (query, values, handler) =>
  new Promise((resolve, reject) => {
    connection.query(query, values, (err, results, fields) => {
      if (err) {
        console.log(err);
        reject(err)
      }

      resolve(handler(results, fields))
    })
  })
